// utils/logger.js
// NovaCore Quantum Shield - Advanced System Audit Logger & Forensics Engine
const fs = require('fs');
const path = require('path');

class QuantumLogger {
    constructor() {
        this.logDirectory = path.join(__dirname, '../logs');
        // إنشاء مجلد الحفظ لو مش موجود تلقائيًا
        if (!fs.existsSync(this.logDirectory)) {
            fs.mkdirSync(this.logDirectory);
        }
        this.errorLogPath = path.join(this.logDirectory, 'errors.log');
        this.combinedLogPath = path.join(this.logDirectory, 'combined.log');
    }

    // دالة داخلية لصناعة التنسيق الاحترافي للوج
    formatMessage(level, message, meta = {}) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message: message,
            meta: Object.keys(meta).length ? meta : undefined
        }) + '\n';
    }

    // 1. تسجيل العمليات العادية (تنبيهات خفيفة ومعلومات)
    info(message, meta = {}) {
        const formatted = this.formatMessage('INFO', message, meta);
        console.log(`[NovaCore-INFO] ${message}`);
        fs.appendFileSync(this.combinedLogPath, formatted, 'utf8');
    }

    // 2. تسجيل التهديدات والثغرات الأمنية الخطيرة
    warn(message, meta = {}) {
        const formatted = this.formatMessage('WARN', message, meta);
        console.warn(`[🚨 NovaCore-WARN] ${message}`);
        fs.appendFileSync(this.combinedLogPath, formatted, 'utf8');
        fs.appendFileSync(this.errorLogPath, formatted, 'utf8');
    }

    // 3. تسجيل كراشات السيرفر والأخطاء البرمجية القاتلة
    error(message, errorObject = {}) {
        const formatted = this.formatMessage('ERROR', message, {
            error_name: errorObject.name,
            error_message: errorObject.message,
            stack: errorObject.stack
        });
        console.error(`[💀 NovaCore-CRITICAL] ${message}`);
        fs.appendFileSync(this.combinedLogPath, formatted, 'utf8');
        fs.appendFileSync(this.errorLogPath, formatted, 'utf8');
    }

    // دالة قراءة آخر الأحداث لعرضها في الداشبورد
    readRecentLogs(type = 'combined', linesCount = 10) {
        try {
            const targetFile = type === 'errors' ? this.errorLogPath : this.combinedLogPath;
            if (!fs.existsSync(targetFile)) return [];
            
            const fileContent = fs.readFileSync(targetFile, 'utf8').trim().split('\n');
            return fileContent.slice(-linesCount).map(line => JSON.parse(line));
        } catch (err) {
            return { error: "Failed to read security logs." };
        }
    }
}

// تشغيل تجريبي ومحاكاة لتسجيل أحداث حقيقية
const logger = new QuantumLogger();

logger.info("NovaCore Logger Subsystem successfully initialized.");
logger.warn("Port Scan detected from foreign IP address", { ip: "185.220.101.5", scanned_ports: [80, 443, 8080] });

try {
    throw new Error("Database connection timeout during deep inspection.");
} catch (e) {
    logger.error("Core Service Failure", e);
}

module.exports = logger;
