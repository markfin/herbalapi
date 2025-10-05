// src/db.js - Koneksi MongoDB (Mongoose)

import mongoose from 'mongoose'; // <-- HANYA import paket eksternal

// Baris ini dihapus karena menyebabkan error "Identifier 'Product' has already been declared":
// import { Product, Sale, Purchase, MIN_STOCK_ALERT } from './db.js'; 

// Mengambil URI dari Environment Variable (Wajib untuk Vercel)
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://marfinzamaruddin_db_user:9VSmRKf$Fp$$U83@cluster0.h4lnj57.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; 

// --- Skema Mongoose ---

// 1. Skema Produk
const productSchema = new mongoose.Schema({
    id_produk: { type: String, required: true, unique: true }, 
    nama_produk: { type: String, required: true },
    harga_jual: { type: Number, required: true, min: 0 },
    harga_beli: { type: Number, default: 0, min: 0 },
    stok: { type: Number, default: 0, min: 0 },
    satuan: { type: String, default: 'unit' },
    kadaluarsa: { type: Date, default: null },
    deskripsi: { type: String, default: '' },
    status: { type: String, default: 'Aktif' }
}, { timestamps: true });

// 2. Skema Detail Item Penjualan
const detailSaleSchema = new mongoose.Schema({
    id_produk: { type: String, required: true },
    nama_produk: { type: String, required: true },
    kuantitas: { type: Number, required: true, min: 1 },
    harga_jual_unit: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

// 3. Skema Penjualan
const saleSchema = new mongoose.Schema({
    id_penjualan: { type: String, required: true, unique: true },
    tanggal_penjualan: { type: Date, default: Date.now },
    id_pelanggan: { type: String, default: 'CUST-001 (Default)' },
    total_pendapatan: { type: Number, required: true, min: 0 },
    status_pembayaran: { type: String, default: 'Dibayar' },
    detail_item: [detailSaleSchema]
}, { timestamps: true });

// 4. Skema Detail Item Pembelian
const detailPurchaseSchema = new mongoose.Schema({
    id_produk: { type: String, required: true },
    kuantitas: { type: Number, required: true, min: 1 },
    harga_per_unit_beli: { type: Number, required: true, min: 0 },
    subtotal_beli: { type: Number, required: true, min: 0 }
}, { _id: false });

// 5. Skema Pembelian
const purchaseSchema = new mongoose.Schema({
    id_pembelian: { type: String, required: true, unique: true },
    tanggal_pembelian: { type: Date, default: Date.now },
    id_supplier: { type: String, default: 'SUPP-001 (Default)' },
    total_biaya: { type: Number, required: true, min: 0 },
    status_pembayaran: { type: String, default: 'Dibayar' },
    detail_pembelian: [detailPurchaseSchema]
}, { timestamps: true });


// --- Model Mongoose ---

const Product = mongoose.model('Product', productSchema);
const Sale = mongoose.model('Sale', saleSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);

// --- Fungsi Koneksi ---

/**
 * Menghubungkan ke MongoDB
 */
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB berhasil terhubung!');
    } catch (err) {
        console.error('Koneksi MongoDB Gagal:', err.message);
        // Keluar dari proses jika gagal terhubung
        process.exit(1); 
    }
};

// --- Fungsi Helper yang Diperlukan oleh productHandler ---
const MIN_STOCK_ALERT = 10;

/**
 * Mencari produk berdasarkan ID (digunakan di productHandler untuk logika Penjualan/Pembelian)
 * @param {string} id_produk ID Produk
 * @returns {Promise<object>} Objek produk atau null
 */
const findProduct = async (id_produk) => {
    return Product.findOne({ id_produk });
};

// --- Export Module ---

// Ekspor semua model dan fungsi yang dibutuhkan file lain:
export { connectDB, Product, Sale, Purchase, MIN_STOCK_ALERT, findProduct };