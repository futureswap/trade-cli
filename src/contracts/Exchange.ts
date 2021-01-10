import { exchangeAddress } from "../constants";
import { Contract } from "ethers";
import { provider } from "../provider";
import { wallet } from "../provider";

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

export const exchangeInstance = new Contract(exchangeAddress, abi, wallet);
