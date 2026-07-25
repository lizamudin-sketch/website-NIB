/* ============================================
   FORM MODULE
   Mengelola pengumpulan & validasi data form
   ============================================ */
const FormManager = (() => {
    let currentData = {};
    let editingId = null;

    // Set data yang sedang diedit
    const setEditing = (id) => {
        editingId = id;
        if (id) currentData = { ...Storage.getById(id) };
    };

    const getEditingId = () => editingId;
    const getData = () => currentData;

    // Update partial data
    const updateData = (partial) => {
        currentData = { ...currentData, ...partial };
    };

    // Reset
    const reset = () => { currentData = {}; editingId = null; };

    // Validasi Data Diri
    const validateDataDiri = () => {
        const required = ['nama', 'nik', 'tempatLahir', 'tanggalLahir', 'jenisKelamin', 'hp', 'alamatRumah'];
        for (const f of required) {
            if (!currentData[f]) return { valid: false, field: f, msg: 'Field wajib diisi' };
        }
        if (currentData.nik && currentData.nik.length !== 16)
            return { valid: false, field: 'nik', msg: 'NIK harus 16 digit' };
        if (currentData.hp && !/^[0-9+\-\s]{8,20}$/.test(currentData.hp))
            return { valid: false, field: 'hp', msg: 'Nomor HP tidak valid' };
        return { valid: true };
    };

    // Validasi Data Usaha
    const validateDataUsaha = () => {
        if (!currentData.namaUsaha) return { valid: false, field: 'namaUsaha', msg: 'Nama usaha wajib diisi' };
        if (!currentData.jenisUsaha) return { valid: false, field: 'jenisUsaha', msg: 'Pilih jenis usaha' };
        return { valid: true };
       // Tambahkan di dalam validateDataUsaha
if (data.jenisUsaha === 'Warung Sembako' && !data.barangDijual?.trim()) {
    return { valid: false, field: 'barangDijual', msg: 'Sebutkan barang yang dijual' };
}
    };

    // Validasi Operasional
    const validateOperasional = () => {
        if (!currentData.tanggalMulai) return { valid: false, field: 'tanggalMulai', msg: 'Tanggal mulai wajib diisi' };
        if (!currentData.jumlahKaryawanStatus) return { valid: false, field: 'jumlahKaryawanStatus', msg: 'Pilih status karyawan' };
        if (currentData.jumlahKaryawanStatus === 'ada' && !currentData.jumlahKaryawan)
            return { valid: false, field: 'jumlahKaryawan', msg: 'Isi jumlah karyawan' };
        if (!currentData.modal) return { valid: false, field: 'modal', msg: 'Modal wajib diisi' };
        if (!currentData.omzet) return { valid: false, field: 'omzet', msg: 'Omzet wajib diisi' };
        if (!currentData.statusTempat) return { valid: false, field: 'statusTempat', msg: 'Pilih status tempat' };
        return { valid: true };
    };

    // Validasi Alamat
    const validateAlamat = () => {
        const required = ['alamat', 'rt', 'rw', 'desa', 'kecamatan', 'kabupaten', 'provinsi', 'kodePos'];
        for (const f of required) {
            if (!currentData[f]) return { valid: false, field: f, msg: 'Field wajib diisi' };
        }
        return { valid: true };
    };

    // Simpan ke storage
    const save = () => {
        if (editingId) {
            return Storage.update(editingId, currentData);
        } else {
            return Storage.add(currentData);
        }
    };

    return { setEditing, getEditingId, getData, updateData, reset, save,
             validateDataDiri, validateDataUsaha, validateOperasional, validateAlamat };
})();
