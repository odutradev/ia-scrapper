"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./config/constants");
const app_1 = require("./app");
const startServer = () => {
    const app = (0, app_1.buildApp)();
    app.listen(constants_1.PORT, () => {
        process.stdout.write(`Server running on port ${constants_1.PORT}\n`);
    });
};
startServer();
