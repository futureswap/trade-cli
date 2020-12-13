"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callValidate = exports.handleInstantWithdrawal = exports.handleAddCollateral = exports.handleCloseTrade = exports.handleOpenTrade = exports.closeDisableTrade = exports.fsWalletDespoit = exports.getWalletTokenBalance = exports.commify = exports.getClosedTrades = exports.getOpenTrades = exports.isStableTokenApproved = exports.increaseStableTokenApproveBalance = exports.getStableTokenBalance = exports.getAssetTokenBalance = exports.getPoolImbalance = exports.getTransactionStatus = exports.getStablePoolInfo = exports.getAssetPoolInfo = exports.getPoolInfo = exports.getExchangeData = exports.toWei = exports.fromWei = exports.toBn = void 0;
const signing_lib_1 = require("@fs-labs/signing-lib");
const provider_1 = require("../provider");
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const constants_1 = require("../constants");
const Exchange_1 = require("../contracts/Exchange");
const ERC20_1 = require("../contracts/ERC20");
const Wallet_1 = require("../contracts/Wallet");
exports.toBn = ethers_1.BigNumber.from;
exports.fromWei = ethers_1.utils.formatEther;
exports.toWei = ethers_1.utils.parseEther;
exports.getExchangeData = async () => {
    try {
        const { data } = await axios_1.default.get(`${constants_1.MESSAGE_PROCESSOR_API_ENDPOINT}/exchange/${constants_1.exchangeAddress}`);
        return data.assetPrice;
    }
    catch (e) {
        console.log(e);
    }
    return 0;
};
exports.getPoolInfo = async () => {
    let exchangeData = await exports.getExchangeData();
    const tokenPools = await Exchange_1.exchangeInstance.tokenPools();
    const tokensInExchange = await Exchange_1.exchangeInstance.balanceOf();
    const assetPool = await exports.getAssetPoolInfo(tokensInExchange, tokenPools);
    const stablePool = await exports.getStablePoolInfo(tokensInExchange, tokenPools, exchangeData);
    return { assetPool, stablePool };
};
exports.getAssetPoolInfo = async (tokensInExchange, tokenPools) => {
    const balanceOfAssetInContract = tokensInExchange["0"];
    console.log({ balanceOfAssetInContract: String(balanceOfAssetInContract) });
    const balanceAssetInContractBN = exports.toBn(balanceOfAssetInContract);
    const loanedOutAssetBN = exports.toBn(tokenPools.longAssetBorrowPool);
    if (Number(loanedOutAssetBN) === 0) {
        return {
            loanedAsset: 0,
            totalAsset: 0,
            usedAssetPercent: 0
        };
    }
    else {
        const usedAssetPercentBN = loanedOutAssetBN
            .mul(exports.toBn(constants_1.ONE_ETHER))
            .mul(exports.toBn("100"))
            .div(balanceAssetInContractBN);
        return {
            loanedAsset: Number(exports.fromWei(loanedOutAssetBN)),
            totalAsset: Number(exports.fromWei(balanceOfAssetInContract)),
            usedAssetPercent: Number(exports.fromWei(usedAssetPercentBN))
        };
    }
};
exports.getStablePoolInfo = async (tokensInExchange, tokenPools, exchangeData) => {
    const stableTokenCollateralPool = tokenPools.stableTokenCollateralPool;
    const totalStableBalance = tokensInExchange["1"];
    const stableTokenCollateralPoolBN = exports.toBn(stableTokenCollateralPool);
    const totalStableBalanceBN = exports.toBn(totalStableBalance);
    const balanceStableInContract = totalStableBalanceBN.sub(stableTokenCollateralPoolBN);
    const loanedOutStableBN = exports.toBn(tokenPools.stableTokenBorrowPool);
    if (Number(loanedOutStableBN) === 0) {
        return { loanedStable: 0, totalStable: 0, usedStablePercent: 0 };
    }
    else {
        const usedStablePercentBN = loanedOutStableBN
            .mul(exports.toBn(constants_1.ONE_ETHER))
            .mul(exports.toBn("100"))
            .div(balanceStableInContract);
        const usedStablePercent = Number(exports.fromWei(usedStablePercentBN));
        const totalStable = (Number(exports.fromWei(balanceStableInContract)) *
            Number(exports.fromWei(exchangeData.stablePrice))) /
            Number(exports.fromWei(exchangeData.assetPrice));
        const loanedStable = (Number(exports.fromWei(String(loanedOutStableBN))) *
            Number(exports.fromWei(exchangeData.stablePrice))) /
            Number(exports.fromWei(exchangeData.assetPrice));
        return { loanedStable, totalStable, usedStablePercent };
    }
};
exports.getTransactionStatus = async (userInteractionNumber) => {
    try {
        const res = await axios_1.default.get(`${constants_1.CONTRACT_CALL_ENDPOINT}/?transactionId=${userInteractionNumber}`);
        return res.data;
    }
    catch (e) {
        console.log(e);
    }
};
exports.getPoolImbalance = async () => {
    let exchangeData = await exports.getExchangeData();
    const { "0": traderSendsDiscountedAmount, "1": traderWillReceiveAmount, "2": exchangeNeedsAsset } = await Exchange_1.exchangeInstance.calculateImbalance(exchangeData.assetPrice, exchangeData.stablePrice);
    return {
        traderSendsDiscountedAmount,
        traderWillReceiveAmount,
        exchangeNeedsAsset
    };
};
exports.getAssetTokenBalance = async () => {
    const tokenInstance = ERC20_1.getErc20Instance(constants_1.assetTokenAddress);
    const balance = await tokenInstance.balanceOf(provider_1.wallet.address);
    return balance;
};
exports.getStableTokenBalance = async () => {
    const tokenInstance = ERC20_1.getErc20Instance(constants_1.stableTokenAddress);
    const balance = await tokenInstance.balanceOf(provider_1.wallet.address);
    return balance;
};
exports.increaseStableTokenApproveBalance = async () => {
    const tokenInstance = ERC20_1.getErc20Instance(constants_1.stableTokenAddress);
    const tx = await tokenInstance.approve(constants_1.fsWalletAddress, "1000000000000000000000000000000");
};
exports.isStableTokenApproved = async () => {
    const tokenInstance = ERC20_1.getErc20Instance(constants_1.stableTokenAddress);
    const allowanceAmount = await tokenInstance.allowance(provider_1.wallet.address, constants_1.fsWalletAddress);
    if (Number(exports.fromWei(allowanceAmount)) > 10000) {
        return true;
    }
    return false;
};
exports.getOpenTrades = async () => {
    try {
        const { data } = await axios_1.default.get(`${constants_1.MESSAGE_PROCESSOR_API_ENDPOINT}/exchange/${constants_1.exchangeAddress}/trades/${provider_1.wallet.address}/`);
        return data.trades;
    }
    catch (e) {
        console.log(e);
        return [];
    }
};
exports.getClosedTrades = async () => {
    try {
        const { data } = await axios_1.default.get(`${constants_1.MESSAGE_PROCESSOR_API_ENDPOINT}/exchange/${constants_1.exchangeAddress}/closedtrades/${provider_1.wallet.address}/`);
        return data.trades;
    }
    catch (e) {
        console.log(e);
        return [];
    }
};
exports.commify = (bN) => {
    const formattedNumber = ethers_1.utils.commify(exports.fromWei(bN));
    return formattedNumber.slice(0, formattedNumber.indexOf(".") + 3);
};
exports.getWalletTokenBalance = async () => {
    const walletInstance = Wallet_1.getWalletInstance();
    try {
        const stableBalance = await walletInstance.balanceOf(constants_1.stableTokenAddress, provider_1.wallet.address);
        return stableBalance;
    }
    catch (e) {
        console.log(e);
    }
    return 0;
};
exports.fsWalletDespoit = async (amount) => {
    const walletInstance = Wallet_1.getWalletInstance();
    const stableTokenInstance = ERC20_1.getErc20Instance(constants_1.stableTokenAddress);
    const decimals = await stableTokenInstance.decimals();
    const safeAmountToTransfer = ethers_1.utils.parseUnits(String(amount), decimals);
    await walletInstance.deposit(constants_1.stableTokenAddress, safeAmountToTransfer);
};
exports.closeDisableTrade = async (trade) => {
    try {
        const tx = await Exchange_1.exchangeInstance.closeDisabledTrade(trade, {
            gasPrice: 20000000000,
            gasLimit: 189135
        });
        console.log("!");
        console.log("send and waiting...");
        let receipt = await tx.wait(6);
        console.log("!!!");
        console.log(receipt);
    }
    catch (e) {
        console.log("failed");
        console.log(e);
    }
};
exports.handleOpenTrade = async ({ leverage, isLong, collateral }) => {
    const functionId = isLong
        ? signing_lib_1.FunctionId.OPEN_LONG_ID
        : signing_lib_1.FunctionId.OPEN_SHORT_ID;
    const openTradeParams = {
        functionId,
        exchangeAddress: constants_1.exchangeAddress,
        assetPriceBound: exports.toBn("0"),
        stablePriceBound: exports.toBn("0"),
        userInteractionNumber: exports.toBn(signing_lib_1.userInteractionNumberRandom()),
        gasStableBound: exports.toBn("0"),
        minTransmitterGas: exports.toWei("0"),
        collateral: exports.toBn(String(exports.toWei(String(collateral)))),
        leverage: exports.toBn(leverage),
        tradeFeeBound: exports.toBn("0"),
        signatureTime: exports.toBn(Math.floor(Date.now() / 1000))
    };
    const userMessageEncoder = new signing_lib_1.UserMessageEncoder();
    const { packedMessage, signature } = await userMessageEncoder.encodeOpenTrade(openTradeParams, async (array) => await provider_1.wallet.signMessage(array));
    const payload = JSON.stringify({
        signature,
        packedMessage,
        functionId
    });
    try {
        // const { data } = await axios.put(`${CONTRACT_CALL_ENDPOINT}`, payload);
        const { data } = await axios_1.default.put(constants_1.CONTRACT_CALL_ENDPOINT + "?assetPriceOverwrite=480000000000000000000", payload);
        console.log("\n");
        console.log(data);
        return data;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
exports.handleCloseTrade = async ({ tradeId, type, percentToCloseInWei, referral }) => {
    const userMessageEncoder = new signing_lib_1.UserMessageEncoder();
    const closeTradeParams = {
        functionId: signing_lib_1.FunctionId.CLOSE_TRADE_ID,
        exchangeAddress: constants_1.exchangeAddress,
        assetPriceBound: exports.toBn("0"),
        stablePriceBound: exports.toBn("0"),
        userInteractionNumber: exports.toBn(signing_lib_1.userInteractionNumberRandom()),
        gasStableBound: exports.toBn("0"),
        minTransmitterGas: exports.toWei("0"),
        tradeId: exports.toBn(tradeId),
        isLong: type === "long",
        referral: "0x0000000000000000000000000000000000000000",
        tradeFeeBound: exports.toBn("0"),
        percentToClose: exports.toWei("1"),
        signatureTime: exports.toBn(Math.floor(Date.now() / 1000))
    };
    const { packedMessage, signature } = await userMessageEncoder.encodeCloseTrade(closeTradeParams, async (array) => await provider_1.wallet.signMessage(array));
    const payload = JSON.stringify({
        signature,
        packedMessage,
        functionId: signing_lib_1.FunctionId.CLOSE_TRADE_ID
    });
    try {
        const response = await axios_1.default.put(constants_1.CONTRACT_CALL_ENDPOINT, payload);
        console.log(response.data);
        return response;
    }
    catch (e) {
        console.log(e);
    }
};
exports.handleAddCollateral = async (onChainId, collateral) => {
    const addCollateralParams = {
        tradeId: exports.toBn(onChainId),
        collateral: exports.toBn(String(exports.toWei(String(collateral)))),
        functionId: signing_lib_1.FunctionId.ADD_COLLATERAL_ID,
        assetPriceBound: exports.toBn("0"),
        stablePriceBound: exports.toBn("0"),
        userInteractionNumber: exports.toBn(signing_lib_1.userInteractionNumberRandom()),
        gasStableBound: exports.toBn("0"),
        minTransmitterGas: exports.toWei("0"),
        signatureTime: exports.toBn(Math.floor(Date.now() / 1000)),
        exchangeAddress: constants_1.exchangeAddress
    };
    const userMessageEncoder = new signing_lib_1.UserMessageEncoder();
    const { packedMessage, signature } = await userMessageEncoder.encodeAddCollateral(addCollateralParams, async (array) => await provider_1.wallet.signMessage(array));
    const payload = JSON.stringify({
        signature,
        packedMessage,
        functionId: signing_lib_1.FunctionId.ADD_COLLATERAL_ID
    });
    try {
        const response = await axios_1.default.put(constants_1.CONTRACT_CALL_ENDPOINT, payload);
        console.log(response.data);
        return response;
    }
    catch (e) {
        console.log(e);
        return null;
    }
};
exports.handleInstantWithdrawal = async (amount) => {
    const instantWithdrawalParams = {
        amount: exports.toBn(String(exports.toWei(String(amount)))),
        tokenAddress: constants_1.stableTokenAddress,
        registryHolder: constants_1.registryHolder,
        functionId: signing_lib_1.FunctionId.INSTANT_WITHDRAW_ID,
        assetPriceBound: exports.toBn("0"),
        stablePriceBound: exports.toBn("0"),
        userInteractionNumber: exports.toBn(signing_lib_1.userInteractionNumberRandom()),
        gasStableBound: exports.toBn("0"),
        minTransmitterGas: exports.toWei("0"),
        signatureTime: exports.toBn(Math.floor(Date.now() / 1000))
    };
    const userMessageEncoder = new signing_lib_1.UserMessageEncoder();
    const { packedMessage, signature } = await userMessageEncoder.encodeInstantWithdraw(instantWithdrawalParams, async (array) => await provider_1.wallet.signMessage(array));
    const payload = JSON.stringify({
        signature,
        packedMessage,
        functionId: signing_lib_1.FunctionId.INSTANT_WITHDRAW_ID
    });
    try {
        const res = await axios_1.default.put(constants_1.CONTRACT_CALL_ENDPOINT, payload);
        console.log(res.data);
        return res.data;
    }
    catch (e) {
        console.log(e);
    }
};
exports.callValidate = async (tradeData) => {
    const data = {
        isLong: tradeData.isLong,
        collateralAmount: String(exports.toWei(String(tradeData.collateral))),
        assetAmount: "0",
        leverage: String(tradeData.leverage),
        exchangeAddress: constants_1.exchangeAddress
    };
    try {
        const req = await axios_1.default.post(`${constants_1.MESSAGE_PROCESSOR_API_ENDPOINT}/exchange/${constants_1.exchangeAddress}/validation/openTrade/${provider_1.wallet.address}`, JSON.stringify(data));
        return req.data;
    }
    catch (e) {
        console.log(e);
    }
};
