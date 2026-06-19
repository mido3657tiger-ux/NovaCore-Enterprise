// services/dbService.js
const fs = require('fs');
const path = require('path');

class LocalSecurityDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, '../core/security_vault.json');
        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, JSON.stringify({ blacklisted_ips: [], audit_reports: [] }, null, 2));
        }
    }

    readData() {
        const content = fs.readFileSync(this.dbPath, 'utf8');
        return JSON.parse(content);
    }

    writeData(data) {
        fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    }

    saveBannedIp(ipAddress, reason) {
        const db = this.readData();
        if (!db.blacklisted_ips.some(item => item.ip === ipAddress)) {
            db.blacklisted_ips.push({ ip: ipAddress, reason: reason, banned_at: new Date().toISOString() });
            this.writeData(db);
            console.log(`[💾 DB] IP ${ipAddress} successfully committed to blacklisted vault.`);
        }
    }

    saveAuditReport(report) {
        const db = this.readData();
        db.audit_reports.push(report);
        this.writeData(db);
        console.log(`[💾 DB] Audit Report ${report.audit_id} successfully cataloged.`);
    }
}

const dbInstance = new LocalSecurityDatabase();
module.exports = dbInstance;
