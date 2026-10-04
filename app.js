"use strict";

const YusufApp = (() => {
    let project = null;
    let settings = null;
    let activeFile = null;

    const elements = {};

    function init() {
        cacheElements();

        project = YusufStorage.loadProject();
        settings = YusufStorage.loadSettings();

        YusufTerminal.init();

        YusufFiles.init(
            project,
            handleProjectChange
        );

        YusufEditor.init({
            editor: elements.codeEditor,
            syntaxLayer: elements.syntaxLayer,
            lineNumbers: elements.lineNumbers
        });

        YusufEditor.setSettings(settings);

        if (window.YusufDebugger) {
            YusufDebugger.init(
                elements.codeEditor
            );
        }

        bindEvents();
        applyTheme();
        renderProject();
        openInitialFile();
        updateProjectInfo();
        hideLoading();

        YusufTerminal.info(
            "YUSUF CODE омода аст."
        );
    }

    function cacheElements() {
        const ids = [
            "app",
            "menuButton",
            "saveButton",
            "runButton",
            "currentProjectName",
            "sidebar",
            "sidebarCloseButton",
            "projectFileCount",
            "newFileButton",
            "newFolderButton",
            "searchFilesButton",
            "fileTree",
            "importProjectButton",
            "exportProjectButton",
            "editorTabs",
            "undoButton",
            "redoButton",
            "formatButton",
            "searchCodeButton",
            "cursorPosition",
            "editorContainer",
            "lineNumbers",
            "codeEditor",
            "syntaxLayer",
            "editorStatus",
            "codeLineCount",
            "codeCharCount",
            "outputPanel",
            "inputPanel",
            "errorsPanel",
            "executionStatus",
            "clearOutputButton",
            "terminalOutput",
            "programInput",
            "errorCount",
            "errorList",
            "sidebarOverlay",
            "searchModal",
            "newFileModal",
            "newFolderModal",
            "settingsModal",
            "toastContainer",
            "loadingScreen"
        ];

        ids.forEach((id) => {
            elements[id] =
                document.getElementById(id);
        });
    }

    function bindEvents() {
        elements.menuButton?.addEventListener(
            "click",
            openSidebar
        );

        elements.sidebarCloseButton?.addEventListener(
            "click",
            closeSidebar
        );

        elements.sidebarOverlay?.addEventListener(
            "click",
            closeSidebar
        );

        elements.saveButton?.addEventListener(
            "click",
            saveProject
        );

        elements.runButton?.addEventListener(
            "click",
            runCode
        );

        elements.newFileButton?.addEventListener(
            "click",
            () => openModal("newFileModal")
        );

        elements.newFolderButton?.addEventListener(
            "click",
            () => openModal("newFolderModal")
        );

        elements.searchFilesButton?.addEventListener(
            "click",
            searchFiles
        );

        elements.importProjectButton?.addEventListener(
            "click",
            importProject
        );

        elements.exportProjectButton?.addEventListener(
            "click",
            exportProject
        );

        elements.undoButton?.addEventListener(
            "click",
            () => YusufEditor.undo()
        );

        elements.redoButton?.addEventListener(
            "click",
            () => YusufEditor.redo()
        );

        elements.formatButton?.addEventListener(
            "click",
            () => {
                YusufEditor.formatCode();
                showToast(
                    "Код формат карда шуд.",
                    "success"
                );
            }
        );

        elements.searchCodeButton?.addEventListener(
            "click",
            openCodeSearch
        );

        elements.clearOutputButton?.addEventListener(
            "click",
            () => {
                YusufTerminal.clear();
                setExecutionStatus(
                    "Омода",
                    "idle"
                );
            }
        );

        document.addEventListener(
            "yusuf-editor-change",
            handleEditorChange
        );

        document.addEventListener(
            "yusuf-save-request",
            saveProject
        );

        document.addEventListener(
            "yusuf-search-request",
            openCodeSearch
        );

        bindPanelTabs();
        bindModalEvents();
        bindBottomNavigation();
    }

    function bindPanelTabs() {
        const tabs =
            document.querySelectorAll(
                ".panel-tab"
            );

        tabs.forEach((tab) => {
            tab.addEventListener(
                "click",
                () => {
                    const target =
                        tab.dataset.panel;

                    tabs.forEach((item) =>
                        item.classList.remove(
                            "active"
                        )
                    );

                    tab.classList.add(
                        "active"
                    );

                    document
                        .querySelectorAll(
                            ".output-panel-section"
                        )
                        .forEach((section) => {
                            section.classList.toggle(
                                "active",
                                section.dataset.panel ===
                                    target
                            );
                        });
                }
            );
        });
    }

    function bindModalEvents() {
        document
            .querySelectorAll(
                "[data-close-modal]"
            )
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => {
                        closeModal(
                            button.dataset.closeModal
                        );
                    }
                );
            });

        document
            .querySelectorAll(".modal")
            .forEach((modal) => {
                modal.addEventListener(
                    "click",
                    (event) => {
                        if (
                            event.target === modal
                        ) {
                            closeModal(
                                modal.id
                            );
                        }
                    }
                );
            });

        const createFile =
            document.getElementById(
                "confirmNewFile"
            );

        createFile?.addEventListener(
            "click",
            createNewFile
        );

        const createFolder =
            document.getElementById(
                "confirmNewFolder"
            );

        createFolder?.addEventListener(
            "click",
            createNewFolder
        );

        const saveSettingsButton =
            document.getElementById(
                "saveSettingsButton"
            );

        saveSettingsButton?.addEventListener(
            "click",
            saveSettings
        );
    }

    function bindBottomNavigation() {
        document
            .querySelectorAll(
                "[data-nav]"
            )
            .forEach((item) => {
                item.addEventListener(
                    "click",
                    () => {
                        const action =
                            item.dataset.nav;

                        handleNavigation(
                            action
                        );
                    }
                );
            });
    }

    function handleNavigation(action) {
        if (action === "files") {
            openSidebar();
            return;
        }

        if (action === "run") {
            runCode();
            return;
        }

        if (action === "terminal") {
            scrollToOutput();
            return;
        }

        if (action === "settings") {
            openModal(
                "settingsModal"
            );
            return;
        }

        if (action === "home") {
            closeSidebar();
            return;
        }
    }

    function handleProjectChange(updatedProject) {
        project = updatedProject;

        YusufStorage.saveProject(
            project
        );

        renderProject();
        updateProjectInfo();
    }

    function handleEditorChange(event) {
        if (
            !event.detail ||
            !event.detail.file
        ) {
            return;
        }

        activeFile =
            event.detail.file;

        activeFile.content =
            event.detail.content;

        if (
            settings.autosave
        ) {
            YusufStorage.saveProject(
                project
            );
        }

        updateEditorStatus(
            "Тағйирот нигоҳ дошта шуд"
        );
    }

    function renderProject() {
        renderFileTree();
        renderTabs();
    }

    function renderFileTree() {
        const tree =
            elements.fileTree;

        if (!tree) {
            return;
        }

        tree.innerHTML = "";

        project.files.forEach(
            (item) => {
                tree.appendChild(
                    createTreeItem(item)
                );
            }
        );
    }

    function createTreeItem(item, level = 0) {
        const wrapper =
            document.createElement("div");

        wrapper.className =
            "file-tree-item-wrapper";

        const row =
            document.createElement("div");

        row.className =
            "file-tree-item";

        row.style.paddingLeft =
            `${12 + level * 18}px`;

        row.dataset.id =
            item.id;

        const icon =
            document.createElement("span");

        icon.className =
            "file-tree-icon";

        icon.textContent =
            item.type === "folder"
                ? "▸"
                : getFileIcon(item.name);

        const name =
            document.createElement("span");

        name.className =
            "file-tree-name";

        name.textContent =
            item.name;

        row.appendChild(icon);
        row.appendChild(name);

        if (
            item.type === "file" &&
            activeFile?.id === item.id
        ) {
            row.classList.add(
                "active"
            );
        }

        row.addEventListener(
            "click",
            () => {
                if (
                    item.type === "folder"
                ) {
                    wrapper.classList.toggle(
                        "expanded"
                    );

                    icon.textContent =
                        wrapper.classList.contains(
                            "expanded"
                        )
                            ? "▾"
                            : "▸";

                    return;
                }

                openFile(item);
            }
        );

        row.addEventListener(
            "contextmenu",
            (event) => {
                event.preventDefault();
                showFileMenu(
                    event,
                    item
                );
            }
        );

        wrapper.appendChild(row);

        if (
            item.type === "folder" &&
            Array.isArray(item.children)
        ) {
            const children =
                document.createElement(
                    "div"
                );

            children.className =
                "file-tree-children";

            item.children.forEach(
                (child) => {
                    children.appendChild(
                        createTreeItem(
                            child,
                            level + 1
                        )
                    );
                }
            );

            wrapper.appendChild(
                children
            );
        }

        return wrapper;
    }

    function renderTabs() {
        const tabs =
            elements.editorTabs;

        if (!tabs) {
            return;
        }

        tabs.innerHTML = "";

        if (!activeFile) {
            return;
        }

        const tab =
            document.createElement("div");

        tab.className =
            "editor-tab active";

        tab.innerHTML = `
            <span class="editor-tab-icon">
                ${getFileIcon(activeFile.name)}
            </span>
            <span class="editor-tab-name"></span>
            <button
                class="editor-tab-close"
                type="button"
                aria-label="Пӯшидан"
            >
                ×
            </button>
        `;

        tab.querySelector(
            ".editor-tab-name"
        ).textContent =
            activeFile.name;

        tab.querySelector(
            ".editor-tab-close"
        ).addEventListener(
            "click",
            closeActiveFile
        );

        tabs.appendChild(tab);
    }

    function openInitialFile() {
        let file =
            YusufFiles.findFileByName(
                project.activeFile
            );

        if (!file) {
            file =
                YusufFiles.getAllFiles()[0];
        }

        if (file) {
            openFile(file);
        }
    }

    function openFile(file) {
        if (
            !file ||
            file.type !== "file"
        ) {
            return;
        }

        activeFile = file;

        project.activeFile =
            file.name;

        YusufEditor.openFile(
            file
        );

        renderTabs();
        renderFileTree();
        updateProjectInfo();
        closeSidebar();

        updateEditorStatus(
            "Файл кушода шуд"
        );
    }

    function closeActiveFile() {
        activeFile = null;

        const firstFile =
            YusufFiles.getAllFiles()[0];

        if (firstFile) {
            openFile(firstFile);
            return;
        }

        if (elements.codeEditor) {
            elements.codeEditor.value = "";
        }

        renderTabs();
    }

    function createNewFile() {
        const input =
            document.getElementById(
                "newFileName"
            );

        const name =
            input?.value.trim();

        if (!name) {
            showToast(
                "Номи файлро нависед.",
                "error"
            );

            return;
        }

        try {
            const file =
                YusufFiles.createFile(
                    name
                );

            closeModal(
                "newFileModal"
            );

            if (input) {
                input.value = "";
            }

            openFile(file);

            showToast(
                "Файл сохта шуд.",
                "success"
            );
        } catch (error) {
            showToast(
                error.message,
                "error"
            );
        }
    }

    function createNewFolder() {
        const input =
            document.getElementById(
                "newFolderName"
            );

        const name =
            input?.value.trim();

        if (!name) {
            showToast(
                "Номи папкаро нависед.",
                "error"
            );

            return;
        }

        try {
            YusufFiles.createFolder(
                name
            );

            closeModal(
                "newFolderModal"
            );

            if (input) {
                input.value = "";
            }

            showToast(
                "Папка сохта шуд.",
                "success"
            );
        } catch (error) {
            showToast(
                error.message,
                "error"
            );
        }
    }

    function showFileMenu(event, item) {
        const oldMenu =
            document.querySelector(
                ".file-context-menu"
            );

        oldMenu?.remove();

        const menu =
            document.createElement("div");

        menu.className =
            "file-context-menu";

        menu.style.left =
            `${Math.min(
                event.clientX,
                window.innerWidth - 180
            )}px`;

        menu.style.top =
            `${Math.min(
                event.clientY,
                window.innerHeight - 180
            )}px`;

        const actions = [
            {
                label: "Rename",
                action: () => renameItem(item)
            },
            {
                label: "Duplicate",
                action: () =>
                    YusufFiles.duplicateItem(
                        item.id
                    )
            },
            {
                label: "Delete",
                action: () => deleteItem(item)
            }
        ];

        actions.forEach(
            ({ label, action }) => {
                const button =
                    document.createElement(
                        "button"
                    );

                button.type = "button";
                button.textContent =
                    label;

                button.addEventListener(
                    "click",
                    () => {
                        action();
                        menu.remove();
                    }
                );

                menu.appendChild(
                    button
                );
            }
        );

        document.body.appendChild(
            menu
        );

        const remove =
            (clickEvent) => {
                if (
                    !menu.contains(
                        clickEvent.target
                    )
                ) {
                    menu.remove();

                    document.removeEventListener(
                        "click",
                        remove
                    );
                }
            };

        setTimeout(() => {
            document.addEventListener(
                "click",
                remove
            );
        }, 0);
    }

    function renameItem(item) {
        const newName =
            window.prompt(
                "Номи нав:",
                item.name
            );

        if (
            newName === null
        ) {
            return;
        }

        try {
            YusufFiles.renameItem(
                item.id,
                newName
            );

            if (
                activeFile?.id ===
                item.id
            ) {
                activeFile =
                    item;
            }

            showToast(
                "Ном иваз шуд.",
                "success"
            );
        } catch (error) {
            showToast(
                error.message,
                "error"
            );
        }
    }

    function deleteItem(item) {
        const confirmed =
            window.confirm(
                `Оё "${item.name}"-ро нест кардан мехоҳед?`
            );

        if (!confirmed) {
            return;
        }

        const wasActive =
            activeFile?.id === item.id;

        YusufFiles.deleteItem(
            item.id
        );

        if (wasActive) {
            const next =
                YusufFiles.getAllFiles()[0];

            if (next) {
                openFile(next);
            }
        }

        showToast(
            "Нест карда шуд.",
            "success"
        );
    }

    function searchFiles() {
        const query =
            window.prompt(
                "Номи файлро ҷустуҷӯ кунед:"
            );

        if (query === null) {
            return;
        }

        const results =
            YusufFiles.searchFiles(
                query
            );

        if (!results.length) {
            showToast(
                "Файл ёфт нашуд.",
                "warning"
            );

            return;
        }

        openFile(results[0]);

        if (results.length > 1) {
            showToast(
                `${results.length} файл ёфт шуд.`,
                "info"
            );
        }
    }

    async function importProject() {
        const input =
            document.createElement(
                "input"
            );

        input.type = "file";
        input.accept =
            ".json,application/json";

        input.addEventListener(
            "change",
            async () => {
                const file =
                    input.files?.[0];

                if (!file) {
                    return;
                }

                try {
                    project =
                        await YusufStorage.importProject(
                            file
                        );

                    YusufFiles.setProject(
                        project
                    );

                    renderProject();
                    openInitialFile();
                    updateProjectInfo();

                    showToast(
                        "Лоиҳа ворид шуд.",
                        "success"
                    );
                } catch (error) {
                    showToast(
                        error.message ||
                            "Импорт иҷро нашуд.",
                        "error"
                    );
                }
            }
        );

        input.click();
    }

    function exportProject() {
        try {
            YusufStorage.exportProject(
                project
            );

            showToast(
                "Лоиҳа содир карда шуд.",
                "success"
            );
        } catch (error) {
            showToast(
                "Экспорт иҷро нашуд.",
                "error"
            );
        }
    }

    function saveProject() {
        if (activeFile) {
            activeFile.content =
                YusufEditor.getValue();
        }

        const saved =
            YusufStorage.saveProject(
                project
            );

        if (saved) {
            updateEditorStatus(
                "Захира шуд"
            );

            showToast(
                "Лоиҳа захира шуд.",
                "success"
            );
        } else {
            showToast(
                "Захира кардан имконнопазир аст.",
                "error"
            );
        }
    }

    async function runCode() {
        if (!activeFile) {
            showToast(
                "Аввал файлро кушоед.",
                "warning"
            );

            return;
        }

        saveProject();

        const code =
            YusufEditor.getValue();

        const input =
            elements.programInput?.value ||
            "";

        setExecutionStatus(
            "Компилятсия...",
            "running"
        );

        YusufTerminal.clear();

        YusufTerminal.command(
            "yusuf run main.cpp"
        );

        YusufTerminal.info(
            "Санҷиши коди C++..."
        );

        const result =
            await YusufCompiler.run(
                code,
                input
            );

        if (result.stopped) {
            YusufTerminal.warning(
                "Иҷро қатъ карда шуд."
            );

            setExecutionStatus(
                "Қатъ шуд",
                "warning"
            );

            return;
        }

        if (!result.success) {
            result.errors.forEach(
                (error) => {
                    YusufTerminal.error(
                        `Line ${error.line}: ${error.message}`
                    );
                }
            );

            renderErrors(
                result.errors
            );

            setExecutionStatus(
                "Хато",
                "error"
            );

            return;
        }

        renderErrors([]);

        if (result.output) {
            YusufTerminal.write(
                result.output
            );
        } else {
            YusufTerminal.info(
                "Барнома output надод."
            );
        }

        YusufTerminal.success(
            `Process exited with code ${result.exitCode}`
        );

        setExecutionStatus(
            "Иҷро шуд",
            "success"
        );

        scrollToOutput();
    }

    function renderErrors(errors) {
        const list =
            elements.errorList;

        const count =
            elements.errorCount;

        if (!list) {
            return;
        }

        list.innerHTML = "";

        if (count) {
            count.textContent =
                String(errors.length);
        }

        if (!errors.length) {
            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "empty-state";

            empty.textContent =
                "Хато нест ✓";

            list.appendChild(
                empty
            );

            return;
        }

        errors.forEach(
            (error) => {
                const item =
                    document.createElement(
                        "button"
                    );

                item.type = "button";
                item.className =
                    "error-item";

                item.innerHTML = `
                    <strong>Line ${error.line}</strong>
                    <span></span>
                `;

                item.querySelector(
                    "span"
                ).textContent =
                    error.message;

                item.addEventListener(
                    "click",
                    () => {
                        goToLine(
                            error.line
                        );
                    }
                );

                list.appendChild(
                    item
                );
            }
        );
    }

    function goToLine(line) {
        const code =
            YusufEditor.getValue();

        const lines =
            code.split("\n");

        let position = 0;

        for (
            let index = 0;
            index < line - 1;
            index += 1
        ) {
            position +=
                lines[index].length + 1;
        }

        elements.codeEditor?.focus();

        if (elements.codeEditor) {
            elements.codeEditor.selectionStart =
                position;

            elements.codeEditor.selectionEnd =
                position +
                (
                    lines[line - 1]
                        ?.length || 0
                );
        }

        YusufEditor.updateView();
    }

    function setExecutionStatus(
        text,
        type
    ) {
        const status =
            elements.executionStatus;

        if (!status) {
            return;
        }

        status.textContent =
            text;

        status.dataset.status =
            type;
    }

    function updateEditorStatus(text) {
        if (
            elements.editorStatus
        ) {
            elements.editorStatus.textContent =
                text;
        }
    }

    function updateProjectInfo() {
        const counts =
            YusufFiles.countItems();

        if (
            elements.projectFileCount
        ) {
            elements.projectFileCount.textContent =
                `${counts.files} файл`;
        }

        if (
            elements.currentProjectName
        ) {
            elements.currentProjectName.textContent =
                project.name ||
                "Лоиҳаи ман";
        }
    }

    function openSidebar() {
        elements.sidebar?.classList.add(
            "open"
        );

        elements.sidebarOverlay?.classList.add(
            "visible"
        );
    }

    function closeSidebar() {
        elements.sidebar?.classList.remove(
            "open"
        );

        elements.sidebarOverlay?.classList.remove(
            "visible"
        );
    }

    function openModal(id) {
        const modal =
            document.getElementById(id);

        if (!modal) {
            return;
        }

        modal.classList.add(
            "open"
        );

        const input =
            modal.querySelector(
                "input"
            );

        setTimeout(
            () => input?.focus(),
            50
        );
    }

    function closeModal(id) {
        const modal =
            document.getElementById(id);

        modal?.classList.remove(
            "open"
        );
    }

    function openCodeSearch() {
        const modal =
            elements.searchModal;

        if (!modal) {
            return;
        }

        modal.classList.add(
            "open"
        );

        const input =
            modal.querySelector(
                "#codeSearchInput"
            );

        input?.focus();
    }

    function scrollToOutput() {
        const panel =
            elements.outputPanel;

        if (!panel) {
            return;
        }

        panel.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    function saveSettings() {
        const theme =
            document.getElementById(
                "themeSelect"
            )?.value ||
            settings.theme;

        const fontSize =
            Number(
                document.getElementById(
                    "fontSizeInput"
                )?.value
            ) ||
            settings.fontSize;

        const tabSize =
            Number(
                document.getElementById(
                    "tabSizeInput"
                )?.value
            ) ||
            settings.tabSize;

        const autosave =
            document.getElementById(
                "autosaveInput"
            )?.checked ??
            settings.autosave;

        settings = {
            ...settings,
            theme,
            fontSize,
            tabSize,
            autosave
        };

        YusufStorage.saveSettings(
            settings
        );

        YusufEditor.setSettings(
            settings
        );

        applyTheme();

        closeModal(
            "settingsModal"
        );

        showToast(
            "Танзимот захира шуд.",
            "success"
        );
    }

    function applyTheme() {
        document.documentElement.dataset.theme =
            settings.theme || "dark";

        document.body.classList.toggle(
            "light-theme",
            settings.theme === "light"
        );
    }

    function getFileIcon(name) {
        const extension =
            String(name)
                .split(".")
                .pop()
                .toLowerCase();

        if (
            extension === "cpp" ||
            extension === "cc" ||
            extension === "cxx"
        ) {
            return "C++";
        }

        if (
            extension === "h" ||
            extension === "hpp"
        ) {
            return "H";
        }

        return "•";
    }

    function showToast(
        message,
        type = "info"
    ) {
        const container =
            elements.toastContainer;

        if (!container) {
            return;
        }

        const toast =
            document.createElement(
                "div"
            );

        toast.className =
            `toast toast-${type}`;

        toast.textContent =
            message;

        container.appendChild(
            toast
        );

        requestAnimationFrame(
            () => {
                toast.classList.add(
                    "show"
                );
            }
        );

        setTimeout(() => {
            toast.classList.remove(
                "show"
            );

            setTimeout(
                () => toast.remove(),
                250
            );
        }, 2800);
    }

    function hideLoading() {
        if (
            !elements.loadingScreen
        ) {
            return;
        }

        setTimeout(() => {
            elements.loadingScreen.classList.add(
                "hidden"
            );
        }, 300);
    }

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

    return {
        init,
        openFile,
        runCode,
        saveProject,
        showToast
    };
})();

window.YusufApp = YusufApp;
