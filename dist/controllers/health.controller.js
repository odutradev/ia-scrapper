"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHealth = void 0;
const health_service_1 = require("../services/health.service");
const constants_1 = require("../config/constants");
const checkHealth = (req, res) => {
    const healthData = (0, health_service_1.getSystemHealth)();
    return res.status(constants_1.STATUS_CODES.OK).json(healthData);
};
exports.checkHealth = checkHealth;
