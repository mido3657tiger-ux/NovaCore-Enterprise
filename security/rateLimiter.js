// security/rateLimiter.js
// NovaCore Quantum Shield - Intelligent DDoS Mitigation & Rate Limiter Engine

const ipRequestMap = new Map();

class AntiDDoSLimiter {
    constructor(maxRequests = 20, windowMs = 10000) {
        this.maxRequests = maxRequests; // أقصى عدد طلبات مسموح بها (20 طلب)
        this.windowMs = windowMs;       // الفترة الزمنية (10 ثواني)
        this.blacklist = new Set();    // قائمة الـ IPs المحظورة تماماً
    }

    // دالة فحص الـ IP والتحكم في المرور
    handleRequest(ip) {
        const currentTime = Date.now();

        // 1. فحص إذا كان الـ IP محظوراً مسبقاً في القائمة السوداء
        if (this.blacklist.has(ip)) {
            return {
                allowed: false,
                status: "BLOCKED",
                message: "Your IP has been permanently blacklisted by NovaCore Anti-DDoS."
            };
        }

        // 2. إذا كان الـ IP جديد، يتم تسجيله في الذاكرة
        if (!ipRequestMap.has(ip)) {
            ipRequestMap.set(ip, [{ timestamp: currentTime }]);
            return { allowed: true, currentRequests: 1 };
        }

        // تصفية الطلبات القديمة خارج النطاق الزمني (10 ثواني)
        let requests = ipRequestMap.get(ip);
        requests = requests.filter(req => (currentTime - req.timestamp) < this.windowMs);
        
        // إضافة الطلب الحالي
        requests.push({ timestamp: currentTime });
        ipRequestMap.set(ip, requests);

        // 3. فحص تخطي الحد المسموح
        if (requests.length > this.maxRequests) {
            this.blacklist.add(ip); // حظر فوري في القائمة السوداء
            console.error(`[🚨 DDoS ALERT] Heavy traffic anomaly detected from IP: ${ip}. Instant Ban Triggered.`);
            return {
                allowed: false,
                status: "BAN_TRIGGERED",
                message: "Rate limit exceeded. Connection terminated by FireWall."
            };
        }

        return {
            allowed: true,
            currentRequests: requests.length,
            remaining: this.maxRequests - requests.length
        };
    }

    // دالة لفك حظر IP معين يدوياً
    unbanIp(ip) {
        if (this.blacklist.has(ip)) {
            this.blacklist.delete(ip);
            ipRequestMap.delete(ip);
            console.log(`[🛡️ SHIELD INFRA] IP: ${ip} has been unbanned successfully.`);
            return true;
        }
        return false;
    }
}

// تشغيل تجريبي ومحاكاة لهجوم DDoS عنيف (50 طلب في نفس اللحظة)
const limiter = new AntiDDoSLimiter(20, 10000);
const attackerIp = "192.168.1.50";

console.log("[NovaCore Shield] Initiating DDoS stress test simulator...");

for (let i = 1; i <= 25; i++) {
    const check = limiter.handleRequest(attackerIp);
    if (!check.allowed) {
        console.log(`[Blocked] Request ${i}: ${check.message}`);
        break;
    } else {
        console.log(`[Allowed] Request ${i}: Requests remaining: ${check.remaining}`);
    }
}

module.exports = AntiDDoSLimiter;
