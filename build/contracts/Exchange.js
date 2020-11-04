"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeInstance = void 0;
const constants_1 = require("../constants");
const ethers_1 = require("ethers");
const provider_1 = require("../provider");
const abi = [
    {
        constant: true,
        inputs: [],
        name: "tokenPools",
        outputs: [
            {
                internalType: "uint256",
                name: "longAssetBorrowPool",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "longBorrowValue",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "shortAssetBorrowPool",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "shortBorrowValue",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "stableTokenBorrowPool",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "stableTokenCollateralPool",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "stablePoolSharesOutstanding",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "longSharesOutstanding",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "shortSharesOutstanding",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "lastDfrUpdate",
                type: "uint256"
            }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [
            {
                internalType: "uint256",
                name: "_assetPrice",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_stablePrice",
                type: "uint256"
            }
        ],
        name: "calculateImbalance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "bool",
                name: "",
                type: "bool"
            }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    }
];
exports.exchangeInstance = new ethers_1.Contract(constants_1.exchangeAddress, abi, provider_1.provider);
