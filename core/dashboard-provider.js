// core/dashboard-provider.js
const fs = require('fs');
const path = require('path');
const db = require('../services/dbService');

class DashboardProvider {
    constructor() {
        this.combinedLogPath = path.join(__dirname, '../logs/combined.log');
    }

    // جلب الإحصائيات الشاملة للنظام
    getLiveTelemetry() {
        const localDb = db.readData();
        let recentLogs = [];

        try {
            if (fs.existsSync(this.combinedLogPath)) {
                const lines = fs.readFileSync(this.combinedLogPath, 'utf8').trim().split('\n');
                recentLogs = lines.slice(-10).map(line => JSON.parse(line));
            }
        } catch (e) {
            recentLogs = [{ message: "No active logs generated yet." }];
        }

        return {
            status: "ONLINE",
            firewall_active: true,
            ai_engine_load: process.cpuUsage(),
            total_banned_ips: localDb.blacklisted_ips.length,
            banned_list: localDb.blacklisted_ips,
            recent_events: recentLogs
        };
    }
}

const dashboard = new DashboardProvider();
module.exports = dashboard;
