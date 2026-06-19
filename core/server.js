// =================================================================================
// 🛡️ NOVACORE QUANTUM SHIELD - ENTERPRISE MULTI-THREADED SYSTEM CORE (v4.0.0)
// =================================================================================
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const net = require('net');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// تشغيل الواجهة الرسومية تلقائياً من مجلد الـ core
app.use(express.static(__dirname));

const PORT = process.env.PORT || 9000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID;

// =================================================================================
// [1] 💾 INTERNAL SEALED CRYPTO VAULT DATABASE & TELEGRAM ALERTS
// =================================================================================
class LocalSecurityDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'security_vault.json');
        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, JSON.stringify({ blacklisted_ips: [], audit_reports: [] }, null, 2));
        }
    }
    readData() { return JSON.parse(fs.readFileSync(this.dbPath, 'utf8')); }
    writeData(data) { fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2)); }
    
    async sendTelegramAlert(message) {
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_ID) return;
        try {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            await axios.post(url, {
                chat_id: TELEGRAM_ADMIN_ID,
                text: `🚨 [NOVACORE ALERT]\n========================\n${message}`,
                parse_mode: 'Markdown'
            });
        } catch (e) {
            console.error(`[❌ TELEGRAM] Failed to forward telemetry alert.`);
        }
    }

    saveBannedIp(ip, reason) {
        const db = this.readData();
        if (!db.blacklisted_ips.some(item => item.ip === ip)) {
            db.blacklisted_ips.push({ id: uuidv4(), ip, reason, banned_at: new Date().toISOString() });
            this.writeData(db);
            console.log(`\n[💾 VAULT UPDATE] HARD BLOCK ISOLATION ENFORCED: ${ip}`);
            
            // إرسال تنبيه فوري للتليجرام الخاص بك
            this.sendTelegramAlert(`*INTRUSION INTERCEPTED*\n\nTarget IP: \`${ip}\`\nReason: \`${reason}\`\nStatus: *PERMANENTLY BANNED*`);
        }
    }
}
const db = new LocalSecurityDatabase();

// =================================================================================
// [2] 🧠 AI BEHAVIORAL THREAT HUNTING ENGINE (ANTI-RANSOMWARE)
// =================================================================================
class AIBehavioralAnalyzer {
    constructor() {
        this.threatThreshold = 0.70;
        this.patterns = {
            RANSOMWARE: ['vssadmin', 'delete', 'shadowcopies', '.locked', '.crypto'],
            REVERSE_SHELL: ['/bin/sh', '/bin/bash', 'nc', 'python -c', 'socat'],
            CREDENTIALS: ['mimikatz', 'sam', 'lsass', 'etc/passwd']
        };
    }
    analyzeBehavior(processName, commands, fileChangeRate) {
        let score = 0.0;
        const cmdStr = commands.join(' ').toLowerCase();
        if (fileChangeRate > 100) score += 0.40;
        this.patterns.RANSOMWARE.forEach(k => { if (cmdStr.includes(k)) score += 0.30; });
        this.patterns.REVERSE_SHELL.forEach(k => { if (cmdStr.includes(k)) score += 0.35; });
        this.patterns.CREDENTIALS.forEach(k => { if (cmdStr.includes(k)) score += 0.40; });
        
        return { process: processName, risk: Math.min(score, 1.0), urgentAction: score >= this.threatThreshold };
    }
}
const aiEngine = new AIBehavioralAnalyzer();

// =================================================================================
// [3] 🔎 ADVANCED VULNERABILITY HUNTER & EXPLOIT INJECTOR (OFFENSIVE SCANNER)
// =================================================================================
class VulnerabilityHunter {
    constructor() {
        this.payloads = {
            sqli: ["'", "' OR '1'='1", "' UNION SELECT NULL, NULL--", '" OR 1=1--'],
            xss: ["<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "javascript:alert(1)"]
        };
    }
    async scanTarget(targetUrl) {
        let reports = [];
        console.log(`[🔎 HUNTER] RUNNING INJECTION VECTORS AGAINST: ${targetUrl}`);
        for (let payload of this.payloads.sqli) {
            try {
                const res = await axios.get(`${targetUrl}?id=${encodeURIComponent(payload)}`, { timeout: 2000 });
                if (res.data.toString().toLowerCase().includes("sql syntax") || res.data.toString().toLowerCase().includes("mysql")) {
                    reports.push({ type: "SQL Injection", severity: "CRITICAL", payload });
                }
            } catch (e) { /* BYPASS TIMEOUTS */ }
        }
        return reports;
    }
}
const hunter = new VulnerabilityHunter();

// =================================================================================
// [4] 🎯 INTELLIGENT DECOY HONEYPOT SYSTEM
// =================================================================================
class NovaHoneypot {
    constructor() { this.ports = [21, 22, 23, 3306]; }
    deployTraps() {
        this.ports.forEach(port => {
            const server = net.createServer((socket) => {
                const attackerIp = socket.remoteAddress || "127.0.0.1";
                console.error(`\n[🚨 HONEYPOT TRIGGERED] UNAUTHORIZED ATTEMPT ON PORT ${port} FROM ${attackerIp}`);
                db.saveBannedIp(attackerIp, `Honeypot Decoy Intrusion on Port ${port}`);
                socket.write("SSH-2.0-OpenSSH_7.4p1 Debian\r\n");
                socket.end();
            });
            // تلافي مشاكل الصلاحيات في بعض بيئات التيرمكس
            server.on('error', (e) => { /* Silently forward protected ports */ });
            server.listen(port, () => console.log(`[🎯 HONEYPOT ACTIVE] TRAP ALIVE ON PORT: ${port}`));
        });
    }
}
const honeypot = new NovaHoneypot();
honeypot.deployTraps();

// =================================================================================
// [5] ⚡ QUANTUM ANTI-DDOS RATE LIMITER & FIREWALL MIDDLEWARE
// =================================================================================
const ipRequestMap = new Map();
const recentActivities = []; // لتغذية الـ Dashboard باللوجات الحية

function firewallMiddleware(req, res, next) {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || "127.0.0.1";
    const currentTime = Date.now();

    // إضافة اللوج للوحة التحكم
    if (recentActivities.length > 20) recentActivities.shift();
    recentActivities.push({ id: uuidv4(), ip: clientIp, path: req.path, method: req.method, time: new Date().toISOString() });

    // فحص القائمة السوداء
    const currentDb = db.readData();
    if (currentDb.blacklisted_ips.some(item => item.ip === clientIp)) {
        return res.status(403).json({ error: "ACCESS DENIED. HARD REJECTION RULE ENFORCED BY NOVACORE." });
    }

    // الـ Rate Limiting (منع DDoS)
    if (!ipRequestMap.has(clientIp)) ipRequestMap.set(clientIp, []);
    let requests = ipRequestMap.get(clientIp).filter(time => (currentTime - time) < 10000);
    requests.push(currentTime);
    ipRequestMap.set(clientIp, requests);

    if (requests.length > 30) {
        db.saveBannedIp(clientIp, "DDoS Aggressive Traffic Abuses");
        return res.status(429).json({ error: "DDOS VECTOR ISOLATED. IP BANNED." });
    }

    // فحص الـ XSS وحقن الثغرات في المدخلات
    const regexXss = /(<script.*?>.*?<\/script>|javascript:|onerror=|onload=)/gi;
    if (req.body && JSON.stringify(req.body).match(regexXss)) {
        db.saveBannedIp(clientIp, "Malicious XSS Script Injection");
        return res.status(400).json({ error: "MALICIOUS ENVELOPE DROPPED BY FIREWALL." });
    }

    next();
}
app.use(firewallMiddleware);

// =================================================================================
// [6] 🌐 CENTRAL COMMAND ENDPOINTS & DASHBOARD ROUTING
// =================================================================================

// مسار تشغيل لوحة التحكم الرسومية الفخمة
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// الـ API الحقيقي لتحديث البيانات في اللوحة الرسومية
app.get('/api/v1/quantum/dashboard', (req, res) => {
    const data = db.readData();
    res.status(200).json({
        engine_status: "OPERATIONAL",
        codename: "NovaCore-Quantum-Shield",
        version: "4.0.0",
        total_isolated_hosts: data.blacklisted_ips.length,
        recent_activities: recentActivities,
        blacklisted_ips: data.blacklisted_ips
    });
});

app.post('/api/v1/quantum/trigger-scan', async (req, res) => {
    const { target } = req.body;
    if(!target) return res.status(400).json({ error: "Missing Target parameter" });
    const results = await hunter.scanTarget(target);
    res.status(200).json({ success: true, target, vulnerabilities_found: results });
});

// بدء التشغيل الفعلي للمنظومة
app.listen(PORT, () => {
    console.log(`\n================================================================`);
    console.log(`[🚀 NOVACORE RUNTIME MODULE] ENTERPRISE QUANTUM CORE IS ACTIVE!`);
    console.log(`[🌐 COMMAND CENTER] OPEN: http://localhost:${PORT}/dashboard`);
    console.log(`================================================================\n`);
});
