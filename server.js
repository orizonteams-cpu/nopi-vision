const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // สำหรับไฟล์ static เช่น css, images

// --- Supabase Setup ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- API: Bot Update (สถิติจากบอท) ---
app.post('/api/update-stats', async (req, res) => {
    try {
        const secret = req.headers['authorization'];
        if (!secret || secret !== process.env.API_SECRET_TOKEN) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const d = req.body;
        const updateData = { 
            total_scanned: parseInt(d.total_scanned) || 0, 
            total_deleted: parseInt(d.total_deleted) || 0, 
            penis_count: parseInt(d.penis_count) || 0, 
            pussy_count: parseInt(d.pussy_count) || 0,
            server_count: parseInt(d.servers) || 0,
            user_count: parseInt(d.users) || 0,
            bot_os: d.sys_os || 'Unknown',
            bot_cpu_model: d.sys_cpu || '0%', 
            bot_mem_used: parseFloat(d.sys_mem_used) || 0,
            bot_mem_total: parseFloat(d.sys_mem_total) || 0,
            bot_mem_percent: parseFloat(d.sys_mem_percent) || 0,
            bot_uptime: String(d.sys_uptime || '0'),
            status: d.status || 'online',
            last_update: new Date().toISOString() 
        };

        const { error } = await supabase.from('nopi_stats').update(updateData).eq('id', 1);
        if (error) throw error;

        res.status(200).json({ message: "Data Synced" });
    } catch (err) {
        console.error("❌ Sync Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- API: Get Stats (ดึงไปโชว์หน้าเว็บ) ---
app.get('/api/get-stats', async (req, res) => {
    const { data, error } = await supabase.from('nopi_stats').select('*').eq('id', 1).single();
    if (error) return res.status(500).json(error);
    res.json(data);
});

// --- 🌐 Page Routing (แมตช์ตามไฟล์ใน views ของคุณ) ---

// หน้าแรก
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views/home.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'views/home.html')));

// หน้า Dashboard
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views/dashboard.html')));

// หน้า Donate
app.get('/donate', (req, res) => res.sendFile(path.join(__dirname, 'views/donate.html')));

// หน้า Invite
app.get('/invite', (req, res) => res.sendFile(path.join(__dirname, 'views/invite.html')));

// หน้า Privacy Policy
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'views/privacy.html')));

// หน้า Terms of Service
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'views/terms.html')));

// --- Handle 404 (หน้าไม่พบบ) ---
app.use((req, res) => {
    res.status(404).send("<h1>404 Not Found</h1><p>ไม่พบหน้าที่คุณต้องการ</p>");
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ✅ VisionGuard Web Server Started!
    ----------------------------------
    🏠 Home:      http://localhost:${PORT}/
    📊 Dashboard: http://localhost:${PORT}/dashboard
    💰 Donate:    http://localhost:${PORT}/donate
    🤖 Invite:    http://localhost:${PORT}/invite
    🔒 Privacy:   http://localhost:${PORT}/privacy
    📝 Terms:     http://localhost:${PORT}/terms
    ----------------------------------
    `);
});
