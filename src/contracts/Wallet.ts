import { Contract } from "ethers";
import { wallet } from "../provider";
import { fsWalletAddress } from "../constants";

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
    name: "deposit", // save
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
    name: "balanceOf", // save
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

export const getWalletInstance = () =>
  new Contract(fsWalletAddress, abi, wallet);
