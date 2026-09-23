const DB_NAME = "sangame-runtime";
const STORE = "handles";

export async function pickGameFolder() {
  if (!window.showDirectoryPicker) {
    throw new Error("Folder access is not supported in this browser. Use Chrome or Edge on desktop.");
  }

  const handle = await window.showDirectoryPicker({ mode: "read" });
  const permission = await handle.requestPermission({ mode: "read" });
  if (permission !== "granted") throw new Error("Folder permission was not granted.");

  const files = [];
  async function walk(dir, prefix = "") {
    for await (const entry of dir.values()) {
      const path = prefix ? prefix + "/" + entry.name : entry.name;
      if (entry.kind === "file") {
        const file = await entry.getFile();
        files.push({ path, size: file.size, type: file.type });
      } else if (entry.kind === "directory") {
        await walk(entry, path);
      }
    }
  }

  await walk(handle);
  return { handle, files };
}

export async function saveFolderHandle(handle) {
  if (!("indexedDB" in window)) return;
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(handle, "game-folder");
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}