// const { db, findProduct, MIN_STOCK_ALERT } = require('./db');
// const { v4: uuidv4 } = require('uuid');

// // --- Helper untuk Laporan ---
// const calculateLabaKotor = () => {
//     let totalPendapatanKotor = 0;
//     let totalHPP = 0;

//     db.Penjualan.forEach(sale => {
//         sale.detail_item.forEach(item => {
//             const product = findProduct(item.id_produk);
//             const hargaBeli = product ? product.harga_beli : 0;
            
//             totalPendapatanKotor += item.subtotal;
//             totalHPP += (item.kuantitas * hargaBeli);
//         });
//     });

//     return {
//         total_pendapatan_kotor: totalPendapatanKotor,
//         total_hpp_penjualan: totalHPP,
//         laba_kotor: totalPendapatanKotor - totalHPP
//     };
// };

// // ====================================================================
// // A. Handlers Produk
// // ====================================================================

// exports.getAllProducts = async (req, res) => {
//     let filteredProduk = db.Produk;
    
//     if (req.query.stok_min) {
//         const minStock = parseInt(req.query.stok_min);
//         filteredProduk = filteredProduk.filter(p => p.stok >= minStock);
//     }
    
//     if (req.query.search) {
//         const searchTerm = req.query.search.toLowerCase();
//         filteredProduk = filteredProduk.filter(p => p.nama_produk.toLowerCase().includes(searchTerm));
//     }

//     return res.json(filteredProduk);
// };

// exports.getProductById = async (req, res) => {
//     const product = findProduct(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
//     return res.json(product);
// };

// exports.createProduct = async (req, res) => {
//     const { nama_produk, harga_jual, harga_beli, stok, satuan } = req.body;
//     if (!nama_produk || !harga_jual || !stok || !satuan) {
//         return res.status(400).json({ message: 'Bidang wajib (nama, harga jual, stok, satuan) tidak lengkap.' });
//     }

//     const newProduct = {
//         id_produk: uuidv4(),
//         nama_produk,
//         harga_jual: parseFloat(harga_jual),
//         harga_beli: parseFloat(harga_beli || 0),
//         stok: parseInt(stok),
//         satuan,
//         kadaluarsa: req.body.kadaluarsa || 'N/A',
//         status: 'Aktif'
//     };

//     db.Produk.push(newProduct);
//     return res.status(201).json({ message: 'Produk berhasil ditambahkan.', data: newProduct });
// };

// exports.updateProduct = async (req, res) => {
//     const index = db.Produk.findIndex(p => p.id_produk === req.params.id);
//     if (index === -1) return res.status(404).json({ message: 'Produk tidak ditemukan.' });

//     db.Produk[index] = { ...db.Produk[index], ...req.body };
//     return res.json({ message: 'Produk berhasil diperbarui.', data: db.Produk[index] });
// };

// exports.getLowStockProducts = async (req, res) => {
//     const lowStockProducts = db.Produk.filter(p => p.stok < MIN_STOCK_ALERT);
//     return res.json(lowStockProducts);
// };


// // ====================================================================
// // B. Handlers Penjualan (LOGIKA KRUSIAL)
// // ====================================================================

// exports.createSale = async (req, res) => {
//     const { id_pelanggan, metode_pembayaran, detail_item } = req.body;
//     if (!detail_item || detail_item.length === 0) {
//         return res.status(400).json({ message: 'Detail item penjualan tidak boleh kosong.' });
//     }

//     let totalHarga = 0;
//     const transactionDetails = [];
    
//     // --- Validasi dan Kalkulasi ---
//     for (const item of detail_item) {
//         const product = findProduct(item.id_produk);
//         const kuantitas = parseInt(item.kuantitas);

//         if (!product) return res.status(404).json({ message: `Produk ID ${item.id_produk} tidak ditemukan.` });
        
//         // **Validasi Stok**
//         if (product.stok < kuantitas) {
//             return res.status(400).json({ message: `Stok ${product.nama_produk} tidak cukup. Tersedia: ${product.stok}.` });
//         }

//         const subtotal = kuantitas * product.harga_jual;
//         totalHarga += subtotal;

//         transactionDetails.push({
//             id_detail: uuidv4(),
//             id_produk: item.id_produk,
//             kuantitas,
//             harga_per_unit: product.harga_jual,
//             subtotal
//         });
//     }

//     // --- Mencatat Transaksi dan Mengurangi Stok ---
//     const newSaleId = uuidv4();
//     const newSale = {
//         id_penjualan: newSaleId,
//         tanggal_penjualan: new Date().toISOString(),
//         id_pelanggan: id_pelanggan || 'CUST-001',
//         total_harga: totalHarga,
//         metode_pembayaran: metode_pembayaran || 'Tunai',
//         detail_item: transactionDetails
//     };

//     db.Penjualan.push(newSale);

//     // **Pengurangan Stok Otomatis**
//     transactionDetails.forEach(detail => {
//         const product = findProduct(detail.id_produk);
//         product.stok -= detail.kuantitas;
//     });

//     return res.status(201).json({ message: 'Penjualan berhasil dicatat dan stok diperbarui.', data: newSale });
// };

// exports.getAllSales = async (req, res) => {
//     return res.json(db.Penjualan);
// };


// // ====================================================================
// // C. Handlers Pembelian (LOGIKA KRUSIAL)
// // ====================================================================

// exports.createPurchase = async (req, res) => {
//     const { id_supplier, detail_pembelian } = req.body;
//     if (!detail_pembelian || detail_pembelian.length === 0) {
//         return res.status(400).json({ message: 'Detail item pembelian tidak boleh kosong.' });
//     }

//     let totalBiaya = 0;
//     const purchaseDetails = [];

//     // --- Validasi, Penambahan Stok, dan Update Harga Beli ---
//     for (const item of detail_pembelian) {
//         const product = findProduct(item.id_produk);
//         const kuantitas = parseInt(item.kuantitas);
//         const hargaBeli = parseFloat(item.harga_per_unit_beli);

//         if (!product) return res.status(404).json({ message: `Produk ID ${item.id_produk} tidak ditemukan.` });
//         if (kuantitas <= 0 || hargaBeli <= 0) {
//             return res.status(400).json({ message: 'Kuantitas dan Harga Beli harus positif.' });
//         }

//         const subtotal = kuantitas * hargaBeli;
//         totalBiaya += subtotal;

//         purchaseDetails.push({ ...item, subtotal_beli: subtotal });

//         // **Penambahan Stok Otomatis dan Update Harga Beli**
//         product.stok += kuantitas;
//         product.harga_beli = hargaBeli;
//     }

//     // --- Mencatat Transaksi Pembelian ---
//     const newPurchase = {
//         id_pembelian: uuidv4(),
//         tanggal_pembelian: new Date().toISOString(),
//         id_supplier: id_supplier || 'SUPP-001',
//         total_biaya: totalBiaya,
//         status_pembayaran: 'Dibayar',
//         detail_pembelian: purchaseDetails
//     };

//     db.Pembelian.push(newPurchase);

//     return res.status(201).json({ message: 'Pembelian berhasil dicatat dan stok diperbarui.', data: newPurchase });
// };


// // ====================================================================
// // D. Handlers Laporan
// // ====================================================================

// exports.getGrossProfitReport = async (req, res) => {
//     const report = calculateLabaKotor();

//     return res.json({
//         ...report,
//         catatan: "Perhitungan HPP menggunakan harga beli produk terakhir."
//     });
// };

////////////////////////////////////////////////////////////////////////

// PATH BENAR: './db' karena ada di folder yang sama (src)
const { db, findProduct, MIN_STOCK_ALERT } = require('./db'); 
const { v4: uuidv4 } = require('uuid');

// --- Helper untuk Laporan ---
const calculateLabaKotor = () => {
    let totalPendapatanKotor = 0;
    let totalHPP = 0;

    db.Penjualan.forEach(sale => {
        sale.detail_item.forEach(item => {
            const product = findProduct(item.id_produk);
            const hargaBeli = product ? product.harga_beli : 0;
            
            totalPendapatanKotor += item.subtotal;
            totalHPP += (item.kuantitas * hargaBeli);
        });
    });

    return {
        total_pendapatan_kotor: totalPendapatanKotor,
        total_hpp_penjualan: totalHPP,
        laba_kotor: totalPendapatanKotor - totalHPP
    };
};

// ====================================================================
// A. Handlers Produk
// ====================================================================

exports.getAllProducts = async (req, res) => {
    let filteredProduk = db.Produk;
    
    if (req.query.stok_min) {
        const minStock = parseInt(req.query.stok_min);
        filteredProduk = filteredProduk.filter(p => p.stok >= minStock);
    }
    
    // Pencarian berdasarkan nama produk
    if (req.query.search) {
        const search = req.query.search.toLowerCase();
        filteredProduk = filteredProduk.filter(p => p.nama_produk.toLowerCase().includes(search));
    }

    res.json({ data: filteredProduk });
};

exports.getProductById = async (req, res) => {
    const product = findProduct(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    res.json({ data: product });
};

exports.getLowStockProducts = async (req, res) => {
    const lowStock = db.Produk.filter(p => p.stok < MIN_STOCK_ALERT);
    res.json({ data: lowStock, message: `Daftar produk dengan stok di bawah ${MIN_STOCK_ALERT}.` });
};

exports.createProduct = async (req, res) => {
    const { nama_produk, deskripsi, harga_jual, harga_beli, stok, satuan, kadaluarsa } = req.body;

    if (!nama_produk || !harga_jual || stok === undefined) {
        return res.status(400).json({ message: 'Nama, Harga Jual, dan Stok wajib diisi.' });
    }

    const newProduct = {
        id_produk: uuidv4(),
        nama_produk,
        deskripsi: deskripsi || '',
        harga_jual: Number(harga_jual),
        harga_beli: Number(harga_beli || 0),
        stok: Number(stok),
        satuan: satuan || 'unit',
        kadaluarsa: kadaluarsa || null,
    };

    db.Produk.push(newProduct);
    res.status(201).json({ message: 'Produk berhasil ditambahkan.', data: newProduct });
};

exports.updateProduct = async (req, res) => {
    const product = findProduct(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan.' });

    // Update field yang diperbolehkan
    Object.assign(product, req.body);
    
    // Pastikan nilai numerik di-update dengan benar
    if (req.body.harga_jual !== undefined) product.harga_jual = Number(req.body.harga_jual);
    if (req.body.harga_beli !== undefined) product.harga_beli = Number(req.body.harga_beli);
    if (req.body.stok !== undefined) product.stok = Number(req.body.stok);

    res.json({ message: 'Produk berhasil diperbarui.', data: product });
};

// ====================================================================
// B. Handlers Penjualan (Stok Otomatis Keluar)
// ====================================================================

exports.createSale = async (req, res) => {
    const { id_pelanggan, detail_item, metode_pembayaran } = req.body;
    let totalHarga = 0;
    let stockErrors = [];
    let saleDetails = [];

    // --- 1. Validasi Stok (Semua atau Tidak Sama Sekali) ---
    for (const item of detail_item) {
        const product = findProduct(item.id_produk);
        const kuantitas = Number(item.kuantitas);

        if (!product) {
            stockErrors.push(`Produk ID ${item.id_produk} tidak ditemukan.`);
        } else if (product.stok < kuantitas) {
            stockErrors.push(`Stok ${product.nama_produk} tidak cukup. (Tersisa: ${product.stok}, Diminta: ${kuantitas})`);
        }
    }

    if (stockErrors.length > 0) {
        return res.status(400).json({ message: 'Validasi stok gagal. Transaksi dibatalkan.', errors: stockErrors });
    }

    // --- 2. Proses Penjualan dan Pengurangan Stok Atomik ---
    for (const item of detail_item) {
        const product = findProduct(item.id_produk);
        const kuantitas = Number(item.kuantitas);
        const hargaJual = product.harga_jual;
        const subtotal = kuantitas * hargaJual;

        totalHarga += subtotal;
        
        // **Pengurangan Stok Otomatis**
        product.stok -= kuantitas;

        saleDetails.push({ ...item, harga_per_unit: hargaJual, subtotal });
    }

    // --- 3. Mencatat Transaksi Penjualan ---
    const newSale = {
        id_penjualan: uuidv4(),
        tanggal_penjualan: new Date().toISOString(),
        id_pelanggan: id_pelanggan || 'CUST-001 (Default)',
        total_harga: totalHarga,
        status_pembayaran: 'Lunas',
        metode_pembayaran: metode_pembayaran || 'Tunai',
        detail_item: saleDetails
    };

    db.Penjualan.push(newSale);

    return res.status(201).json({ message: 'Penjualan berhasil dicatat dan stok diperbarui.', data: newSale });
};

exports.getAllSales = async (req, res) => {
    res.json({ data: db.Penjualan });
};


// ====================================================================
// C. Handlers Pembelian (Stok Otomatis Masuk)
// ====================================================================

exports.createPurchase = async (req, res) => {
    const { id_supplier, detail_pembelian } = req.body;
    let totalBiaya = 0;
    let purchaseDetails = [];

    // --- 1. Validasi dan Pembaruan Stok ---
    for (const item of detail_pembelian) {
        const product = findProduct(item.id_produk);
        const kuantitas = Number(item.kuantitas);
        const hargaBeli = Number(item.harga_per_unit_beli);

        if (!product) return res.status(404).json({ message: `Produk ID ${item.id_produk} tidak ditemukan.` });
        if (kuantitas <= 0 || hargaBeli <= 0) {
            return res.status(400).json({ message: 'Kuantitas dan Harga Beli harus positif.' });
        }

        const subtotal = kuantitas * hargaBeli;
        totalBiaya += subtotal;

        purchaseDetails.push({ ...item, subtotal_beli: subtotal });

        // **Penambahan Stok Otomatis dan Update Harga Beli**
        product.stok += kuantitas;
        product.harga_beli = hargaBeli; // Update harga beli terbaru
    }

    // --- 2. Mencatat Transaksi Pembelian ---
    const newPurchase = {
        id_pembelian: uuidv4(),
        tanggal_pembelian: new Date().toISOString(),
        id_supplier: id_supplier || 'SUPP-001 (Default)',
        total_biaya: totalBiaya,
        status_pembayaran: 'Dibayar',
        detail_pembelian: purchaseDetails
    };

    db.Pembelian.push(newPurchase);

    return res.status(201).json({ message: 'Pembelian berhasil dicatat dan stok diperbarui.', data: newPurchase });
};


// ====================================================================
// D. Handlers Laporan
// ====================================================================

exports.getGrossProfitReport = async (req, res) => {
    const labaKotorData = calculateLabaKotor();
    res.json({ 
        message: 'Laporan Laba Kotor Kumulatif',
        data: labaKotorData 
    });
};
