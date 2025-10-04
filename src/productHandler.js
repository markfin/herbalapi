// src/productHandler.js - Menggunakan Mongoose Models (ESM)

// --- Menggunakan import ESM, harus menyertakan .js ---
import { Product, Sale, Purchase, MIN_STOCK_ALERT } from './db.js'; 
import { v4 as uuidv4 } from 'uuid'; // Menggunakan import untuk uuid

// --- Helper untuk Laporan (Diubah menjadi Async) ---
const calculateLabaKotor = async () => {
    let totalPendapatanKotor = 0;
    let totalHPP = 0;

    const allSales = await Sale.find({});

    for (const sale of allSales) {
        for (const item of sale.detail_item) {
            // Cari produk terkait untuk mendapatkan harga beli (HPP)
            const product = await Product.findOne({ id_produk: item.id_produk }); 
            const hargaBeli = product ? product.harga_beli : 0;
            
            totalPendapatanKotor += item.subtotal;
            totalHPP += (item.kuantitas * hargaBeli);
        }
    }

    return {
        total_pendapatan_kotor: totalPendapatanKotor,
        total_hpp_penjualan: totalHPP,
        laba_kotor: totalPendapatanKotor - totalHPP
    };
};

// ====================================================================
// A. Handlers Produk (CRUD) - Menggunakan export const
// ====================================================================

export const getAllProducts = async (req, res) => {
    const filter = {};
    
    if (req.query.stok_min) {
        filter.stok = { $gte: parseInt(req.query.stok_min) };
    }
    
    if (req.query.search) {
        filter.nama_produk = { $regex: req.query.search, $options: 'i' }; 
    }

    const filteredProduk = await Product.find(filter);
    res.json({ data: filteredProduk });
};

export const getProductById = async (req, res) => {
    const product = await Product.findOne({ id_produk: req.params.id }); 
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    res.json({ data: product });
};

export const getLowStockProducts = async (req, res) => {
    const lowStock = await Product.find({ stok: { $lt: MIN_STOCK_ALERT } }); 
    res.json({ data: lowStock, message: `Daftar produk dengan stok di bawah ${MIN_STOCK_ALERT}.` });
};

export const createProduct = async (req, res) => {
    const { nama_produk, deskripsi, harga_jual, harga_beli, stok, satuan, kadaluarsa } = req.body;

    if (!nama_produk || !harga_jual || stok === undefined) {
        return res.status(400).json({ message: 'Nama, Harga Jual, dan Stok wajib diisi.' });
    }

    const newProductData = {
        id_produk: uuidv4(), 
        nama_produk,
        deskripsi: deskripsi || '',
        harga_jual: Number(harga_jual),
        harga_beli: Number(harga_beli || 0),
        stok: Number(stok),
        satuan: satuan || 'unit',
        kadaluarsa: kadaluarsa || null,
    };

    try {
        const newProduct = await Product.create(newProductData); 
        res.status(201).json({ message: 'Produk berhasil ditambahkan.', data: newProduct });
    } catch (error) {
        if (error.code === 11000) { 
            return res.status(400).json({ message: 'ID Produk duplikat terdeteksi.' });
        }
        res.status(500).json({ message: 'Gagal membuat produk.', error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const updatedProduct = await Product.findOneAndUpdate(
        { id_produk: req.params.id }, 
        { $set: req.body }, 
        { new: true, runValidators: true } 
    );
    
    if (!updatedProduct) return res.status(404).json({ message: 'Produk tidak ditemukan.' });

    res.json({ message: 'Produk berhasil diperbarui.', data: updatedProduct });
};

// ====================================================================
// B. Handlers Penjualan
// ====================================================================

export const createSale = async (req, res) => {
    const { id_pelanggan, detail_item, metode_pembayaran } = req.body;
    let totalHarga = 0;
    let stockErrors = [];
    let saleDetails = [];

    // --- 1. Validasi Stok ---
    for (const item of detail_item) {
        const product = await Product.findOne({ id_produk: item.id_produk }); 
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
    try {
        for (const item of detail_item) {
            const product = await Product.findOne({ id_produk: item.id_produk });
            const kuantitas = Number(item.kuantitas);
            const hargaJual = product.harga_jual;
            const subtotal = kuantitas * hargaJual;

            totalHarga += subtotal;
            
            // Pengurangan Stok Otomatis menggunakan Mongoose $inc
            await Product.updateOne(
                { id_produk: item.id_produk },
                { $inc: { stok: -kuantitas } } 
            );

            saleDetails.push({ id_produk: item.id_produk, kuantitas, harga_per_unit: hargaJual, subtotal });
        }

        // --- 3. Mencatat Transaksi Penjualan ---
        const newSaleData = {
            id_penjualan: uuidv4(),
            tanggal_penjualan: new Date(), 
            id_pelanggan: id_pelanggan || 'CUST-001 (Default)',
            total_harga: totalHarga,
            status_pembayaran: 'Lunas',
            metode_pembayaran: metode_pembayaran || 'Tunai',
            detail_item: saleDetails
        };

        const newSale = await Sale.create(newSaleData); 

        return res.status(201).json({ message: 'Penjualan berhasil dicatat dan stok diperbarui.', data: newSale });

    } catch (error) {
        console.error("Sale transaction failed:", error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada transaksi penjualan. Transaksi gagal dicatat.', error: error.message });
    }
};

export const getAllSales = async (req, res) => {
    const allSales = await Sale.find({});
    res.json({ data: allSales });
};


// ====================================================================
// C. Handlers Pembelian
// ====================================================================

export const createPurchase = async (req, res) => {
    const { id_supplier, detail_pembelian } = req.body;
    let totalBiaya = 0;
    let purchaseDetails = [];

    // --- 1. Validasi dan Pembaruan Stok ---
    try {
        for (const item of detail_pembelian) {
            const product = await Product.findOne({ id_produk: item.id_produk });
            const kuantitas = Number(item.kuantitas);
            const hargaBeli = Number(item.harga_per_unit_beli);

            if (!product) return res.status(404).json({ message: `Produk ID ${item.id_produk} tidak ditemukan.` });
            if (kuantitas <= 0 || hargaBeli <= 0) {
                return res.status(400).json({ message: 'Kuantitas dan Harga Beli harus positif.' });
            }

            const subtotal = kuantitas * hargaBeli;
            totalBiaya += subtotal;

            purchaseDetails.push({ ...item, subtotal_beli: subtotal });

            // Penambahan Stok Otomatis dan Update Harga Beli
            await Product.updateOne(
                { id_produk: item.id_produk },
                { 
                    $inc: { stok: kuantitas }, 
                    $set: { harga_beli: hargaBeli } 
                }
            );
        }

        // --- 2. Mencatat Transaksi Pembelian ---
        const newPurchaseData = {
            id_pembelian: uuidv4(),
            tanggal_pembelian: new Date(),
            id_supplier: id_supplier || 'SUPP-001 (Default)',
            total_biaya: totalBiaya,
            status_pembayaran: 'Dibayar',
            detail_pembelian: purchaseDetails
        };

        const newPurchase = await Purchase.create(newPurchaseData); 

        return res.status(201).json({ message: 'Pembelian berhasil dicatat dan stok diperbarui.', data: newPurchase });

    } catch (error) {
        console.error("Purchase transaction failed:", error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada transaksi pembelian. Transaksi gagal dicatat.', error: error.message });
    }
};


// ====================================================================
// D. Handlers Laporan
// ====================================================================

export const getGrossProfitReport = async (req, res) => {
    const labaKotorData = await calculateLabaKotor(); 
    res.json({ 
        message: 'Laporan Laba Kotor Kumulatif',
        data: labaKotorData 
    });
};