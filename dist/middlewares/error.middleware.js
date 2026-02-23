"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const constants_1 = require("../config/constants");
const errorHandler = (err, req, res, next) => {
    const status = constants_1.STATUS_CODES.INTERNAL_ERROR;
    const message = err.message ?? 'Internal Server Error';
    return res.status(status).json({ error: message });
};
exports.errorHandler = errorHandler;
