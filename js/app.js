/* ============================================
   APP MODULE
   Controller utama, inisialisasi, utilitas UI
   ============================================ */
const App = (() => {

    // Inisialisasi tema
    const initTheme = () => {
        const theme = Storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);

        document.getElementById('themeToggle').addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme');
            const next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            Storage.setTheme(next);
            updateThemeIcon(next);
        });
    };

    const updateThemeIcon = (theme) => {
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    };

    // Toast notification
    const toast = (msg, type = 'success') => {
        const container = document.getElementById('toastContainer');
        const icons = { success: 'check-circle-fill', danger: 'exclamation-triangle-fill', info: 'info-circle-fill', warning: 'exclamation-circle-fill' };
        const id = 'toast-' + Date.now();
        const html = `
            <div id="${id}" class="toast align-items-center text-bg-${type} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body"><i class="bi bi-${icons[type]}"></i> ${msg}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', html);
        const el = document.getElementById(id);
        const t = new bootstrap.Toast(el, { delay: 3000 });
        t.show();
        el.addEventListener('hidden.bs.toast', () => el.remove());
    };

    // Format tanggal
    const formatDate = (iso) => {
        if (!iso) return '-';
        const d = new Date(iso);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // Format rupiah
    const formatRupiah = (n) => {
        if (!n && n !== 0) return '-';
        return 'Rp ' + Number(n).toLocaleString('id-ID');
    };

    // Render progress stepper
    const renderProgress = (currentStep) => {
        const steps = [
            { n: 1, label: 'Data Diri' },
            { n: 2, label: 'Data Usaha' },
            { n: 3, label: 'Operasional' },
            { n: 4, label: 'Alamat' },
            { n: 5, label: 'Review' }
        ];
        const width = ((currentStep - 1) / (steps.length - 1)) * 100;
        return `
            <div class="progress-stepper">
                <div class="progress-fill" style="width: calc(${width}% - 0rem);"></div>
                ${steps.map(s => `
                    <div class="step ${s.n === currentStep ? 'active' : s.n < currentStep ? 'done' : ''}">
                        <div class="step-circle">${s.n < currentStep ? '<i class="bi bi-check"></i>' : s.n}</div>
                        <div class="step-label">${s.label}</div>
                    </div>
                `).join('')}
            </div>`;
    };

    // Konfirmasi SweetAlert
    const confirm = (title, text, icon = 'warning') => Swal.fire({
        title, text, icon, showCancelButton: true,
        confirmButtonColor: '#16a34a', cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya', cancelButtonText: 'Batal'
    });

    // Init
    const init = () => {
        initTheme();
        Router.go('welcome');
    };

    return { init, toast, formatDate, formatRupiah, renderProgress, confirm };
})();

/* ============================================
   PAGE INIT REGISTRY
   Setiap halaman punya fungsi init sendiri
   ============================================ */
const PageInit = {

    'welcome': () => {
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', () => Router.go('pilih-layanan'));
        });
        document.getElementById('btnMulai')?.addEventListener('click', () => Router.go('pilih-layanan'));
    },

    'pilih-layanan': () => {
        document.getElementById('btnNIB')?.addEventListener('click', () => {
            FormManager.reset();
            Router.go('data-diri');
        });
        document.getElementById('btnHalal')?.addEventListener('click', () => {
            Swal.fire({ icon: 'info', title: 'Segera Hadir', text: 'Fitur ini masih dalam tahap pengembangan.', confirmButtonColor: '#16a34a' });
        });
        document.getElementById('btnNPWP')?.addEventListener('click', () => {
            Swal.fire({ icon: 'info', title: 'Segera Hadir', text: 'Fitur ini masih dalam tahap pengembangan.', confirmButtonColor: '#16a34a' });
        });
    },

    'data-diri': (params) => {
        document.getElementById('progressArea').innerHTML = App.renderProgress(1);
        const data = FormManager.getData();

        // Restore data jika ada
        Object.keys(data).forEach(k => {
            const el = document.querySelector(`[name="${k}"]`);
            if (el) {
                if (el.type === 'radio') {
                    document.querySelectorAll(`[name="${k}"]`).forEach(r => r.checked = r.value === data[k]);
                } else el.value = data[k];
            }
        });

        // Email default
        const emailField = document.getElementById('email');
        if (!data.email) emailField.value = 'nib@sofilizamudin.my.id';

        // Toggle email pribadi
        const toggle = document.getElementById('emailToggle');
        const privateEmailWrap = document.getElementById('privateEmailWrap');
        const sync = () => privateEmailWrap.style.display = toggle.checked ? 'block' : 'none';
        toggle.addEventListener('change', sync);
        sync();

        // Tombol selanjutnya
        document.getElementById('btnNext').addEventListener('click', () => {
            // Kumpulkan data
            const fd = new FormData(document.getElementById('formDataDiri'));
            const obj = Object.fromEntries(fd.entries());
            if (obj.emailPribadi === undefined) obj.emailPribadi = '';
            FormManager.updateData(obj);
            const v = FormManager.validateDataDiri();
            if (!v.valid) {
                App.toast(v.msg, 'danger');
                document.getElementById(v.field)?.focus();
                return;
            }
            Router.go('data-usaha');
        });
    },

    'data-usaha': () => {
        document.getElementById('progressArea').innerHTML = App.renderProgress(2);
        const data = FormManager.getData();

        // Restore
        if (data.namaUsaha) document.getElementById('namaUsaha').value = data.namaUsaha;
        if (data.jenisUsaha) {
            const el = document.querySelector(`[name="jenisUsaha"][value="${data.jenisUsaha}"]`);
            if (el) { el.checked = true; el.closest('.kategori-check').classList.add('selected'); }
            renderSubForm(data.jenisUsaha, data);
        }

        // Pilih kategori
        document.querySelectorAll('[name="jenisUsaha"]').forEach(r => {
            r.addEventListener('change', () => {
                document.querySelectorAll('.kategori-check').forEach(c => c.classList.remove('selected'));
                r.closest('.kategori-check').classList.add('selected');
                renderSubForm(r.value, {});
            });
        });

        document.getElementById('btnPrev').addEventListener('click', () => Router.go('data-diri'));
        document.getElementById('btnNext').addEventListener('click', () => {
            const fd = new FormData(document.getElementById('formDataUsaha'));
            const obj = Object.fromEntries(fd.entries());
            FormManager.updateData(obj);
            const v = FormManager.validateDataUsaha();
            if (!v.valid) { App.toast(v.msg, 'danger'); return; }
            Router.go('operasional');
        });
    },

    'operasional': () => {
        document.getElementById('progressArea').innerHTML = App.renderProgress(3);
        const data = FormManager.getData();

        Object.keys(data).forEach(k => {
            const el = document.querySelector(`[name="${k}"]`);
            if (el) {
                if (el.type === 'radio') {
                    document.querySelectorAll(`[name="${k}"]`).forEach(r => r.checked = r.value === data[k]);
                } else el.value = data[k];
            }
        });

        const toggleKaryawan = () => {
            const val = document.querySelector('[name="jumlahKaryawanStatus"]:checked')?.value;
            document.getElementById('jumlahKaryawanWrap').style.display = val === 'ada' ? 'block' : 'none';
        };
        document.querySelectorAll('[name="jumlahKaryawanStatus"]').forEach(r => r.addEventListener('change', toggleKaryawan));
        toggleKaryawan();

        document.getElementById('btnPrev').addEventListener('click', () => Router.go('data-usaha'));
        document.getElementById('btnNext').addEventListener('click', () => {
            const fd = new FormData(document.getElementById('formOperasional'));
            FormManager.updateData(Object.fromEntries(fd.entries()));
            const v = FormManager.validateOperasional();
            if (!v.valid) { App.toast(v.msg, 'danger'); return; }
            Router.go('alamat-usaha');
        });
    },

    'alamat-usaha': () => {
        document.getElementById('progressArea').innerHTML = App.renderProgress(4);
        const data = FormManager.getData();

        Object.keys(data).forEach(k => {
            const el = document.querySelector(`[name="${k}"]`);
            if (el) el.value = data[k] || '';
        });

        document.getElementById('btnPrev').addEventListener('click', () => Router.go('operasional'));
        document.getElementById('btnNext').addEventListener('click', () => {
            const fd = new FormData(document.getElementById('formAlamat'));
            FormManager.updateData(Object.fromEntries(fd.entries()));
            const v = FormManager.validateAlamat();
            if (!v.valid) { App.toast(v.msg, 'danger'); return; }
            Router.go('review');
        });
    },

    'review': () => {
        document.getElementById('progressArea').innerHTML = App.renderProgress(5);
        const d = FormManager.getData();

        const section = (title, rows) => `
            <div class="card-modern mb-3">
                <div class="card-body-modern">
                    <h5 class="fw-bold text-success mb-3"><i class="bi bi-${title.icon}"></i> ${title.label}</h5>
                    ${rows.map(r => `
                        <div class="row py-2 border-bottom">
                            <div class="col-md-5 text-muted small">${r[0]}</div>
                            <div class="col-md-7 fw-semibold">${r[1] || '-'}</div>
                        </div>`).join('')}
                </div>
            </div>`;

        document.getElementById('reviewContent').innerHTML =
            section({ label: 'Data Diri', icon: 'person-fill' }, [
                ['Nama Lengkap', d.nama], ['NIK', d.nik], ['Tempat, Tanggal Lahir', `${d.tempatLahir}, ${App.formatDate(d.tanggalLahir)}`],
                ['Jenis Kelamin', d.jenisKelamin], ['Nomor HP', d.hp], ['Email', d.email],
                ['Email Pribadi', d.emailPribadi || '-'], ['Alamat Rumah', d.alamatRumah]
            ]) +
            section({ label: 'Data Usaha', icon: 'shop' }, [
                ['Nama Usaha', d.namaUsaha], ['Jenis Usaha', d.jenisUsaha]
            ]) +
            section({ label: 'Data Operasional', icon: 'gear-fill' }, [
                ['Tanggal Mulai', App.formatDate(d.tanggalMulai)],
                ['Jumlah Karyawan', d.jumlahKaryawanStatus === 'ada' ? d.jumlahKaryawan + ' orang' : 'Tidak ada'],
                ['Modal Usaha', App.formatRupiah(d.modal)],
                ['Omzet', App.formatRupiah(d.omzet)],
                ['Status Tempat', d.statusTempat]
            ]) +
            section({ label: 'Alamat Usaha', icon: 'geo-alt-fill' }, [
                ['Alamat', d.alamat], ['RT/RW', `${d.rt}/${d.rw}`],
                ['Desa/Kelurahan', d.desa], ['Kecamatan', d.kecamatan],
                ['Kabupaten', d.kabupaten], ['Provinsi', d.provinsi],
                ['Kode Pos', d.kodePos], ['Share Location', d.shareLocation || '-'],
                ['Luas Bangunan', d.luasBangunan ? d.luasBangunan + ' m²' : '-'],
                ['Luas Tempat Usaha', d.luasTempat ? d.luasTempat + ' m²' : '-'],
                ['Keterangan Lokasi', d.keteranganLokasi || '-']
            ]);

        document.getElementById('btnPrev').addEventListener('click', () => Router.go('alamat-usaha'));
        document.getElementById('btnSimpan').addEventListener('click', async () => {
            const result = await App.confirm('Simpan Data?', 'Pastikan data sudah benar sebelum disimpan.');
            if (result.isConfirmed) {
                FormManager.save();
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data telah tersimpan.', confirmButtonColor: '#16a34a' })
                    .then(() => { FormManager.reset(); Router.go('dashboard'); });
            }
        });
    },

    'dashboard': () => {
        renderDashboard();
        document.getElementById('btnExport')?.addEventListener('click', () => {
            if (Storage.getAll().length === 0) return App.toast('Belum ada data', 'warning');
            Storage.exportJSON();
            App.toast('Data berhasil di-export', 'success');
        });
        document.getElementById('btnImport')?.addEventListener('click', () => document.getElementById('fileImport').click());
        document.getElementById('fileImport')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const n = await Storage.importJSON(file);
                App.toast(`Berhasil import ${n} data`, 'success');
                renderDashboard();
            } catch { App.toast('File tidak valid', 'danger'); }
        });
        document.getElementById('btnBackup')?.addEventListener('click', () => Storage.exportJSON());
        document.getElementById('btnRestore')?.addEventListener('click', () => document.getElementById('fileImport').click());
        document.getElementById('btnReset')?.addEventListener('click', async () => {
            const r = await App.confirm('Reset Semua Data?', 'Tindakan ini tidak dapat dibatalkan!', 'error');
            if (r.isConfirmed) { Storage.resetAll(); renderDashboard(); App.toast('Semua data dihapus', 'info'); }
        });
    },

    'detail': (params) => {
        const d = Storage.getById(params.id);
        if (!d) { App.toast('Data tidak ditemukan', 'danger'); Router.go('dashboard'); return; }

        const row = (l, v) => `<div class="row py-2 border-bottom"><div class="col-md-5 text-muted">${l}</div><div class="col-md-7 fw-semibold">${v || '-'}</div></div>`;

        document.getElementById('detailContent').innerHTML =
            row('Nama Lengkap', d.nama) + row('NIK', d.nik) +
            row('Tempat, Tanggal Lahir', `${d.tempatLahir}, ${App.formatDate(d.tanggalLahir)}`) +
            row('Jenis Kelamin', d.jenisKelamin) + row('Nomor HP', d.hp) +
            row('Email', d.email) + row('Email Pribadi', d.emailPribadi) +
            row('Alamat Rumah', d.alamatRumah) +
            row('Nama Usaha', d.namaUsaha) + row('Jenis Usaha', d.jenisUsaha) +
            row('Tanggal Mulai', App.formatDate(d.tanggalMulai)) +
            row('Jumlah Karyawan', d.jumlahKaryawanStatus === 'ada' ? d.jumlahKaryawan + ' orang' : 'Tidak ada') +
            row('Modal Usaha', App.formatRupiah(d.modal)) + row('Omzet', App.formatRupiah(d.omzet)) +
            row('Status Tempat', d.statusTempat) + row('Alamat Usaha', d.alamat) +
            row('RT/RW', `${d.rt}/${d.rw}`) + row('Desa', d.desa) + row('Kecamatan', d.kecamatan) +
            row('Kabupaten', d.kabupaten) + row('Provinsi', d.provinsi) + row('Kode Pos', d.kodePos) +
            row('Share Location', d.shareLocation) +
            row('Luas Bangunan', d.luasBangunan ? d.luasBangunan + ' m²' : '-') +
            row('Luas Tempat Usaha', d.luasTempat ? d.luasTempat + ' m²' : '-') +
            row('Keterangan Lokasi', d.keteranganLokasi) +
            row('Tanggal Input', App.formatDate(d.createdAt));

        document.getElementById('btnBack').addEventListener('click', () => Router.go('dashboard'));
        document.getElementById('btnEdit').addEventListener('click', () => {
            FormManager.setEditing(d.id);
            Router.go('data-diri');
        });
        document.getElementById('btnPrint').addEventListener('click', () => window.print());
        document.getElementById('btnExportOne').addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `data-${d.nama.replace(/\s+/g,'-')}.json`; a.click();
        });
    }
};

/* ============================================
   HELPER: Render Sub Form Data Usaha
   ============================================ */
function renderSubForm(jenis, data) {
    const wrap = document.getElementById('subFormWrap');
    if (!wrap) return;

    const forms = {
        'Warung Sembako': `
            <input class="form-control mb-2" name="namaWarung" placeholder="Nama Warung" value="${data.namaWarung || ''}">
            <input type="date" class="form-control mb-2" name="mulaiUsahaWarung" value="${data.mulaiUsahaWarung || ''}">
            <input type="number" class="form-control mb-2" name="modalWarung" placeholder="Modal" value="${data.modalWarung || ''}">
            <input type="number" class="form-control mb-2" name="omzetWarung" placeholder="Omzet" value="${data.omzetWarung || ''}">
            <select class="form-select mb-2" name="statusTempatWarung">
                <option value="">Status Tempat</option>
                <option ${data.statusTempatWarung==='Milik Sendiri'?'selected':''}>Milik Sendiri</option>
                <option ${data.statusTempatWarung==='Sewa'?'selected':''}>Sewa</option>
                <option ${data.statusTempatWarung==='Menumpang'?'selected':''}>Menumpang</option>
            </select>
            <input type="number" class="form-control mb-3" name="luasBangunanWarung" placeholder="Luas Bangunan (m²)" value="${data.luasBangunanWarung || ''}">
            <label class="form-label fw-semibold">Fasilitas:</label>
            ${['LPG','Pulsa','Air Galon','Frozen Food','Rokok'].map(i => `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="fasilitas_${i}" id="f_${i}" ${data['fasilitas_'+i]?'checked':''}>
                    <label class="form-check-label" for="f_${i}">Menjual ${i}</label>
                </div>`).join('')}`,

        'Pertanian': `
            <input class="form-control mb-2" name="komoditas" placeholder="Komoditas" value="${data.komoditas || ''}">
            <input type="number" class="form-control mb-2" name="luasLahan" placeholder="Luas Lahan (m²)" value="${data.luasLahan || ''}">
            <input type="number" class="form-control mb-2" name="jumlahPanen" placeholder="Jumlah Panen" value="${data.jumlahPanen || ''}">
            <input type="number" class="form-control mb-2" name="produksiTani" placeholder="Produksi" value="${data.produksiTani || ''}">
            <input type="number" class="form-control mb-2" name="modalTani" placeholder="Modal" value="${data.modalTani || ''}">
            <input type="number" class="form-control mb-2" name="omzetTani" placeholder="Omzet" value="${data.omzetTani || ''}">`,

        'Peternakan': `
            <input class="form-control mb-2" name="jenisTernak" placeholder="Jenis Ternak" value="${data.jenisTernak || ''}">
            <input type="number" class="form-control mb-2" name="jumlahTernak" placeholder="Jumlah" value="${data.jumlahTernak || ''}">
            <input type="number" class="form-control mb-2" name="produksiTernak" placeholder="Produksi" value="${data.produksiTernak || ''}">
            <input type="number" class="form-control mb-2" name="modalTernak" placeholder="Modal" value="${data.modalTernak || ''}">
            <input type="number" class="form-control mb-2" name="omzetTernak" placeholder="Omzet" value="${data.omzetTernak || ''}">`,

        'Industri': `
            <input class="form-control mb-2" name="namaProduk" placeholder="Nama Produk" value="${data.namaProduk || ''}">
            <input type="number" class="form-control mb-2" name="produksiPerHari" placeholder="Produksi per Hari" value="${data.produksiPerHari || ''}">
            <input type="number" class="form-control mb-2" name="modalIndustri" placeholder="Modal" value="${data.modalIndustri || ''}">
            <input type="number" class="form-control mb-2" name="omzetIndustri" placeholder="Omzet" value="${data.omzetIndustri || ''}">
            <input type="number" class="form-control mb-2" name="jmlKaryawanIndustri" placeholder="Jumlah Karyawan" value="${data.jmlKaryawanIndustri || ''}">`,

        'Jasa': `
            <input class="form-control mb-2" name="jenisJasa" placeholder="Jenis Jasa" value="${data.jenisJasa || ''}">
            <input type="number" class="form-control mb-2" name="modalJasa" placeholder="Modal" value="${data.modalJasa || ''}">
            <input type="number" class="form-control mb-2" name="omzetJasa" placeholder="Omzet" value="${data.omzetJasa || ''}">`
    };

    // Kategori lain (Hortikultura, Kehutanan, Perdagangan, Makanan Minuman, Lainnya)
    const defaultForm = `
        <input class="form-control mb-2" name="keteranganUsaha" placeholder="Keterangan Usaha" value="${data.keteranganUsaha || ''}">
        <input type="number" class="form-control mb-2" name="modalLain" placeholder="Modal" value="${data.modalLain || ''}">
        <input type="number" class="form-control mb-2" name="omzetLain" placeholder="Omzet" value="${data.omzetLain || ''}">`;

    wrap.innerHTML = forms[jenis] || defaultForm;
}

/* ============================================
   HELPER: Render Dashboard
   ============================================ */
function renderDashboard() {
    const data = Storage.getAll();
    const list = document.getElementById('dataList');
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterJenis = document.getElementById('filterJenis')?.value || '';
    const filterStatus = document.getElementById('filterStatus')?.value || '';

    // Populate filter jenis
    const jenisSelect = document.getElementById('filterJenis');
    if (jenisSelect && jenisSelect.options.length <= 1) {
        const jenisSet = new Set(data.map(d => d.jenisUsaha).filter(Boolean));
        jenisSet.forEach(j => {
            const opt = document.createElement('option');
            opt.value = j; opt.textContent = j;
            jenisSelect.appendChild(opt);
        });
    }

    const filtered = data.filter(d => {
        const matchSearch = !search || (d.nama || '').toLowerCase().includes(search);
        const matchJenis = !filterJenis || d.jenisUsaha === filterJenis;
        const matchStatus = !filterStatus || d.status === filterStatus;
        return matchSearch && matchJenis && matchStatus;
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="text-center py-5 text-muted"><i class="bi bi-inbox" style="font-size:3rem"></i><p class="mt-2">Belum ada data</p></div>`;
        return;
    }

    list.innerHTML = filtered.map(d => `
        <div class="data-card mb-3 fade-in-up">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div class="flex-grow-1">
                    <h6 class="mb-1"><i class="bi bi-person-fill"></i> ${d.nama || '-'}</h6>
                    <div class="small text-muted"><i class="bi bi-shop"></i> ${d.jenisUsaha || '-'}</div>
                    <div class="small text-muted"><i class="bi bi-phone"></i> ${d.hp || '-'}</div>
                    <div class="small text-muted mt-1"><i class="bi bi-calendar3"></i> ${App.formatDate(d.createdAt)}</div>
                </div>
                <span class="status-badge status-${d.status || 'pending'}">${(d.status || 'pending').toUpperCase()}</span>
            </div>
            <div class="d-flex gap-2 mt-3 flex-wrap">
                <button class="btn btn-sm btn-outline-custom" onclick="Router.go('detail',{id:'${d.id}'})"><i class="bi bi-eye"></i> Detail</button>
                <button class="btn btn-sm btn-outline-custom" onclick="editData('${d.id}')"><i class="bi bi-pencil"></i> Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="hapusData('${d.id}')"><i class="bi bi-trash"></i> Hapus</button>
            </div>
        </div>`).join('');
}

function editData(id) { FormManager.setEditing(id); Router.go('data-diri'); }

async function hapusData(id) {
    const r = await App.confirm('Hapus Data?', 'Data yang dihapus tidak dapat dikembalikan.', 'error');
    if (r.isConfirmed) { Storage.remove(id); renderDashboard(); App.toast('Data dihapus', 'info'); }
}

// Event listener untuk search & filter
document.addEventListener('input', (e) => {
    if (e.target.id === 'searchInput' || e.target.id === 'filterJenis' || e.target.id === 'filterStatus') {
        if (document.getElementById('dataList')) renderDashboard();
    }
});
document.addEventListener('change', (e) => {
    if (e.target.id === 'filterJenis' || e.target.id === 'filterStatus') {
        if (document.getElementById('dataList')) renderDashboard();
    }
});

// Jalankan aplikasi
document.addEventListener('DOMContentLoaded', App.init);