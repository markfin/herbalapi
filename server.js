// const express = require('express');
// const salesRouter = require('./src/salesR'); // Import router API
// const app = express();
// const PORT = 3000;

// // ====================================================================
// // --- Middleware (JSON Parser) ---
// // ====================================================================
// app.use(express.json());

// // ====================================================================
// // --- Root Route ---
// // Memberikan daftar endpoint yang tersedia
// // ====================================================================
// app.get('/', (req, res) => {
//     res.json({
//         message: 'Selamat datang di API Manajemen Inventaris Herbal!',
//         endpoints: {
//             Produk: '/api/produk',
//             Penjualan: '/api/penjualan',
//             Pembelian: '/api/pembelian',
//             Laporan: '/api/laporan/laba-kotor'
//         },
//         catatan: "Gunakan endpoint API di atas untuk berinteraksi dengan data."
//     });
// });

// // ====================================================================
// // --- Koneksi Router API ---
// // Semua endpoint API akan diawali dengan /api
// // ====================================================================
// app.use('/api', salesRouter);

// // ====================================================================
// // --- Server Startup ---
// // ====================================================================

// app.listen(PORT, () => {
//     console.log(`\n========================================================`);
//     console.log(`Server API Herbal berjalan di: http://localhost:${PORT}`);
//     console.log(`========================================================\n`);
//     console.log(`API Structure: Main server (app.js) is running and uses salesRouter.js for all /api/* endpoints.`);
// });


// //////////////////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const salesRouter = require('./src/salesR'); // Import router API (salesR.js)
const app = express();
// CATATAN PENTING: PORT TIDAK DIDEFINISIKAN KARENA VERCEL MENANGANI LISTENING PORT.
const cors = require('cors'); // Tambahkan CORS untuk akses dari frontend manapun

// ====================================================================
// --- Middleware (CORS & JSON Parser) ---
// ====================================================================
app.use(cors()); // Izinkan semua domain untuk mengakses API
app.use(express.json());

// ====================================================================
// --- Root Route ---
// Memberikan daftar endpoint yang tersedia
// ====================================================================
app.get('/', (req, res) => {
    res.json({
        message: 'Selamat datang di API Manajemen Inventaris Herbal! (Deployed on Vercel)',
        endpoints: {
            Produk: 'GET /api/produk',
            Penjualan: 'POST /api/penjualan',
            Pembelian: 'POST /api/pembelian',
            Laporan: 'GET /api/laporan/laba-kotor'
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
// --- Eksport Aplikasi untuk Vercel (PENTING!) ---
// Vercel menjalankan fungsi ini untuk setiap permintaan, BUKAN app.listen()
// ====================================================================
module.exports = app;
