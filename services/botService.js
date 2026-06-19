// services/botService.js
// NovaCore Quantum Shield - Telegram Automation & Telemetry Engine
const axios = require('axios');
require('dotenv').config();

class NovaSecurityBot {
    constructor() {
        // سحب التوكن والـ Chat ID من ملف الـ .env
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || "7712345678:TEST_TOKEN_NOVACORE";
        this.adminChatId = process.env.TELEGRAM_ADMIN_ID || "123456789";
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    // 1. دالة إرسال التنبيهات الأمنية العاجلة للتليجرام
    async sendSecurityAlert(alertData) {
        console.log(`[🤖 BOT_SERVICE] Formulating urgent telegram security payload...`);
        
        // تنسيق رسالة فخمة تليق بهكر محترف
        const messageText = 
`🚨 <b>NOVACORE QUANTUM SHIELD ALERT</b> 🚨
-----------------------------------------
<b>[+] Incident ID:</b> <code>${alertData.id || 'N/A'}</code>
<b>[+] Severity:</b> 🔴 CRITICAL THREAT
<b>[+] Engine Module:</b> <code>${alertData.module || 'AI-Behavioral'}</code>
<b>[+] Target IP:</b> <code>${alertData.attacker_ip || 'Unknown'}</code>
<b>[+] Threat Details:</b> ${alertData.description}
-----------------------------------------
<b>[⏱️ Timestamp]:</b> <code>${new Date().toISOString()}</code>
<b>[🛡️ Status]:</b> System in High-Alert LockDown mode.`;

        try {
            const response = await axios.post(`${this.baseUrl}/sendMessage`, {
                chat_id: this.adminChatId,
                text: messageText,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "⚡ Block & Ban IP", callback_data: `ban_${alertData.attacker_ip}` },
                            { text: "🔍 Deep Scan Node", callback_data: `scan_${alertData.attacker_ip}` }
                        ],
                        [
                            { text: "🟢 Ignore & Whitelist", callback_data: `whitelist_${alertData.attacker_ip}` }
                        ]
                    ]
                }
            });
            if (response.data.ok) {
                console.log(`[✅ BOT_SERVICE] Security Alert successfully broadcasted to Admin.`);
                return { success: true };
            }
        } catch (error) {
            console.error(`[❌ BOT_ERROR] Failed to send automation message:`, error.message);
            return { success: false, error: error.message };
        }
    }

    // 2. دالة استقبال الردود من الإدمن وتوجيه الأوامر للسيرفر (Webhook Manager)
    async processAdminCommand(callbackData) {
        console.log(`[🤖 BOT_SERVICE] Processing remote command from Telegram Admin...`);
        const [action, targetIp] = callbackData.split('_');

        switch (action) {
            case 'ban':
                return { action_executed: "BAN", target: targetIp, log: `IP ${targetIp} isolated at system firewall level.` };
            case 'scan':
                return { action_executed: "SCAN", target: targetIp, log: `Deep vulnerability hunter triggered against ${targetIp}` };
            default:
                return { action_executed: "NONE", target: targetIp, log: "Command parsed with no execution vectors." };
        }
    }
}

// تشغيل تجريبي ومحاكاة لإرسال تقرير اختراق حقيقي للتليجرام
const securityBot = new NovaSecurityBot();

const simulatedAttackPayload = {
    id: "INC-99021-X",
    module: "Ransomware-Immunizer",
    attacker_ip: "185.220.101.9",
    description: "Suspicious bulk mass-file renaming and shadow copy deletion command intercepted."
};

console.log("[NovaCore Bot Core] Booting telemetry listener...");
securityBot.sendSecurityAlert(simulatedAttackPayload);

module.exports = NovaSecurityBot;
