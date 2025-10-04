// server.js (Diubah ke ESM)

import express from 'express';
import cors from 'cors'; 
// Import router dan db dengan ekstensi .js (Wajib di ESM)
import salesRouter from './src/salesR.js'; 
import { connectDB } from './src/db.js'; 

const app = express();

// ====================================================================
// --- Koneksi Database (Wajib) ---
// HARUS dipanggil agar koneksi ke MongoDB terinisiasi.
// ====================================================================
connectDB(); 

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
// --- Eksport Aplikasi untuk Vercel (Ganti module.exports) ---
// ====================================================================
export default app; // Menggunakan export default untuk Vercel