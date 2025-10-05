// server.js (Perubahan yang ditambahkan)

// ... (Kode import dan connectDB())

// ====================================================================
// --- Middleware ---
// ====================================================================
app.use(cors()); 
app.use(express.json());

// ====================================================================
// --- Route Khusus Sitemap.xml (Tambahan untuk SEO) ---
// ====================================================================
app.get('/sitemap.xml', (req, res) => {
    // 1. Set header agar browser/bot tahu ini adalah XML
    res.header('Content-Type', 'application/xml');
    
    // 2. Konten XML Sitemap (Contoh Sederhana)
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://herbalapi.vercel.app/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://herbalapi.vercel.app/api/produk</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    </urlset>`;

    // 3. Kirim respons
    res.send(sitemapContent);
});

// ====================================================================
// --- Root Route ---
// ...