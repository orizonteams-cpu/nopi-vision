const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// เชื่อ mต่อ Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- API: รับข้อมูลจากบอท (สถิติ + Hardware) ---
app.post('/api/update-stats', async (req, res) => {
    const secret = req.headers['authorization'];
    
    // ตรวจสอบ Secret Key
    if (!secret || secret !== process.env.API_SECRET_TOKEN) {
        return res.status(403).json({ error: "Unauthorized: Invalid Secret Key" });
    }

    const d = req.body;

    // เตรียมข้อมูลสำหรับ Update (ชื่อฟีลด์ต้องตรงกับใน Python และ Column ใน Supabase)
    const updateData = { 
        total_scanned: d.total_scanned, 
        total_deleted: d.total_deleted, 
        penis_count: d.penis_count, 
        pussy_count: d.pussy_count,
        server_count: d.servers,
        user_count: d.users,
        bot_os: d.sys_os,
        bot_cpu_model: d.sys_cpu,      // เก็บเป็น Text เช่น "15.5%"
        bot_mem_used: d.sys_mem_used,
        bot_mem_total: d.sys_mem_total,
        bot_mem_percent: d.sys_mem_percent,
        bot_uptime: d.sys_uptime,     // เก็บเป็น Text เช่น "0 วัน 1 ชม..."
        status: d.status || "online", // เพิ่มฟีลด์สถานะ
        last_update: new Date() 
    };

    // อัปเดตข้อมูลลง Supabase (ID: 1)
    const { error } = await supabase
        .from('nopi_stats')
        .update(updateData)
        .eq('id', 1);

    if (error) {
        console.error("❌ Supabase Error:", error.message);
        return res.status(500).json({ error: error.message });
    }

    console.log(`[${new Date().toLocaleTimeString()}] ✅ Stats Updated: ${d.status}`);
    res.status(200).send("✅ Data Synced Successfully");
});

// --- API: ดึงข้อมูลไปแสดงผล ---
app.get('/api/get-stats', async (req, res) => {
    const { data, error } = await supabase.from('nopi_stats').select('*').single();
    if (error) return res.status(500).json(error);
    res.json(data);
});

// --- Page Routing ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views/home.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views/dashboard.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
