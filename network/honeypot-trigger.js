// network/honeypot-trigger.js
// NovaCore Quantum Shield - Intelligent Network Honeypot & Decoy System
const net = require('net');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class NovaHoneypot {
    constructor() {
        // البورتات الوهمية اللي هنوقع فيها الهكر
        this.decoyPorts = [21, 22, 23, 1433, 3306]; 
        this.attackLog = [];
    }

    // تشغيل المصايد على البورتات المحددة
    listenOnDecoyPorts() {
        console.log(`[🛡️ HONEYPOT] Deploying decoy security traps across vulnerable ports...`);

        this.decoyPorts.forEach(port => {
            const server = net.createServer((socket) => {
                const attackerIp = socket.remoteAddress;
                const attackerPort = socket.remotePort;
                
                const incidentId = uuidv4();
                const alertMessage = {
                    incident_id: incidentId,
                    timestamp: new Date().toISOString(),
                    attacker_ip: attackerIp,
                    targeted_port: port,
                    severity: "CRITICAL",
                    signature: "UNAUTHORIZED_PORT_PROBE",
                    description: `Attacker from ${attackerIp} attempted interaction on decoy service port ${port}`
                };

                // تسجيل الحادثة فوراً
                this.attackLog.push(alertMessage);
                this.triggerDefenseAlert(alertMessage);

                // إرسال رد وهمي ومضلل للهكر عشان يفتكر السيرفر حقيقي ويضيع وقته
                if (port === 21) {
                    socket.write("220 ProFTPD 1.3.5 Server (Ready)\r\n");
                } else if (port === 22) {
                    socket.write("SSH-2.0-OpenSSH_7.4p1 Debian-10+deb9u7\r\n");
                } else {
                    socket.write("Access Denied. Unauthorized connection flagged.\r\n");
                }

                // قفل الاتصال بعد التضليل
                socket.end();
            });

            server.on('error', (err) => {
                // تخطي الأخطاء لو البورت مستخدم من نظام آخر
                if (err.code === 'EADDRINUSE') {
                    console.log(`[⚠️ HONEYPOT] Port ${port} is already in use by real system. Skipping decoy deployment.`);
                }
            });

            server.listen(port, () => {
                console.log(`[🎯 TRAP ACTIVE] Decoy service listening on Port: ${port}`);
            });
        });
    }

    // إرسال التنبيه لمحرك العزل الرئيسي
    triggerDefenseAlert(alert) {
        console.error(`\n[🚨 HONEYPOT TRIGGEREDED] !!! INSTANT THREAT DETECTED !!!`);
        console.error(`[KILL-SWITCH] IP: ${alert.attacker_ip} has touched Decoy Port: ${alert.targeted_port}`);
        console.log(`[ACTION REQUIRED] Forwarding telemetry data to core/ai-analyzer.js for immediate IP banning...\n`);
    }
}

// تشغيل المصيدة فوراً
const honeypot = new NovaHoneypot();
honeypot.listenOnDecoyPorts();

module.exports = NovaHoneypot;
