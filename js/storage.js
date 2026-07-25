/* ============================================
   STORAGE MODULE
   Mengelola semua operasi LocalStorage
   ============================================ */
const Storage = (() => {
    const KEY = 'portal_umkm_data';
    const THEME_KEY = 'portal_umkm_theme';

    // Ambil semua data
    const getAll = () => {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || [];
        } catch { return []; }
    };

    // Simpan semua data
    const saveAll = (data) => {
        localStorage.setItem(KEY, JSON.stringify(data));
    };

    // Tambah data baru
    const add = (item) => {
        const data = getAll();
        item.id = Date.now().toString();
        item.createdAt = new Date().toISOString();
        item.status = 'pending';
        data.push(item);
        saveAll(data);
        return item;
    };

    // Update data berdasarkan id
    const update = (id, updates) => {
        const data = getAll();
        const idx = data.findIndex(d => d.id === id);
        if (idx > -1) {
            data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
            saveAll(data);
            return data[idx];
        }
        return null;
    };

    // Hapus data berdasarkan id
    const remove = (id) => {
        const data = getAll().filter(d => d.id !== id);
        saveAll(data);
    };

    // Cari berdasarkan id
    const getById = (id) => getAll().find(d => d.id === id);

    // Reset semua data
    const resetAll = () => localStorage.removeItem(KEY);

    // Export JSON
    const exportJSON = () => {
        const blob = new Blob([JSON.stringify(getAll(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-umkm-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Import JSON
    const importJSON = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (!Array.isArray(imported)) throw new Error('Format tidak valid');
                saveAll(imported);
                resolve(imported.length);
            } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });

    // Tema
    const getTheme = () => localStorage.getItem(THEME_KEY) || 'light';
    const setTheme = (t) => localStorage.setItem(THEME_KEY, t);

    return { getAll, add, update, remove, getById, resetAll, exportJSON, importJSON, getTheme, setTheme };
})();