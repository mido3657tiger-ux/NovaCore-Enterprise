// core/firewall-controller.js
const db = require('../services/dbService');
const AntiDDoSLimiter = require('../security/rateLimiter');
const QuantumValidator = require('../utils/validator');

const limiter = new AntiDDoSLimiter(30, 10000);
const validator = new QuantumValidator();

function firewallMiddleware(req, res, next) {
    const clientIp = req.ip || req.headers['x-forwarded-for'];

    // 1. فحص إذا كان الـ IP محظور في قاعدة البيانات المشفرة
    const localDb = db.readData();
    const isBanned = localDb.blacklisted_ips.some(item => item.ip === clientIp);
    if (isBanned) {
        return res.status(403).json({ error: "Access Denied. IP address blacklisted by NovaCore Firewall." });
    }

    // 2. فحص الـ DDoS وضغط الطلبات
    const rateCheck = limiter.handleRequest(clientIp);
    if (!rateCheck.allowed) {
        db.saveBannedIp(clientIp, "DDoS Attack Vector Triggered");
        return res.status(429).json({ error: "Rate limit exceeded. Connection banned." });
    }

    // 3. فحص وتطهير الـ Body والـ Query من ثغرات الحقن
    if (req.body && Object.keys(req.body).length > 0) {
        const audit = validator.auditPayload(req.body);
        if (!audit.is_safe) {
            db.saveBannedIp(clientIp, `Exploit Attempt: ${audit.threats.join(', ')}`);
            return res.status(400).json({ error: "Malicious payload detected and destroyed." });
        }
    }

    next();
}

module.exports = firewallMiddleware;
