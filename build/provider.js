"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallet = exports.provider = exports.privateKey = exports.infuraId = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
require("dotenv").config();
exports.infuraId = process.env.INFURA_API_ID;
exports.privateKey = String(process.env.PRIVATE_KEY);
exports.provider = new ethers_1.providers.InfuraProvider(constants_1.NETWORK, exports.infuraId);
exports.wallet = new ethers_1.Wallet(exports.privateKey, exports.provider);
