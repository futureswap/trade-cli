import { providers, Wallet } from "ethers";
import { NETWORK } from "./constants";
require("dotenv").config();

export const infuraId = process.env.INFURA_API_ID;
export const privateKey = String(process.env.PRIVATE_KEY);

export const provider = new providers.InfuraProvider(NETWORK, infuraId);
export const wallet = new Wallet(privateKey, provider);
