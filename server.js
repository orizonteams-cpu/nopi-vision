const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// เชื่อมต่อ Supabase ผ่านตัวแปรสภาพแวดล้อม (Environment Variables)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- ส่วนที่ใช้เช็ค Secret Key ที่คุณถามหา ---
app.post('/update-nopi-stats', async (req, res) => {
    // ดึงรหัสผ่านมาจาก Header ที่ชื่อ Authorization
    const clientToken = req.headers['authorization'];
    
    // เปรียบเทียบรหัสที่บอทส่งมา กับรหัสที่เราตั้งไว้ในหน้าเว็บ Render (API_SECRET_TOKEN)
    if (!clientToken || clientToken !== process.env.API_SECRET_TOKEN) {
        console.error("❌ Unauthorized access attempt!");
        return res.status(403).json({ error: "Invalid Secret Key" });
    }

    const { total_scanned, total_deleted, penis_count, pussy_count } = req.body;

    // อัปเดตลง Supabase ตาราง nopi_stats ที่ ID = 1
    const { error } = await supabase
        .from('nopi_stats')
        .update({ 
            total_scanned, 
            total_deleted, 
            penis_count, 
            pussy_count, 
            last_update: new Date() 
        })
        .eq('id', 1);

    if (error) {
        console.error("Supabase Error:", error);
        return res.status(500).json(error);
    }

    res.status(200).send("✅ Data Synced Successfully");
});

// หน้าเช็คสถานะ API ง่ายๆ
app.get('/', (req, res) => res.send("API is Online!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
