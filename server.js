const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// เชื่อมต่อ Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- API: รับข้อมูลจากบอท (สถิติ + Hardware) ---
app.post('/api/update-stats', async (req, res) => {
    const secret = req.headers['authorization'];
    
    // ตรวจสอบ Secret Key
    if (!secret || secret !== process.env.API_SECRET_TOKEN) {
        return res.status(403).json({ error: "Unauthorized: Invalid Secret Key" });
    }

    const d = req.body;

    // อัปเดตข้อมูลลง Supabase (ID: 1 เสมอ)
    const { error } = await supabase
        .from('nopi_stats')
        .update({ 
            total_scanned: d.total_scanned, 
            total_deleted: d.total_deleted, 
            penis_count: d.penis_count, 
            pussy_count: d.pussy_count,
            server_count: d.servers,
            user_count: d.users,
            // ข้อมูลเครื่องบอท
            bot_os: d.sys_os,
            bot_cpu_model: d.sys_cpu,
            bot_cpu_temp: d.sys_temp,
            bot_mem_used: d.sys_mem_used,
            bot_mem_total: d.sys_mem_total,
            bot_mem_percent: d.sys_mem_percent,
            bot_uptime: d.sys_uptime,
            last_update: new Date() 
        })
        .eq('id', 1);

    if (error) return res.status(500).json(error);
    res.status(200).send("✅ Data Synced Successfully");
});

// --- API: ดึงข้อมูลไปแสดงผลบน Dashboard/Home ---
app.get('/api/get-stats', async (req, res) => {
    const { data, error } = await supabase.from('nopi_stats').select('*').single();
    if (error) return res.status(500).json(error);
    res.json(data);
});

// --- Page Routing ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views/home.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views/dashboard.html')));
app.get('/invite', (req, res) => res.sendFile(path.join(__dirname, 'views/invite.html')));
app.get('/donate', (req, res) => res.sendFile(path.join(__dirname, 'views/donate.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'views/privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'views/terms.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Nopi Vision Online on port ${PORT}`));
