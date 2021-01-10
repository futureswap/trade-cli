"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const WebSocket = require("ws");
const ws = new WebSocket(constants_1.WEBSOCKET_ENDPOINT);
exports.default = ws;
