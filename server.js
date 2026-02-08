const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const si = require('systeminformation');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- API รับสถิติจากบอท (Security Check) ---
app.post('/api/update-stats', async (req, res) => {
    const secret = req.headers['authorization'];
    if (!secret || secret !== process.env.API_SECRET_TOKEN) return res.status(403).json({ error: "Forbidden" });

    const { total_scanned, total_deleted, penis_count, pussy_count, servers, users } = req.body;
    const { error } = await supabase.from('nopi_stats').update({ 
        total_scanned, total_deleted, penis_count, pussy_count, server_count: servers, user_count: users, last_update: new Date() 
    }).eq('id', 1);

    if (error) return res.status(500).json(error);
    res.send("Updated");
});

// --- API ดึงข้อมูลระบบจริง ---
app.get('/api/sys-info', async (req, res) => {
    const [cpu, mem, os, temp, time] = await Promise.all([si.cpu(), si.mem(), si.osInfo(), si.cpuTemperature(), si.time()]);
    res.json({
        os: `${os.distro} ${os.release}`,
        uptime: (time.uptime / 3600).toFixed(1),
        cpuModel: cpu.brand,
        cpuTemp: temp.main || "N/A",
        memUsed: (mem.active / 1024**3).toFixed(2),
        memTotal: (mem.total / 1024**3).toFixed(2),
        memPercent: ((mem.active / mem.total) * 100).toFixed(1)
    });
});

app.get('/api/get-stats', async (req, res) => {
    const { data } = await supabase.from('nopi_stats').select('*').single();
    res.json(data);
});

// --- Page Routing ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views/home.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views/dashboard.html')));
app.get('/invite', (req, res) => res.sendFile(path.join(__dirname, 'views/invite.html')));
app.get('/donate', (req, res) => res.sendFile(path.join(__dirname, 'views/donate.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'views/privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'views/terms.html')));

app.listen(process.env.PORT || 3000);
