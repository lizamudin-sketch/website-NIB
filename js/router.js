/* ============================================
   ROUTER MODULE
   Menangani navigasi SPA
   ============================================ */
const Router = (() => {
    const container = document.getElementById('appContainer');
    const routes = {
        'welcome':        { file: 'pages/welcome.html',        title: 'Selamat Datang' },
        'pilih-layanan':  { file: 'pages/pilih-layanan.html',  title: 'Pilih Layanan' },
        'data-diri':      { file: 'pages/data-diri.html',      title: 'Data Diri',      step: 1 },
        'data-usaha':     { file: 'pages/data-usaha.html',     title: 'Data Usaha',     step: 2 },
        'operasional':    { file: 'pages/operasional.html',    title: 'Data Operasional', step: 3 },
        'alamat-usaha':   { file: 'pages/alamat-usaha.html',   title: 'Alamat Usaha',   step: 4 },
        'review':         { file: 'pages/review.html',         title: 'Review',         step: 5 },
        'dashboard':      { file: 'pages/dashboard.html',      title: 'Dashboard' },
        'detail':         { file: 'pages/detail.html',         title: 'Detail' }
    };

    // Navigasi ke halaman
    const go = async (page, params = {}) => {
        const route = routes[page];
        if (!route) { console.error('Route tidak ditemukan:', page); return; }

        showLoading(true);
        try {
            const res = await fetch(route.file + '?v=' + Date.now());
            if (!res.ok) throw new Error('Gagal memuat halaman');
            let html = await res.text();

            // Inject params ke HTML (misal {{id}})
            Object.keys(params).forEach(k => {
                html = html.replaceAll('{{' + k + '}}', params[k]);
            });

            container.innerHTML = html;
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Panggil inisialisasi halaman jika ada
            if (typeof PageInit[page] === 'function') PageInit[page](params);

            // Update judul
            document.title = route.title + ' - Portal UMKM';
        } catch (err) {
            console.error(err);
            App.toast('Gagal memuat halaman', 'danger');
        } finally {
            showLoading(false);
        }
    };

    const showLoading = (show) => {
        document.getElementById('loadingOverlay').classList.toggle('d-none', !show);
    };

    return { go };
})();