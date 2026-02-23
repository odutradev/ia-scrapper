"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHealth = void 0;
const getSystemHealth = () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
});
exports.getSystemHealth = getSystemHealth;
