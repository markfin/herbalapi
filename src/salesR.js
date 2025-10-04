// src/salesR.js (Diubah ke ESM)

import express from 'express';
import * as handlers from './productHandler.js'; // Import semua exports dari productHandler
const router = express.Router();

// Middleware untuk menangani error pada fungsi async
const asyncHandler = fn => (req, res, next) => {
    // Menggunakan Promise.resolve untuk menangkap error pada fungsi async dan mengirim respons 500
    Promise.resolve(fn(req, res, next)).catch(error => {
        console.error(`Unhandled error in handler for ${req.path}:`, error);
        res.status(500).json({ message: 'Terjadi kesalahan server yang tidak terduga.', error: error.message });
    });
};

// ====================================================================
// A. Routes Produk
// ====================================================================

router.get('/produk', asyncHandler(handlers.getAllProducts)); 
router.get('/produk/stok-rendah', asyncHandler(handlers.getLowStockProducts)); 
router.get('/produk/:id', asyncHandler(handlers.getProductById)); 
router.post('/produk', asyncHandler(handlers.createProduct)); 
router.put('/produk/:id', asyncHandler(handlers.updateProduct)); 

// ====================================================================
// B. Routes Penjualan & Pembelian
// ====================================================================

router.get('/penjualan', asyncHandler(handlers.getAllSales)); 
router.post('/penjualan', asyncHandler(handlers.createSale)); 
router.post('/pembelian', asyncHandler(handlers.createPurchase)); 

// ====================================================================
// D. Routes Laporan
// ====================================================================

router.get('/laporan/laba-kotor', asyncHandler(handlers.getGrossProfitReport)); 

export default router; // Menggunakan export default