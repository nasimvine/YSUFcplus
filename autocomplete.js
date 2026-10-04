"use strict";

const YusufAutocomplete = (() => {
    const keywords = [
        "auto",
        "bool",
        "break",
        "case",
        "catch",
        "char",
        "class",
        "const",
        "continue",
        "default",
        "delete",
        "do",
        "double",
        "else",
        "enum",
        "false",
        "float",
        "for",
        "if",
        "int",
        "long",
        "namespace",
        "new",
        "nullptr",
        "private",
        "protected",
        "public",
        "return",
        "short",
        "signed",
        "sizeof",
        "static",
        "struct",
        "switch",
        "template",
        "this",
        "throw",
        "true",
        "try",
        "typedef",
        "typename",
        "unsigned",
        "using",
        "virtual",
        "void",
        "while"
    ];

    const standardLibrary = [
        "cin",
        "cout",
        "cerr",
        "endl",
        "string",
        "vector",
        "array",
        "map",
        "set",
        "unordered_map",
        "unordered_set",
        "pair",
        "sort",
        "reverse",
        "max",
        "min",
        "getline",
        "size",
        "begin",
        "end"
    ];

    function getSuggestions(prefix) {
        if (!prefix) {
            return [];
        }

        const query = prefix.toLowerCase();

        return [
            ...keywords,
            ...standardLibrary
        ]
            .filter(
                item =>
                    item.toLowerCase().startsWith(query)
            )
            .filter(
                (item, index, array) =>
                    array.indexOf(item) === index
            )
            .slice(0, 10);
    }

    function createMenu(editor, suggestions) {
        const existing =
            document.querySelector(".autocomplete-menu");

        existing?.remove();

        if (!suggestions.length) {
            return null;
        }

        const menu = document.createElement("div");

        menu.className = "autocomplete-menu";

        suggestions.forEach((suggestion, index) => {
            const item = document.createElement("div");

            item.className = "autocomplete-item";

            if (index === 0) {
                item.classList.add("selected");
            }

            item.dataset.value = suggestion;

            item.innerHTML = `
                <span class="autocomplete-icon">›</span>
                <span>${suggestion}</span>
            `;

            item.addEventListener("mousedown", event => {
                event.preventDefault();

                insertSuggestion(
                    editor,
                    suggestion
                );

                menu.remove();
            });

            menu.appendChild(item);
        });

        editor.parentElement.appendChild(menu);

        positionMenu(editor, menu);

        return menu;
    }

    function positionMenu(editor, menu) {
        const rect = editor.getBoundingClientRect();
        const parentRect =
            editor.parentElement.getBoundingClientRect();

        menu.style.left =
            `${Math.max(8, rect.left - parentRect.left + 30)}px`;

        menu.style.top =
            `${Math.min(
                rect.height - 40,
                rect.top - parentRect.top + 45
            )}px`;
    }

    function insertSuggestion(editor, suggestion) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;

        const before = editor.value.slice(0, start);
        const after = editor.value.slice(end);

        const match = before.match(
            /[A-Za-z_][A-Za-z0-9_]*$/
        );

        if (!match) {
            return;
        }

        const wordStart =
            start - match[0].length;

        editor.value =
            editor.value.slice(0, wordStart) +
            suggestion +
            after;

        const cursor =
            wordStart + suggestion.length;

        editor.selectionStart = cursor;
        editor.selectionEnd = cursor;

        editor.dispatchEvent(
            new Event("input", { bubbles: true })
        );
    }

    function getCurrentWord(editor) {
        const before =
            editor.value.slice(0, editor.selectionStart);

        const match =
            before.match(
                /[A-Za-z_][A-Za-z0-9_]*$/
            );

        return match ? match[0] : "";
    }

    return {
        getSuggestions,
        createMenu,
        insertSuggestion,
        getCurrentWord
    };
})();

window.YusufAutocomplete = YusufAutocomplete;
