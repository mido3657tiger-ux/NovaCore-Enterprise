// security/encryption.js
// NovaCore Quantum Shield - Advanced AES-256-GCM Cryptographic Engine
const crypto = require('crypto');
require('dotenv').config();

class QuantumEncryptionEngine {
    constructor() {
        // تحديد خوارزمية التشفير العسكرية
        this.algorithm = 'aes-256-gcm';
        // توليد مفتاح سري عشوائي في حال عدم وجوده في البيئة
        this.secretKey = process.env.SECRET_CRYPTO_KEY 
            ? crypto.scryptSync(process.env.SECRET_CRYPTO_KEY, 'salt', 32) 
            : crypto.randomBytes(32);
    }

    // 1. دالة التشفير الشاملة
    encrypt(plainText) {
        try {
            // توليد ناقل حركة عشوائي (IV) بطول 12 بايت لضمان عدم تكرار النتيجة
            const iv = crypto.randomBytes(12);
            const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
            
            let encrypted = cipher.update(plainText, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            // توليد تاغ المصادقة لمنع التلاعب بالبيانات المحمية
            const authTag = cipher.getAuthTag().toString('hex');

            return {
                success: true,
                iv: iv.toString('hex'),
                encryptedData: encrypted,
                authTag: authTag,
                bundle: `${iv.toString('hex')}:${authTag}:${encrypted}` // الحزمة الكاملة للنقل
            };
        } catch (error) {
            console.error(`[❌ CRYPTO ERROR] Encryption failed:`, error.message);
            return { success: false, error: "Encryption error occurred." };
        }
    }

    // 2. دالة فك التشفير والتحقق من السلامة (Integrity Check)
    decrypt(encryptedBundle) {
        try {
            // تفكيك الحزمة المشفرة
            const [ivHex, authTagHex, encryptedData] = encryptedBundle.split(':');
            
            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(authTagHex, 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
            
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return { success: true, decryptedData: decrypted };
        } catch (error) {
            console.error(`[🚨 CRYPTO ALERT] Decryption failed or Data Tampering detected!`, error.message);
            return { success: false, error: "Decryption failed. Bad key or corrupted data." };
        }
    }
}

// تشغيل تجريبي وفحص قوة التشفير
const cryptoEngine = new QuantumEncryptionEngine();

const sensitiveData = "CONFIDENTIAL_DB_PASSWORD_TIGER_XP_2026";
const encryptedResult = cryptoEngine.encrypt(sensitiveData);

console.log("[NovaCore Crypto] Encrypting Target Payload...");
console.log(JSON.stringify(encryptedResult, null, 2));

console.log("\n[NovaCore Crypto] Testing Safe Decryption...");
const decryptedResult = cryptoEngine.decrypt(encryptedResult.bundle);
console.log(JSON.stringify(decryptedResult, null, 2));

module.exports = QuantumEncryptionEngine;
