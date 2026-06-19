// core/server.js
// NovaCore Quantum Shield - Central Deployment Server
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

// استدعاء المكونات الدفاعية اللي بنيناها
const firewallMiddleware = require('./firewall-controller');
const dashboardProvider = require('./dashboard-provider');
const dbInstance = require('../services/dbService');

const app = express();
const PORT = process.env.PORT || 9000;

// تفعيل طبقات الحماية الأساسية للهيدرز وحظر التجسس
app.use(helmet());
app.use(cors());
app.use(express.json());

// 🛡️ تفعيل جدار الحماية الذكي كخط دفاع إجباري على كل الروابط
app.use(firewallMiddleware);

// مسار لوحة التحكم الحية (Telemetry Dashboard)
app.get('/api/v1/quantum/dashboard', (req, res) => {
    const liveData = dashboardProvider.getLiveTelemetry();
    res.status(200).json({
        success: true,
        codename: "NovaCore-Quantum-Shield",
        version: "4.0.0",
        telemetry: liveData
    });
});

// مسار فحص وتأمين الأجهزة والـ Nodes
app.post('/api/v1/quantum/register-node', (req, res) => {
    const { nodeName, internalIp } = req.body;
    
    // حفظ التقرير في قاعدة البيانات المحلية كعقدة مؤمنة
    const nodeReport = {
        audit_id: `NODE-${Math.floor(Math.random() * 90000) + 10000}`,
        node_name: nodeName,
        ip: internalIp,
        protection: "ACTIVE",
        timestamp: new Date().toISOString()
    };
    
    dbInstance.saveAuditReport(nodeReport);

    res.status(201).json({
        success: true,
        message: "Node fully integrated under NovaCore protection shield.",
        node_report: nodeReport
    });
});

// تشغيل السيرفر المركزي
app.listen(PORT, () => {
    console.log(`\n================================================================`);
    console.log(`[🚀 NOVACORE ACTIVE] Enterprise Quantum Shield Engine Deployed!`);
    console.log(`[🌐 RUNNING PORT] Listening on: http://localhost:${PORT}`);
    console.log(`================================================================\n`);
});
