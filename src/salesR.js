// const express = require('express');
// const router = express.Router();
// const handlers = require('./productHandler');

// // Middleware untuk menangani error pada fungsi async
// const asyncHandler = fn => (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch(error => {
//         console.error(`Unhandled error in handler for ${req.path}:`, error);
//         res.status(500).json({ message: 'Terjadi kesalahan server yang tidak terduga.', error: error.message });
//     });
// };

// // ====================================================================
// // A. Routes Produk
// // ====================================================================

// router.get('/produk', asyncHandler(handlers.getAllProducts)); // GET /api/produk
// router.get('/produk/stok-rendah', asyncHandler(handlers.getLowStockProducts)); // GET /api/produk/stok-rendah
// router.get('/produk/:id', asyncHandler(handlers.getProductById)); // GET /api/produk/{id}
// router.post('/produk', asyncHandler(handlers.createProduct)); // POST /api/produk
// router.put('/produk/:id', asyncHandler(handlers.updateProduct)); // PUT /api/produk/{id}

// // ====================================================================
// // B. Routes Penjualan
// // ====================================================================

// router.get('/penjualan', asyncHandler(handlers.getAllSales)); // GET /api/penjualan
// router.post('/penjualan', asyncHandler(handlers.createSale)); // POST /api/penjualan (KRUSIAL)

// // ====================================================================
// // C. Routes Pembelian
// // ====================================================================

// router.post('/pembelian', asyncHandler(handlers.createPurchase)); // POST /api/pembelian (KRUSIAL)

// // ====================================================================
// // D. Routes Laporan
// // ====================================================================

// router.get('/laporan/laba-kotor', asyncHandler(handlers.getGrossProfitReport)); // GET /api/laporan/laba-kotor

// module.exports = router;

/////////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const router = express.Router();
const handlers = require('./productHandler'); // Path diperbaiki

// Middleware untuk menangani error pada fungsi async
const asyncHandler = fn => (req, res, next) => {
    // Menjalankan handler async dan menangkap error
    Promise.resolve(fn(req, res, next)).catch(error => {
        console.error(`Unhandled error in handler for ${req.path}:`, error);
        // Mengirim respons 500 yang aman ke client
        res.status(500).json({ message: 'Terjadi kesalahan server yang tidak terduga.', error: error.message });
    });
};

// ====================================================================
// A. Routes Produk
// ====================================================================

router.get('/produk', asyncHandler(handlers.getAllProducts)); // GET /api/produk
router.get('/produk/stok-rendah', asyncHandler(handlers.getLowStockProducts)); // GET /api/produk/stok-rendah
router.get('/produk/:id', asyncHandler(handlers.getProductById)); // GET /api/produk/{id}
router.post('/produk', asyncHandler(handlers.createProduct)); // POST /api/produk
router.put('/produk/:id', asyncHandler(handlers.updateProduct)); // PUT /api/produk/{id}

// ====================================================================
// B. Routes Penjualan
// ====================================================================

router.get('/penjualan', asyncHandler(handlers.getAllSales)); // GET /api/penjualan
router.post('/penjualan', asyncHandler(handlers.createSale)); // POST /api/penjualan (KRUSIAL)

// ====================================================================
// C. Routes Pembelian
// ====================================================================

router.post('/pembelian', asyncHandler(handlers.createPurchase)); // POST /api/pembelian (KRUSIAL)

// ====================================================================
// D. Routes Laporan
// ====================================================================

router.get('/laporan/laba-kotor', asyncHandler(handlers.getGrossProfitReport)); // GET /api/laporan/laba-kotor

module.exports = router;
