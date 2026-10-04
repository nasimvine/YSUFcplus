"use strict";

const YusufEditor = (() => {
    let editor = null;
    let syntaxLayer = null;
    let lineNumbers = null;
    let currentFile = null;
    let settings = {
        fontSize: 14,
        tabSize: 4
    };

    let history = [];
    let historyIndex = -1;
    let historyTimer = null;

    function init(options = {}) {
        editor = options.editor || document.getElementById("codeEditor");
        syntaxLayer =
            options.syntaxLayer ||
            document.getElementById("syntaxLayer");
        lineNumbers =
            options.lineNumbers ||
            document.getElementById("lineNumbers");

        if (!editor) {
            return;
        }

        editor.addEventListener("input", handleInput);
        editor.addEventListener("scroll", syncScroll);
        editor.addEventListener("keydown", handleKeyDown);
        editor.addEventListener("click", updateCursor);
        editor.addEventListener("keyup", updateCursor);
        editor.addEventListener("select", updateCursor);

        updateSettings();
        updateView();
    }

    function openFile(file) {
        if (!editor || !file) {
            return;
        }

        currentFile = file;

        editor.value = file.content || "";

        history = [editor.value];
        historyIndex = 0;

        updateView();
        updateCursor();
    }

    function getCurrentFile() {
        return currentFile;
    }

    function getValue() {
        return editor ? editor.value : "";
    }

    function setValue(value, saveHistory = true) {
        if (!editor) {
            return;
        }

        editor.value = String(value ?? "");

        if (currentFile) {
            currentFile.content = editor.value;
        }

        if (saveHistory) {
            pushHistory(editor.value);
        }

        updateView();
        updateCursor();
    }

    function handleInput() {
        if (!editor) {
            return;
        }

        if (currentFile) {
            currentFile.content = editor.value;
        }

        clearTimeout(historyTimer);

        historyTimer = setTimeout(() => {
            pushHistory(editor.value);
        }, 250);

        updateView();
        updateCursor();

        document.dispatchEvent(
            new CustomEvent("yusuf-editor-change", {
                detail: {
                    file: currentFile,
                    content: editor.value
                }
            })
        );
    }

    function handleKeyDown(event) {
        if (!editor) {
            return;
        }

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "s"
        ) {
            event.preventDefault();

            document.dispatchEvent(
                new CustomEvent("yusuf-save-request")
            );

            return;
        }

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "f"
        ) {
            event.preventDefault();

            document.dispatchEvent(
                new CustomEvent("yusuf-search-request")
            );

            return;
        }

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "z"
        ) {
            event.preventDefault();

            if (event.shiftKey) {
                redo();
            } else {
                undo();
            }

            return;
        }

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "y"
        ) {
            event.preventDefault();
            redo();

            return;
        }

        if (event.key === "Tab") {
            event.preventDefault();

            insertText(
                " ".repeat(
                    Math.max(1, Number(settings.tabSize) || 4)
                )
            );

            return;
        }

        if (event.key === "Enter") {
            handleEnter(event);
            return;
        }

        if (event.key === "}") {
            handleClosingBrace(event);
        }

        if (event.key === "(") {
            handleAutoPair(event, "(", ")");
            return;
        }

        if (event.key === "[") {
            handleAutoPair(event, "[", "]");
            return;
        }

        if (event.key === "{") {
            handleOpeningBrace(event);
            return;
        }

        if (event.key === '"' || event.key === "'") {
            handleQuote(event);
        }

        if (
            event.key === "." ||
            event.key === ">" ||
            event.key === ":"
        ) {
            setTimeout(showAutocomplete, 0);
        }
    }

    function handleEnter(event) {
        const start = editor.selectionStart;
        const before = editor.value.slice(0, start);

        const currentLineStart =
            before.lastIndexOf("\n") + 1;

        const currentLine = before.slice(
            currentLineStart
        );

        const indentation =
            currentLine.match(/^\s*/)?.[0] || "";

        const trimmed = currentLine.trim();

        let extraIndent = "";

        if (
            trimmed.endsWith("{") ||
            trimmed.endsWith(":")
        ) {
            extraIndent =
                " ".repeat(
                    Math.max(1, Number(settings.tabSize) || 4)
                );
        }

        if (
            trimmed.startsWith("}") &&
            indentation.length >= settings.tabSize
        ) {
            const newIndent =
                indentation.slice(
                    0,
                    Math.max(
                        0,
                        indentation.length -
                            settings.tabSize
                    )
                );

            replaceSelection(
                "\n" + newIndent
            );

            event.preventDefault();
            return;
        }

        if (
            trimmed.endsWith("{") &&
            editor.value.slice(
                start
            ).startsWith("}")
        ) {
            const indent =
                indentation + extraIndent;

            replaceSelection(
                "\n" +
                    indent +
                    "\n" +
                    indentation
            );

            editor.selectionStart -=
                indentation.length + 1;

            editor.selectionEnd =
                editor.selectionStart;

            event.preventDefault();
            return;
        }

        if (
            trimmed.startsWith("}") &&
            indentation.length
        ) {
            const newIndent =
                indentation.slice(
                    0,
                    Math.max(
                        0,
                        indentation.length -
                            settings.tabSize
                    )
                );

            replaceSelection(
                "\n" + newIndent
            );

            event.preventDefault();
            return;
        }

        replaceSelection(
            "\n" + indentation + extraIndent
        );

        event.preventDefault();
    }

    function handleOpeningBrace(event) {
        if (editor.selectionStart !== editor.selectionEnd) {
            return;
        }

        const cursor = editor.selectionStart;
        const nextCharacter =
            editor.value[cursor] || "";

        if (nextCharacter === "}") {
            event.preventDefault();

            replaceSelection("{}");

            editor.selectionStart -= 1;
            editor.selectionEnd =
                editor.selectionStart;

            return;
        }

        setTimeout(() => {
            showAutocomplete();
        }, 0);
    }

    function handleClosingBrace(event) {
        const cursor = editor.selectionStart;

        if (
            editor.selectionStart === editor.selectionEnd &&
            editor.value[cursor] === "}"
        ) {
            event.preventDefault();

            editor.selectionStart += 1;
            editor.selectionEnd =
                editor.selectionStart;
        }
    }

    function handleAutoPair(event, open, close) {
        if (editor.selectionStart !== editor.selectionEnd) {
            return;
        }

        const cursor = editor.selectionStart;
        const next = editor.value[cursor] || "";

        if (next === close) {
            event.preventDefault();

            editor.selectionStart += 1;
            editor.selectionEnd =
                editor.selectionStart;

            return;
        }

        event.preventDefault();

        replaceSelection(open + close);

        editor.selectionStart -= 1;
        editor.selectionEnd =
            editor.selectionStart;
    }

    function handleQuote(event) {
        if (editor.selectionStart !== editor.selectionEnd) {
            return;
        }

        const quote = event.key;
        const cursor = editor.selectionStart;
        const next = editor.value[cursor] || "";

        if (next === quote) {
            event.preventDefault();

            editor.selectionStart += 1;
            editor.selectionEnd =
                editor.selectionStart;

            return;
        }

        event.preventDefault();

        replaceSelection(quote + quote);

        editor.selectionStart -= 1;
        editor.selectionEnd =
            editor.selectionStart;
    }

    function replaceSelection(text) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;

        editor.setRangeText(
            text,
            start,
            end,
            "end"
        );

        if (currentFile) {
            currentFile.content = editor.value;
        }

        pushHistory(editor.value);
        updateView();
        updateCursor();
    }

    function insertText(text) {
        replaceSelection(text);
    }

    function undo() {
        if (historyIndex <= 0) {
            return;
        }

        historyIndex -= 1;

        editor.value =
            history[historyIndex];

        if (currentFile) {
            currentFile.content =
                editor.value;
        }

        updateView();
        updateCursor();
    }

    function redo() {
        if (
            historyIndex >=
            history.length - 1
        ) {
            return;
        }

        historyIndex += 1;

        editor.value =
            history[historyIndex];

        if (currentFile) {
            currentFile.content =
                editor.value;
        }

        updateView();
        updateCursor();
    }

    function pushHistory(value) {
        if (
            history[historyIndex] === value
        ) {
            return;
        }

        history =
            history.slice(
                0,
                historyIndex + 1
            );

        history.push(value);

        if (history.length > 100) {
            history.shift();
        }

        historyIndex =
            history.length - 1;
    }

    function formatCode() {
        if (!editor) {
            return;
        }

        const lines =
            editor.value.split("\n");

        let indentLevel = 0;

        const indentSize =
            Math.max(
                1,
                Number(settings.tabSize) || 4
            );

        const formatted = lines.map((line) => {
            const trimmed = line.trim();

            if (!trimmed) {
                return "";
            }

            if (
                trimmed.startsWith("}") ||
                trimmed.startsWith(");") ||
                trimmed.startsWith("};")
            ) {
                indentLevel =
                    Math.max(
                        0,
                        indentLevel - 1
                    );
            }

            const result =
                " ".repeat(
                    indentLevel * indentSize
                ) + trimmed;

            if (
                trimmed.endsWith("{") &&
                !trimmed.startsWith("//")
            ) {
                indentLevel += 1;
            }

            return result;
        });

        setValue(
            formatted.join("\n")
        );
    }

    function showAutocomplete() {
        if (
            !editor ||
            !window.YusufAutocomplete
        ) {
            return;
        }

        const word =
            YusufAutocomplete.getCurrentWord(
                editor
            );

        const suggestions =
            YusufAutocomplete.getSuggestions(
                word
            );

        if (!suggestions.length) {
            document
                .querySelector(
                    ".autocomplete-menu"
                )
                ?.remove();

            return;
        }

        YusufAutocomplete.createMenu(
            editor,
            suggestions
        );
    }

    function updateView() {
        if (!editor) {
            return;
        }

        updateLineNumbers();
        updateSyntax();
        syncScroll();
        updateStats();
    }

    function updateLineNumbers() {
        if (!lineNumbers || !editor) {
            return;
        }

        const lines =
            editor.value.split("\n");

        lineNumbers.innerHTML = "";

        lines.forEach(
            (_, index) => {
                const line =
                    document.createElement(
                        "div"
                    );

                line.className =
                    "line-number";

                line.dataset.line =
                    String(index + 1);

                line.textContent =
                    String(index + 1);

                line.addEventListener(
                    "dblclick",
                    () => {
                        if (
                            window.YusufDebugger
                        ) {
                            YusufDebugger.toggleBreakpoint(
                                index + 1
                            );
                        }
                    }
                );

                lineNumbers.appendChild(
                    line
                );
            }
        );

        if (
            window.YusufDebugger
        ) {
            YusufDebugger.getBreakpoints()
                .forEach((number) => {
                    const element =
                        lineNumbers.querySelector(
                            `[data-line="${number}"]`
                        );

                    element?.classList.add(
                        "has-breakpoint"
                    );
                });

            const current =
                YusufDebugger.getCurrentLine();

            if (current) {
                lineNumbers
                    .querySelector(
                        `[data-line="${current}"]`
                    )
                    ?.classList.add(
                        "debug-current-line"
                    );
            }
        }
    }

    function updateSyntax() {
        if (!syntaxLayer || !editor) {
            return;
        }

        const code =
            editor.value;

        syntaxLayer.innerHTML =
            highlightCpp(code) +
            "\n";

        syntaxLayer.scrollTop =
            editor.scrollTop;

        syntaxLayer.scrollLeft =
            editor.scrollLeft;
    }

    function highlightCpp(code) {
        const escaped =
            escapeHtml(code);

        const tokenPattern =
            /(&quot;.*?&quot;|&quot;|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/[^\n]*|\/\*[\s\S]*?\*\/|\b(?:auto|bool|break|case|catch|char|class|const|continue|default|delete|do|double|else|enum|false|float|for|if|int|long|namespace|new|nullptr|private|protected|public|return|short|signed|sizeof|static|struct|switch|template|this|throw|true|try|typedef|typename|unsigned|using|virtual|void|while)\b|\b\d+(?:\.\d+)?\b)/g;

        return escaped.replace(
            tokenPattern,
            (token) => {
                if (
                    token.startsWith("//")
                ) {
                    return `<span class="syntax-comment">${token}</span>`;
                }

                if (
                    token.startsWith("/*")
                ) {
                    return `<span class="syntax-comment">${token}</span>`;
                }

                if (
                    token.startsWith('"') ||
                    token.startsWith("'") ||
                    token.includes("&quot;")
                ) {
                    return `<span class="syntax-string">${token}</span>`;
                }

                if (
                    /^\d/.test(token)
                ) {
                    return `<span class="syntax-number">${token}</span>`;
                }

                return `<span class="syntax-keyword">${token}</span>`;
            }
        );
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function syncScroll() {
        if (!editor) {
            return;
        }

        if (syntaxLayer) {
            syntaxLayer.scrollTop =
                editor.scrollTop;

            syntaxLayer.scrollLeft =
                editor.scrollLeft;
        }

        if (lineNumbers) {
            lineNumbers.scrollTop =
                editor.scrollTop;
        }
    }

    function updateCursor() {
        if (!editor) {
            return;
        }

        const position =
            editor.selectionStart;

        const before =
            editor.value.slice(
                0,
                position
            );

        const lines =
            before.split("\n");

        const line =
            lines.length;

        const column =
            lines[lines.length - 1]
                .length + 1;

        const cursorPosition =
            document.getElementById(
                "cursorPosition"
            );

        if (cursorPosition) {
            cursorPosition.textContent =
                `Ln ${line}, Col ${column}`;
        }
    }

    function updateStats() {
        const code =
            editor?.value || "";

        const lines =
            document.getElementById(
                "codeLineCount"
            );

        const chars =
            document.getElementById(
                "codeCharCount"
            );

        if (lines) {
            lines.textContent =
                `${code.split("\n").length} сатр`;
        }

        if (chars) {
            chars.textContent =
                `${code.length} аломат`;
        }
    }

    function updateSettings() {
        if (!editor) {
            return;
        }

        editor.style.fontSize =
            `${settings.fontSize}px`;

        if (syntaxLayer) {
            syntaxLayer.style.fontSize =
                `${settings.fontSize}px`;
        }

        if (lineNumbers) {
            lineNumbers.style.fontSize =
                `${settings.fontSize}px`;
        }
    }

    function setSettings(newSettings = {}) {
        settings = {
            ...settings,
            ...newSettings
        };

        updateSettings();
        updateView();
    }

    function getSettings() {
        return {
            ...settings
        };
    }

    function findText(query, options = {}) {
        if (!editor || !query) {
            return null;
        }

        const code =
            editor.value;

        const start =
            options.from ??
            editor.selectionEnd;

        const caseSensitive =
            Boolean(
                options.caseSensitive
            );

        const source =
            caseSensitive
                ? code
                : code.toLowerCase();

        const target =
            caseSensitive
                ? query
                : query.toLowerCase();

        let index =
            source.indexOf(
                target,
                start
            );

        if (index === -1) {
            index =
                source.indexOf(
                    target
                );
        }

        if (index === -1) {
            return null;
        }

        editor.focus();

        editor.selectionStart =
            index;

        editor.selectionEnd =
            index + query.length;

        updateCursor();

        return {
            start: index,
            end:
                index + query.length
        };
    }

    function replaceText(
        search,
        replacement,
        replaceAll = false
    ) {
        if (
            !editor ||
            !search
        ) {
            return 0;
        }

        const code =
            editor.value;

        if (!replaceAll) {
            const result =
                findText(search);

            if (!result) {
                return 0;
            }

            editor.setRangeText(
                replacement,
                result.start,
                result.end,
                "end"
            );

            handleInput();

            return 1;
        }

        const escaped =
            search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

        const regex =
            new RegExp(
                escaped,
                "g"
            );

        const matches =
            code.match(regex);

        if (!matches) {
            return 0;
        }

        editor.value =
            code.replace(
                regex,
                replacement
            );

        if (currentFile) {
            currentFile.content =
                editor.value;
        }

        pushHistory(editor.value);
        updateView();
        updateCursor();

        return matches.length;
    }

    return {
        init,
        openFile,
        getCurrentFile,
        getValue,
        setValue,
        undo,
        redo,
        formatCode,
        showAutocomplete,
        updateView,
        setSettings,
        getSettings,
        findText,
        replaceText
    };
})();

window.YusufEditor = YusufEditor;
