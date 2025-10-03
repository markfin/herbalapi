const db = {
    // Data Produk Awal
    Produk: [
        { id_produk: 'PROD-001', nama_produk: 'Kunyit Kapsul', harga_jual: 55000, harga_beli: 30000, stok: 50, satuan: 'botol', kadaluarsa: '2026-10-01' },
        { id_produk: 'PROD-002', nama_produk: 'Minyak Habbatussauda', harga_jual: 120000, harga_beli: 80000, stok: 8, satuan: 'botol', kadaluarsa: '2027-01-15' },
        { id_produk: 'PROD-003', nama_produk: 'Teh Jahe Merah', harga_jual: 30000, harga_beli: 15000, stok: 25, satuan: 'bungkus', kadaluarsa: '2025-12-31' }
    ],
    // Data Transaksi
    Penjualan: [],
    Pembelian: [],
    // Data Master Lainnya
    Pelanggan: [{ id_pelanggan: 'CUST-001', nama_pelanggan: 'Ahmad' }],
    Supplier: [{ id_supplier: 'SUPP-001', nama_supplier: 'PT. Alam Sehat' }]
};

const MIN_STOCK_ALERT = 10;

/**
 * Mencari produk berdasarkan ID.
 * @param {string} id ID produk
 * @returns {object} Objek produk atau undefined
 */
const findProduct = (id) => db.Produk.find(p => p.id_produk === id);

module.exports = {
    db,
    findProduct,
    MIN_STOCK_ALERT
};
