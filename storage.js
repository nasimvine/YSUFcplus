"use strict";

const YusufStorage = (() => {
    const STORAGE_KEY = "yusuf_code_project";
    const SETTINGS_KEY = "yusuf_code_settings";

    const defaultProject = {
        name: "Лоиҳаи ман",
        activeFile: "main.cpp",
        files: [
            {
                id: crypto.randomUUID(),
                name: "main.cpp",
                type: "file",
                language: "cpp",
                content:
`#include <iostream>
using namespace std;

int main() {
    cout << "Салом, Юсуф!" << endl;

    return 0;
}`
            },
            {
                id: crypto.randomUUID(),
                name: "functions.cpp",
                type: "file",
                language: "cpp",
                content:
`#include <iostream>

void hello() {
    std::cout << "Салом аз functions.cpp!" << std::endl;
}`
            },
            {
                id: crypto.randomUUID(),
                name: "src",
                type: "folder",
                children: [
                    {
                        id: crypto.randomUUID(),
                        name: "example.cpp",
                        type: "file",
                        language: "cpp",
                        content:
`#include <iostream>

int add(int a, int b) {
    return a + b;
}

int main() {
    std::cout << add(5, 7) << std::endl;
    return 0;
}`
                    }
                ]
            }
        ]
    };

    const defaultSettings = {
        theme: "dark",
        fontSize: 14,
        tabSize: 4,
        autosave: true
    };

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function loadProject() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                const project = clone(defaultProject);
                saveProject(project);
                return project;
            }

            const project = JSON.parse(saved);

            if (!project || !Array.isArray(project.files)) {
                return clone(defaultProject);
            }

            return project;
        } catch (error) {
            console.error("Project loading failed:", error);
            return clone(defaultProject);
        }
    }

    function saveProject(project) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(project)
            );

            return true;
        } catch (error) {
            console.error("Project saving failed:", error);
            return false;
        }
    }

    function loadSettings() {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);

            if (!saved) {
                return clone(defaultSettings);
            }

            return {
                ...clone(defaultSettings),
                ...JSON.parse(saved)
            };
        } catch (error) {
            console.error("Settings loading failed:", error);
            return clone(defaultSettings);
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );

            return true;
        } catch (error) {
            console.error("Settings saving failed:", error);
            return false;
        }
    }

    function resetProject() {
        const project = clone(defaultProject);
        saveProject(project);
        return project;
    }

    function exportProject(project) {
        const data = JSON.stringify(project, null, 2);
        const blob = new Blob(
            [data],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "yusuf-code-project.json";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    async function importProject(file) {
        if (!file) {
            throw new Error("Файл интихоб нашудааст.");
        }

        const text = await file.text();
        const project = JSON.parse(text);

        if (
            !project ||
            typeof project !== "object" ||
            !Array.isArray(project.files)
        ) {
            throw new Error("Формати лоиҳа нодуруст аст.");
        }

        saveProject(project);

        return project;
    }

    function clearAll() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SETTINGS_KEY);
    }

    return {
        loadProject,
        saveProject,
        loadSettings,
        saveSettings,
        resetProject,
        exportProject,
        importProject,
        clearAll
    };
})();

window.YusufStorage = YusufStorage;
