// services/authService.js
// NovaCore Quantum Shield - Secure JWT Authentication & Session Hardening Engine
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class QuantumAuthService {
    constructor() {
        // مفتاح التشفير الرئيسي وجلسة الصلاحية
        this.jwtSecret = process.env.JWT_SECRET_KEY || "TIGER_X_QUANTUM_SUPER_SECRET_2026";
        this.tokenExpiry = '1h'; // صلاحية التوكن ساعة واحدة لحماية الجلسة
    }

    // 1. تشفير باصوردات المشرفين قبل حفظها
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(12); // قوة تشفير عالية جداً لقمع التخمين
        return await bcrypt.hash(password, salt);
    }

    // 2. التحقق من صحة الباصورد عند تسجيل الدخول
    async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // 3. توليد توكن مشفر ومؤمن بالكامل لدخول لوحة التحكم
    generateShieldToken(adminData) {
        console.log(`[🔒 AUTH] Generating signed cryptographically secure token for: ${adminData.username}`);
        
        const payload = {
            sessionId: uuidv4(),
            username: adminData.username,
            role: adminData.role || 'SecurityAdmin',
            permissions: ['RUN_SCAN', 'BAN_IP', 'VIEW_HONEYPOT']
        };

        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.tokenExpiry });
    }

    // 4. Middleware للتحقق من التوكن وحماية المسارات الحساسة للـ API
    verifyShieldToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // جلب التوكن من الهيدر

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: "Access Denied. Security token missing in header." 
            });
        }

        try {
            const verifiedData = jwt.verify(token, this.jwtSecret);
            req.adminUser = verifiedData; // تمرير بيانات المشرف لباقي مسارات النظام
            next();
        } catch (error) {
            console.error(`[🚨 AUTH ALERT] Malformed or Expired Token signature detected!`);
            return res.status(403).json({ 
                success: false, 
                error: "Authentication failed. Token signature is corrupted or expired." 
            });
        }
    }
}

// تشغيل تجريبي لمحاكاة تسجيل دخول مشرف وتوليد التوكن
async function runTest() {
    const auth = new QuantumAuthService();
    
    console.log("[NovaCore Auth] Creating secure admin baseline...");
    const plainPass = "NovaCore_TigerX_Secure2026";
    const hashedPass = await auth.hashPassword(plainPass);
    console.log(`Hashed Password Result: ${hashedPass}`);

    // محاكاة دخول ناجح
    const isMatched = await auth.verifyPassword(plainPass, hashedPass);
    if(isMatched) {
        const mockAdmin = { username: "Tiger-X-Admin", role: "RootOperator" };
        const secureToken = auth.generateShieldToken(mockAdmin);
        console.log(`\nGenerated Secured Bearer Token:\nBearer ${secureToken}`);
    }
}

runTest();

module.exports = QuantumAuthService;
