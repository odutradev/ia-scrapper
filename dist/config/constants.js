"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_CODES = exports.PORT = exports.ENV = void 0;
exports.ENV = process.env.NODE_ENV ?? 'development';
exports.PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
exports.STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
};
