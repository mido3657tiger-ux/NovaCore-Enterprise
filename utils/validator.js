// utils/validator.js
// NovaCore Quantum Shield - Advanced Input Sanitization & Payload Validator

class QuantumValidator {
    constructor() {
        // أنماط الحماية المتقدمة لفحص المدخلات الخبيثة
        this.regexPatterns = {
            sqlInjection: /(union|select|insert|update|delete|drop|alter|--|\/\*|\*\/|xp_cmdshell|or\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/gi,
            xssAttack: /(<script.*?>.*?<\/script>|javascript:|onerror=|onload=|alert\(|confirm\(|<img.*?>)/gi,
            commandInjection: /([;&|`]|\|\s*\||&\s*&|system\(|exec\(|spawn\()/gi,
            ipv4Address: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        };
    }

    // 1. فحص وتطهير النصوص من أي محاولة حقن (Sanitize Text)
    sanitizeInput(inputString) {
        if (typeof inputString !== 'string') return inputString;

        let cleanString = inputString;
        // حذف ثغرات الـ XSS وحقن الأوامر
        cleanString = cleanString.replace(this.regexPatterns.xssAttack, '[XSS_BLOCKED]');
        cleanString = cleanString.replace(this.regexPatterns.commandInjection, '[CMD_BLOCKED]');
        
        // تنظيف الحروف الحساسة وتحويلها لمنع التنفيذ في المتصفح
        cleanString = cleanString
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;");

        return cleanString;
    }

    // 2. فحص أمان البارامترات والتأكد أنها خالية تماماً من الـ SQL Injection
    isSafeFromSQLi(inputString) {
        if (typeof inputString !== 'string') return true;
        // لو النص طابق نمط الـ SQLi يرجع false يعني مش آمن
        return !this.regexPatterns.sqlInjection.test(inputString);
    }

    // 3. التحقق من صحة عنوان الـ IP المستهدف لفحصه
    validateIP(ipAddress) {
        return this.regexPatterns.ipv4Address.test(ipAddress);
    }

    // 4. دالة فحص الطلب بالكامل (Object Payload Audit)
    auditPayload(payloadObj) {
        let isSecured = true;
        let detectedThreats = [];

        for (let key in payloadObj) {
            if (payloadObj.hasOwnProperty(key) && typeof payloadObj[key] === 'string') {
                if (!this.isSafeFromSQLi(payloadObj[key])) {
                    isSecured = false;
                    detectedThreats.push(`SQLi pattern found in key: ${key}`);
                }
                if (this.regexPatterns.xssAttack.test(payloadObj[key])) {
                    isSecured = false;
                    detectedThreats.push(`XSS pattern found in key: ${key}`);
                }
            }
        }

        return {
            is_safe: isSecured,
            threats: detectedThreats,
            timestamp: new Date().toISOString()
        };
    }
}

// تشغيل تجريبي ومحاكاة لفحص مدخلات خبيثة من هكر
const validator = new QuantumValidator();

const dangerousComment = "<script>alert('Hacked by Tiger-X')</script> SELECT * FROM users WHERE '1'='1'";
console.log("[NovaCore Validator] Sanitizing dangerous string...");
console.log(`Clean Result: ${validator.sanitizeInput(dangerousComment)}`);

const badPayload = {
    username: "admin' --",
    comment: "Normal comment here"
};
console.log("\n[NovaCore Validator] Auditing full request payload...");
console.log(JSON.stringify(validator.auditPayload(badPayload), null, 2));

module.exports = QuantumValidator;
