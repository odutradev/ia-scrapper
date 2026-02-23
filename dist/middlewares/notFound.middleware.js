"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const constants_1 = require("../config/constants");
const notFoundHandler = (req, res) => {
    return res.status(constants_1.STATUS_CODES.NOT_FOUND).json({ error: 'Route not found' });
};
exports.notFoundHandler = notFoundHandler;
