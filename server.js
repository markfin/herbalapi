// src/server.js (Koreksi)
const express = require('express');
const cors = require('cors'); 
// KOREKSI UTAMA: Masuk ke folder 'src' untuk menemukan salesR.js
const salesRouter = require('./src/salesR'); 
const app = express();

// --- Ambil fungsi koneksi dari db.js ---
const { connectDB } = require('./src/db'); 

// ====================================================================
// --- Koneksi Database (Wajib) ---
// ====================================================================
connectDB(); // <--- BARIS INI DITAMBAHKAN!

// ====================================================================
// --- Middleware ---
// ====================================================================
app.use(cors()); 
app.use(express.json());

// ... (Kode selanjutnya tidak berubah)
module.exports = app;