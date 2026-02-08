const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// เชื่อมต่อ Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// เสิร์ฟไฟล์หน้าเว็บ static
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/privacy-policy', (req, res) => res.sendFile(path.join(__dirname, 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'terms.html')));

// API สำหรับรับข้อมูลจาก Bot
app.post('/update-nopi-stats', async (req, res) => {
    const token = req.headers['authorization'];
    if (token !== process.env.API_SECRET_TOKEN) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const { total_scanned, total_deleted, penis_count, pussy_count } = req.body;

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

    if (error) return res.status(500).json(error);
    res.status(200).send("OK");
});

// API สำหรับหน้าเว็บดึงสถิติ
app.get('/api/stats', async (req, res) => {
    const { data, error } = await supabase.from('nopi_stats').select('*').single();
    if (error) return res.status(500).json(error);
    res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 System Running on Port ${PORT}`));
