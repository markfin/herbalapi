const express = require('express');
const cors = require('cors'); 
// KOREKSI UTAMA: Masuk ke folder 'src' untuk menemukan salesR.js
const salesRouter = require('./src/salesR'); 
const app = express();

// ====================================================================
// --- Middleware ---
// ====================================================================
app.use(cors()); 
app.use(express.json());

// ====================================================================
// --- Root Route ---
// ====================================================================
app.get('/', (req, res) => {
    res.json({
        message: 'Selamat datang di API Manajemen Inventaris Herbal! (Siap di Vercel)',
        endpoints: {
            Produk: 'GET /api/produk',
            Penjualan: 'POST /api/penjualan',
            Pembelian: 'POST /api/pembelian',
            Laporan: 'GET /api/laporan/laba-kotor'
        }
    });
});

// ====================================================================
// --- Koneksi Router API ---
// ====================================================================
app.use('/api', salesRouter);

// ====================================================================
// --- Eksport Aplikasi untuk Vercel (Wajib untuk Serverless) ---
// Hapus app.listen() dan gunakan ini sebagai gantinya.
// ====================================================================
module.exports = app; 
