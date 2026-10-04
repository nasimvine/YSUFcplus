"use strict";

const YusufDebugger = (() => {
    let editor = null;
    let breakpoints = new Set();
    let currentLine = null;
    let running = false;
    let paused = false;
    let variables = {};

    function init(editorElement) {
        editor = editorElement;
        breakpoints = new Set();
        currentLine = null;
        running = false;
        paused = false;
        variables = {};
    }

    function toggleBreakpoint(line) {
        const lineNumber = Number(line);

        if (!Number.isInteger(lineNumber) || lineNumber < 1) {
            return false;
        }

        if (breakpoints.has(lineNumber)) {
            breakpoints.delete(lineNumber);
        } else {
            breakpoints.add(lineNumber);
        }

        renderBreakpoints();

        return breakpoints.has(lineNumber);
    }

    function addBreakpoint(line) {
        const lineNumber = Number(line);

        if (Number.isInteger(lineNumber) && lineNumber > 0) {
            breakpoints.add(lineNumber);
            renderBreakpoints();
        }
    }

    function removeBreakpoint(line) {
        const lineNumber = Number(line);

        breakpoints.delete(lineNumber);
        renderBreakpoints();
    }

    function clearBreakpoints() {
        breakpoints.clear();
        renderBreakpoints();
    }

    function getBreakpoints() {
        return [...breakpoints].sort((a, b) => a - b);
    }

    function setCurrentLine(line) {
        currentLine = Number(line) || null;
        renderCurrentLine();
    }

    function getCurrentLine() {
        return currentLine;
    }

    function setVariable(name, value) {
        if (!name) {
            return;
        }

        variables[String(name)] = value;
    }

    function getVariable(name) {
        return variables[String(name)];
    }

    function getVariables() {
        return { ...variables };
    }

    function clearVariables() {
        variables = {};
    }

    function start() {
        running = true;
        paused = false;

        return getState();
    }

    function pause() {
        if (!running) {
            return getState();
        }

        paused = true;

        return getState();
    }

    function resume() {
        if (!running) {
            return getState();
        }

        paused = false;

        return getState();
    }

    function stop() {
        running = false;
        paused = false;
        currentLine = null;

        renderCurrentLine();

        return getState();
    }

    function stepOver() {
        if (!running) {
            start();
        }

        paused = true;

        const nextLine = findNextExecutableLine(currentLine);

        if (nextLine) {
            currentLine = nextLine;
        }

        renderCurrentLine();

        return getState();
    }

    function stepInto() {
        return stepOver();
    }

    function stepOut() {
        return stepOver();
    }

    function shouldPauseAt(line) {
        return breakpoints.has(Number(line));
    }

    function findNextExecutableLine(line) {
        if (!editor) {
            return null;
        }

        const lines = editor.value.split("\n");
        let start = Number(line) || 0;

        for (let index = start; index < lines.length; index += 1) {
            const content = lines[index].trim();

            if (
                content &&
                !content.startsWith("//") &&
                !content.startsWith("#")
            ) {
                return index + 1;
            }
        }

        return null;
    }

    function renderBreakpoints() {
        const container = document.getElementById("lineNumbers");

        if (!container) {
            return;
        }

        const lines = container.querySelectorAll(".line-number");

        lines.forEach((lineElement) => {
            const number = Number(lineElement.dataset.line);

            lineElement.classList.toggle(
                "has-breakpoint",
                breakpoints.has(number)
            );
        });
    }

    function renderCurrentLine() {
        const container = document.getElementById("lineNumbers");

        if (!container) {
            return;
        }

        const lines = container.querySelectorAll(".line-number");

        lines.forEach((lineElement) => {
            const number = Number(lineElement.dataset.line);

            lineElement.classList.toggle(
                "debug-current-line",
                number === currentLine
            );
        });
    }

    function getState() {
        return {
            running,
            paused,
            currentLine,
            breakpoints: getBreakpoints(),
            variables: getVariables()
        };
    }

    function isRunning() {
        return running;
    }

    function isPaused() {
        return paused;
    }

    return {
        init,
        toggleBreakpoint,
        addBreakpoint,
        removeBreakpoint,
        clearBreakpoints,
        getBreakpoints,
        setCurrentLine,
        getCurrentLine,
        setVariable,
        getVariable,
        getVariables,
        clearVariables,
        start,
        pause,
        resume,
        stop,
        stepOver,
        stepInto,
        stepOut,
        shouldPauseAt,
        getState,
        isRunning,
        isPaused
    };
})();

window.YusufDebugger = YusufDebugger;
