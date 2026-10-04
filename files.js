"use strict";

const YusufFiles = (() => {
    let project = null;
    let onChangeCallback = null;

    function init(currentProject, onChange) {
        project = currentProject;
        onChangeCallback = onChange;
    }

    function setProject(currentProject) {
        project = currentProject;
    }

    function getProject() {
        return project;
    }

    function generateId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }

        return `file-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;
    }

    function createFile(name = "untitled.cpp", parentId = null) {
        const cleanName = String(name || "untitled.cpp").trim();

        if (!cleanName) {
            throw new Error("Номи файл холӣ буда наметавонад.");
        }

        const file = {
            id: generateId(),
            name: cleanName,
            type: "file",
            language: getLanguage(cleanName),
            content: getDefaultContent(cleanName)
        };

        if (!parentId) {
            project.files.push(file);
        } else {
            const folder = findItem(parentId);

            if (!folder || folder.type !== "folder") {
                throw new Error("Папка ёфт нашуд.");
            }

            folder.children = folder.children || [];
            folder.children.push(file);
        }

        notifyChange();

        return file;
    }

    function createFolder(name = "New Folder", parentId = null) {
        const cleanName = String(name || "New Folder").trim();

        if (!cleanName) {
            throw new Error("Номи папка холӣ буда наметавонад.");
        }

        const folder = {
            id: generateId(),
            name: cleanName,
            type: "folder",
            children: []
        };

        if (!parentId) {
            project.files.push(folder);
        } else {
            const parent = findItem(parentId);

            if (!parent || parent.type !== "folder") {
                throw new Error("Папка ёфт нашуд.");
            }

            parent.children = parent.children || [];
            parent.children.push(folder);
        }

        notifyChange();

        return folder;
    }

    function deleteItem(id) {
        if (!project) {
            return false;
        }

        const result = removeFromArray(project.files, id);

        if (!result) {
            return false;
        }

        if (project.activeFile === result.name) {
            const firstFile = getAllFiles()[0];
            project.activeFile = firstFile
                ? firstFile.name
                : null;
        }

        notifyChange();

        return true;
    }

    function removeFromArray(items, id) {
        if (!Array.isArray(items)) {
            return null;
        }

        const index = items.findIndex(
            (item) => item.id === id
        );

        if (index !== -1) {
            return items.splice(index, 1)[0];
        }

        for (const item of items) {
            if (item.type === "folder" && item.children) {
                const result = removeFromArray(
                    item.children,
                    id
                );

                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    function renameItem(id, newName) {
        const item = findItem(id);

        if (!item) {
            throw new Error("Файл ё папка ёфт нашуд.");
        }

        const name = String(newName || "").trim();

        if (!name) {
            throw new Error("Номи нав холӣ буда наметавонад.");
        }

        const oldName = item.name;

        item.name = name;

        if (item.type === "file") {
            item.language = getLanguage(name);

            if (project.activeFile === oldName) {
                project.activeFile = name;
            }
        }

        notifyChange();

        return item;
    }

    function duplicateItem(id) {
        const item = findItem(id);

        if (!item) {
            throw new Error("Элемент ёфт нашуд.");
        }

        const copy = deepClone(item);

        copy.id = generateId();
        copy.name = makeCopyName(item.name);

        regenerateChildIds(copy);

        const parent = findParent(project.files, id);

        if (parent && parent.children) {
            const index = parent.children.findIndex(
                (child) => child.id === id
            );

            parent.children.splice(
                index + 1,
                0,
                copy
            );
        } else {
            const index = project.files.findIndex(
                (child) => child.id === id
            );

            project.files.splice(
                index + 1,
                0,
                copy
            );
        }

        notifyChange();

        return copy;
    }

    function findItem(id, items = project?.files) {
        if (!Array.isArray(items)) {
            return null;
        }

        for (const item of items) {
            if (item.id === id) {
                return item;
            }

            if (item.type === "folder") {
                const found = findItem(
                    id,
                    item.children
                );

                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    function findFileByName(name, items = project?.files) {
        if (!Array.isArray(items)) {
            return null;
        }

        for (const item of items) {
            if (
                item.type === "file" &&
                item.name === name
            ) {
                return item;
            }

            if (item.type === "folder") {
                const found = findFileByName(
                    name,
                    item.children
                );

                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    function findParent(items, id, parent = null) {
        if (!Array.isArray(items)) {
            return null;
        }

        for (const item of items) {
            if (item.id === id) {
                return parent;
            }

            if (item.type === "folder") {
                const found = findParent(
                    item.children,
                    id,
                    item
                );

                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    function getAllFiles(
        items = project?.files,
        result = []
    ) {
        if (!Array.isArray(items)) {
            return result;
        }

        items.forEach((item) => {
            if (item.type === "file") {
                result.push(item);
            }

            if (item.type === "folder") {
                getAllFiles(item.children, result);
            }
        });

        return result;
    }

    function getAllFolders(
        items = project?.files,
        result = []
    ) {
        if (!Array.isArray(items)) {
            return result;
        }

        items.forEach((item) => {
            if (item.type === "folder") {
                result.push(item);
                getAllFolders(item.children, result);
            }
        });

        return result;
    }

    function countItems(items = project?.files) {
        let files = 0;
        let folders = 0;

        if (!Array.isArray(items)) {
            return { files, folders };
        }

        items.forEach((item) => {
            if (item.type === "file") {
                files += 1;
            }

            if (item.type === "folder") {
                folders += 1;

                const nested = countItems(
                    item.children
                );

                files += nested.files;
                folders += nested.folders;
            }
        });

        return {
            files,
            folders
        };
    }

    function searchFiles(query) {
        const text = String(query || "")
            .trim()
            .toLowerCase();

        if (!text) {
            return getAllFiles();
        }

        return getAllFiles().filter((file) =>
            file.name.toLowerCase().includes(text)
        );
    }

    function importFile(file) {
        return file.text().then((content) => {
            const imported = createFile(
                file.name,
                null
            );

            imported.content = content;

            notifyChange();

            return imported;
        });
    }

    function getLanguage(filename) {
        const extension = String(filename)
            .split(".")
            .pop()
            .toLowerCase();

        const languages = {
            cpp: "cpp",
            cc: "cpp",
            cxx: "cpp",
            h: "cpp",
            hpp: "cpp",
            txt: "text"
        };

        return languages[extension] || "text";
    }

    function getDefaultContent(filename) {
        const language = getLanguage(filename);

        if (language === "cpp") {
            return `#include <iostream>

int main() {
    std::cout << "Салом, Юсуф!" << std::endl;
    return 0;
}`;
        }

        return "";
    }

    function makeCopyName(name) {
        const dotIndex = name.lastIndexOf(".");

        if (dotIndex === -1) {
            return `${name} copy`;
        }

        const base = name.slice(0, dotIndex);
        const extension = name.slice(dotIndex);

        return `${base} copy${extension}`;
    }

    function regenerateChildIds(item) {
        if (!item.children) {
            return;
        }

        item.children.forEach((child) => {
            child.id = generateId();
            regenerateChildIds(child);
        });
    }

    function deepClone(value) {
        return JSON.parse(
            JSON.stringify(value)
        );
    }

    function notifyChange() {
        if (typeof onChangeCallback === "function") {
            onChangeCallback(project);
        }
    }

    return {
        init,
        setProject,
        getProject,
        createFile,
        createFolder,
        deleteItem,
        renameItem,
        duplicateItem,
        findItem,
        findFileByName,
        findParent,
        getAllFiles,
        getAllFolders,
        countItems,
        searchFiles,
        importFile,
        getLanguage
    };
})();

window.YusufFiles = YusufFiles;
