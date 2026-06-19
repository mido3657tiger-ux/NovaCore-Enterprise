// =================================================================================
// 🚀 NOVACORE QUANTUM SHIELD - CORE INITIATION VECTOR
// =================================================================================
const path = require('path');
const fs = require('fs');

// التأكد من وجود مجلد اللوجات قبل إقلاع النظام
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

console.log("=====================================================================");
console.log("🤖 INITIATING NOVACORE QUANTUM SHIELD INFRASTRUCTURE...");
console.log("🔒 LOADING IMPERATIVE DEFENSIVE AND OFFENSIVE CYBER MODULES...");
console.log("=====================================================================");

// استدعاء وتشغيل السيرفر الرئيسي
require('./core/server.js');
