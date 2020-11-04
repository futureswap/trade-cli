"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletInstance = void 0;
const ethers_1 = require("ethers");
const provider_1 = require("../provider");
const constants_1 = require("../constants");
const abi = [
    {
        constant: false,
        inputs: [
            {
                internalType: "address",
                name: "_tokenAddress",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            }
        ],
        name: "deposit",
        outputs: [],
        payable: true,
        stateMutability: "payable",
        type: "function"
    },
    {
        constant: true,
        inputs: [
            {
                internalType: "address",
                name: "_publicTokenAddress",
                type: "address"
            },
            {
                internalType: "address",
                name: "_userAddress",
                type: "address"
            }
        ],
        name: "balanceOf",
        outputs: [
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
exports.getWalletInstance = () => new ethers_1.Contract(constants_1.fsWalletAddress, abi, provider_1.wallet);
