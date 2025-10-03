const express = require('express');
const salesRouter = require('./src/salesR'); // Import router API
const app = express();
const PORT = 3000;

// ====================================================================
// --- Middleware (JSON Parser) ---
// ====================================================================
app.use(express.json());

// ====================================================================
// --- Root Route ---
// Memberikan daftar endpoint yang tersedia
// ====================================================================
app.get('/', (req, res) => {
    res.json({
        message: 'Selamat datang di API Manajemen Inventaris Herbal!',
        endpoints: {
            Produk: '/api/produk',
            Penjualan: '/api/penjualan',
            Pembelian: '/api/pembelian',
            Laporan: '/api/laporan/laba-kotor'
        },
        catatan: "Gunakan endpoint API di atas untuk berinteraksi dengan data."
    });
});

// ====================================================================
// --- Koneksi Router API ---
// Semua endpoint API akan diawali dengan /api
// ====================================================================
app.use('/api', salesRouter);

// ====================================================================
// --- Server Startup ---
// ====================================================================

app.listen(PORT, () => {
    console.log(`\n========================================================`);
    console.log(`Server API Herbal berjalan di: http://localhost:${PORT}`);
    console.log(`========================================================\n`);
    console.log(`API Structure: Main server (app.js) is running and uses salesRouter.js for all /api/* endpoints.`);
});
