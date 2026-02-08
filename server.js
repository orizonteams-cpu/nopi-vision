const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.post('/api/update-stats', async (req, res) => {
    try {
        const secret = req.headers['authorization'];
        
        // 1. ตรวจสอบ Token
        if (!secret || secret !== process.env.API_SECRET_TOKEN) {
            console.warn(`[${new Date().toLocaleTimeString()}] ⚠️ Unauthorized Access Attempt`);
            return res.status(403).json({ error: "Invalid Token" });
        }

        const d = req.body;

        // 2. จัดรูปแบบข้อมูลก่อนลง Database (Mapping)
        const updateData = { 
            total_scanned: Number(d.total_scanned) || 0, 
            total_deleted: Number(d.total_deleted) || 0, 
            penis_count: Number(d.penis_count) || 0, 
            pussy_count: Number(d.pussy_count) || 0,
            server_count: Number(d.servers) || 0,
            user_count: Number(d.users) || 0,
            bot_os: String(d.sys_os || 'Unknown'),
            bot_cpu_model: String(d.sys_cpu || '0%'), 
            bot_mem_used: parseFloat(d.sys_mem_used) || 0,
            bot_mem_total: parseFloat(d.sys_mem_total) || 0,
            bot_mem_percent: parseFloat(d.sys_mem_percent) || 0,
            bot_uptime: String(d.sys_uptime || '0'),
            status: String(d.status || 'online'),
            last_update: new Date() 
        };

        // 3. ยิง Update ไปที่ Supabase
        const { error } = await supabase
            .from('nopi_stats')
            .update(updateData)
            .eq('id', 1);

        if (error) throw error;

        console.log(`[${new Date().toLocaleTimeString()}] ✅ Sync Success | Stats: ${d.status}`);
        res.status(200).json({ message: "Data Synced" });

    } catch (err) {
        console.error("❌ API Error:", err.message);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server Running on port ${PORT}`));
