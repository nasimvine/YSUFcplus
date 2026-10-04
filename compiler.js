"use strict";

const YusufCompiler = (() => {
    let stopped = false;

    const cppKeywords = new Set([
        "alignas",
        "alignof",
        "and",
        "asm",
        "auto",
        "bitand",
        "bitor",
        "bool",
        "break",
        "case",
        "catch",
        "char",
        "class",
        "compl",
        "concept",
        "const",
        "consteval",
        "constexpr",
        "constinit",
        "continue",
        "co_await",
        "co_return",
        "co_yield",
        "decltype",
        "default",
        "delete",
        "do",
        "double",
        "else",
        "enum",
        "explicit",
        "export",
        "extern",
        "false",
        "float",
        "for",
        "friend",
        "goto",
        "if",
        "inline",
        "int",
        "long",
        "mutable",
        "namespace",
        "new",
        "noexcept",
        "not",
        "nullptr",
        "operator",
        "or",
        "private",
        "protected",
        "public",
        "register",
        "reinterpret_cast",
        "requires",
        "return",
        "short",
        "signed",
        "sizeof",
        "static",
        "static_assert",
        "static_cast",
        "struct",
        "switch",
        "template",
        "this",
        "thread_local",
        "throw",
        "true",
        "try",
        "typedef",
        "typeid",
        "typename",
        "union",
        "unsigned",
        "using",
        "virtual",
        "void",
        "volatile",
        "wchar_t",
        "while",
        "xor"
    ]);

    function stop() {
        stopped = true;
    }

    function reset() {
        stopped = false;
    }

    function validate(code) {
        const errors = [];
        const source = String(code || "");
        const lines = source.split("\n");

        let braces = 0;
        let parentheses = 0;
        let brackets = 0;

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const cleanLine = removeStringsAndComments(line);

            for (const character of cleanLine) {
                if (character === "{") braces += 1;
                if (character === "}") braces -= 1;

                if (character === "(") parentheses += 1;
                if (character === ")") parentheses -= 1;

                if (character === "[") brackets += 1;
                if (character === "]") brackets -= 1;
            }

            if (braces < 0) {
                errors.push({
                    line: lineNumber,
                    message: "Иштибоҳ: } зиёдатӣ аст."
                });

                braces = 0;
            }

            if (parentheses < 0) {
                errors.push({
                    line: lineNumber,
                    message: "Иштибоҳ: ) зиёдатӣ аст."
                });

                parentheses = 0;
            }

            if (brackets < 0) {
                errors.push({
                    line: lineNumber,
                    message: "Иштибоҳ: ] зиёдатӣ аст."
                });

                brackets = 0;
            }

            const trimmed = cleanLine.trim();

            if (
                trimmed &&
                !trimmed.startsWith("#") &&
                !trimmed.endsWith("{") &&
                !trimmed.endsWith("}") &&
                !trimmed.endsWith(";") &&
                !trimmed.endsWith(":") &&
                !trimmed.startsWith("//") &&
                !trimmed.startsWith("/*") &&
                !trimmed.endsWith("*/") &&
                !/^(if|else|for|while|switch|try|catch)\b/.test(trimmed)
            ) {
                if (
                    /\b(cout|cin|return|int|float|double|char|bool|string)\b/.test(
                        trimmed
                    )
                ) {
                    errors.push({
                        line: lineNumber,
                        message: "Эҳтимол ; дар охири сатр намерасад."
                    });
                }
            }
        });

        if (braces !== 0) {
            errors.push({
                line: findLastRelevantLine(lines),
                message: "Қавсҳои фигурӣ {} мувофиқ нестанд."
            });
        }

        if (parentheses !== 0) {
            errors.push({
                line: findLastRelevantLine(lines),
                message: "Қавсҳои () мувофиқ нестанд."
            });
        }

        if (brackets !== 0) {
            errors.push({
                line: findLastRelevantLine(lines),
                message: "Қавсҳои [] мувофиқ нестанд."
            });
        }

        if (
            source.includes("using namespace std") &&
            !source.includes("#include <iostream>") &&
            /\b(cout|cin|endl)\b/.test(source)
        ) {
            errors.push({
                line: findLine(source, "using namespace std"),
                message: "Барои cout/cin/endl #include <iostream> лозим аст."
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    function compile(code) {
        reset();

        const validation = validate(code);

        if (!validation.valid) {
            return {
                success: false,
                errors: validation.errors,
                output: "",
                message: "Компилятсия қатъ шуд."
            };
        }

        return {
            success: true,
            errors: [],
            output: "",
            message: "Код барои иҷро омода аст."
        };
    }

    async function run(code, input = "") {
        reset();

        const source = String(code || "");
        const validation = validate(source);

        if (!validation.valid) {
            return {
                success: false,
                output: "",
                errors: validation.errors,
                exitCode: 1
            };
        }

        stopped = false;

        await wait(120);

        if (stopped) {
            return {
                success: false,
                stopped: true,
                output: "",
                errors: [],
                exitCode: 130
            };
        }

        const output = simulateProgram(source, String(input || ""));

        await wait(120);

        if (stopped) {
            return {
                success: false,
                stopped: true,
                output,
                errors: [],
                exitCode: 130
            };
        }

        return {
            success: true,
            stopped: false,
            output,
            errors: [],
            exitCode: 0
        };
    }

    function simulateProgram(code, input) {
        const output = [];
        const variables = {};
        const inputValues = input
            .split(/\s+/)
            .map((value) => value.trim())
            .filter(Boolean);

        let inputIndex = 0;

        const source = removeComments(code);

        const coutMatches = [
            ...source.matchAll(
                /\b(?:std::)?cout\s*<<([\s\S]*?)(?=;)/g
            )
        ];

        coutMatches.forEach((match) => {
            if (stopped) {
                return;
            }

            const expression = match[1];

            const parts = splitStreamExpression(expression);

            parts.forEach((part) => {
                const value = evaluateExpression(
                    part,
                    variables,
                    inputValues,
                    () => inputValues[inputIndex++] ?? ""
                );

                if (value !== undefined && value !== null) {
                    output.push(String(value));
                }
            });
        });

        const variablePattern =
            /\b(int|float|double|long|short|char|bool|string)\s+([A-Za-z_]\w*)\s*(?:=\s*([^;]+))?;/g;

        let variableMatch;

        while ((variableMatch = variablePattern.exec(source))) {
            const type = variableMatch[1];
            const name = variableMatch[2];
            const expression = variableMatch[3];

            if (expression) {
                variables[name] = castValue(
                    evaluateExpression(
                        expression,
                        variables,
                        inputValues,
                        () => inputValues[inputIndex++] ?? ""
                    ),
                    type
                );
            } else {
                variables[name] = defaultValue(type);
            }
        }

        const cinMatches = [
            ...source.matchAll(
                /\b(?:std::)?cin\s*>>\s*([A-Za-z_]\w*)/g
            )
        ];

        cinMatches.forEach((match) => {
            const variableName = match[1];

            if (inputIndex < inputValues.length) {
                variables[variableName] = inputValues[inputIndex];
                inputIndex += 1;
            }
        });

        return output.join("");
    }

    function splitStreamExpression(expression) {
        const parts = [];
        let current = "";
        let quote = null;
        let depth = 0;

        for (let index = 0; index < expression.length; index += 1) {
            const character = expression[index];

            if (
                (character === '"' || character === "'") &&
                expression[index - 1] !== "\\"
            ) {
                if (quote === character) {
                    quote = null;
                } else if (!quote) {
                    quote = character;
                }
            }

            if (!quote) {
                if (character === "(") depth += 1;
                if (character === ")") depth -= 1;
            }

            if (
                character === "<" &&
                expression[index + 1] === "<" &&
                !quote &&
                depth === 0
            ) {
                parts.push(current.trim());
                current = "";
                index += 1;
                continue;
            }

            current += character;
        }

        if (current.trim()) {
            parts.push(current.trim());
        }

        return parts;
    }

    function evaluateExpression(
        expression,
        variables = {},
        inputValues = [],
        inputProvider = () => ""
    ) {
        let value = String(expression || "").trim();

        if (!value) {
            return "";
        }

        if (/^(std::)?endl$/.test(value)) {
            return "\n";
        }

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            return value
                .slice(1, -1)
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "\t")
                .replace(/\\"/g, '"')
                .replace(/\\'/g, "'");
        }

        if (value in variables) {
            return variables[value];
        }

        value = value.replace(/\btrue\b/g, "1");
        value = value.replace(/\bfalse\b/g, "0");

        value = value.replace(
            /\b[A-Za-z_]\w*\b/g,
            (name) => {
                if (name in variables) {
                    return String(variables[name]);
                }

                if (cppKeywords.has(name)) {
                    return name;
                }

                return name;
            }
        );

        if (/^[\d\s+\-*/%().]+$/.test(value)) {
            try {
                return Function(`"use strict"; return (${value});`)();
            } catch {
                return value;
            }
        }

        const functionMatch = value.match(
            /^(?:std::)?(max|min)\((.*)\)$/
        );

        if (functionMatch) {
            const functionName = functionMatch[1];
            const argumentsList = functionMatch[2]
                .split(",")
                .map((item) =>
                    Number(
                        evaluateExpression(
                            item,
                            variables,
                            inputValues,
                            inputProvider
                        )
                    )
                );

            return functionName === "max"
                ? Math.max(...argumentsList)
                : Math.min(...argumentsList);
        }

        if (value === "cin") {
            return inputProvider();
        }

        return value;
    }

    function castValue(value, type) {
        if (type === "int") {
            return Number.parseInt(value, 10) || 0;
        }

        if (type === "float" || type === "double") {
            return Number.parseFloat(value) || 0;
        }

        if (type === "bool") {
            return Boolean(value);
        }

        if (type === "char") {
            return String(value || "").charAt(0);
        }

        return value ?? "";
    }

    function defaultValue(type) {
        if (type === "int" || type === "float" || type === "double") {
            return 0;
        }

        if (type === "bool") {
            return false;
        }

        if (type === "char" || type === "string") {
            return "";
        }

        return "";
    }

    function removeStringsAndComments(line) {
        return line
            .replace(/"(?:\\.|[^"\\])*"/g, '""')
            .replace(/'(?:\\.|[^'\\])*'/g, "''")
            .replace(/\/\/.*$/g, "")
            .replace(/\/\*.*?\*\//g, "");
    }

    function removeComments(code) {
        return String(code || "")
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\/\/.*$/gm, "");
    }

    function findLine(code, text) {
        const index = String(code).indexOf(text);

        if (index === -1) {
            return 1;
        }

        return String(code)
            .slice(0, index)
            .split("\n").length;
    }

    function findLastRelevantLine(lines) {
        for (let index = lines.length - 1; index >= 0; index -= 1) {
            if (lines[index].trim()) {
                return index + 1;
            }
        }

        return 1;
    }

    function wait(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    return {
        validate,
        compile,
        run,
        stop,
        reset
    };
})();

window.YusufCompiler = YusufCompiler;
