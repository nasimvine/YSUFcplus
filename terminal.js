"use strict";

const YusufTerminal = (() => {
    let outputElement = null;

    function init() {
        outputElement = document.getElementById("terminalOutput");
    }

    function clear() {
        if (!outputElement) {
            return;
        }

        outputElement.innerHTML = "";
    }

    function write(message, type = "normal") {
        if (!outputElement) {
            return;
        }

        const line = document.createElement("div");

        line.className = `terminal-line terminal-${type}`;

        line.textContent = message;

        outputElement.appendChild(line);

        outputElement.scrollTop = outputElement.scrollHeight;
    }

    function info(message) {
        write(message, "info");
    }

    function success(message) {
        write(message, "success");
    }

    function error(message) {
        write(message, "error");
    }

    function warning(message) {
        write(message, "warning");
    }

    function command(message) {
        write(`$ ${message}`, "command");
    }

    function html(message) {
        if (!outputElement) {
            return;
        }

        const line = document.createElement("div");

        line.className = "terminal-line terminal-html";
        line.innerHTML = message;

        outputElement.appendChild(line);

        outputElement.scrollTop = outputElement.scrollHeight;
    }

    return {
        init,
        clear,
        write,
        info,
        success,
        error,
        warning,
        command,
        html
    };
})();

window.YusufTerminal = YusufTerminal;
