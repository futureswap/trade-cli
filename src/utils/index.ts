import {
  FunctionId,
  UserMessageEncoder,
  userInteractionNumberRandom
} from "@fs-labs/signing-lib";
import { wallet } from "../provider";
import axios from "axios";
import { BigNumber, utils, BigNumberish } from "ethers";
import {
  assetTokenAddress,
  stableTokenAddress,
  CONTRACT_CALL_ENDPOINT,
  exchangeAddress,
  MESSAGE_PROCESSOR_API_ENDPOINT,
  ONE_ETHER,
  fsWalletAddress,
  registryHolder
} from "../constants";
import { exchangeInstance } from "../contracts/Exchange";
import { getErc20Instance } from "../contracts/ERC20";
import { getWalletInstance } from "../contracts/Wallet";

export const toBn = BigNumber.from;
export const fromWei = utils.formatEther;
export const toWei = utils.parseEther;

export const getExchangeData = async () => {
  try {
    const { data } = await axios.get(
      `${MESSAGE_PROCESSOR_API_ENDPOINT}/exchange/${exchangeAddress}`
    );
    return data.assetPrice;
  } catch (e) {
    console.log(e);
  }
  return 0;
};

export const getPoolInfo = async () => {
  let exchangeData: {
    stablePrice: BigNumberish;
    assetPrice: BigNumberish;
  } = await getExchangeData();

  const tokenPools = await exchangeInstance.tokenPools();
  const tokensInExchange = await exchangeInstance.balanceOf();
  const assetPool = await getAssetPoolInfo(tokensInExchange, tokenPools);
  const stablePool = await getStablePoolInfo(
    tokensInExchange,
    tokenPools,
    exchangeData
  );

  return { assetPool, stablePool };
};

export const getAssetPoolInfo = async (
  tokensInExchange: { [x: string]: any },
  tokenPools: {
    stableTokenCollateralPool: any;
    stableTokenBorrowPool: any;
    longAssetBorrowPool: any;
  }
) => {
  const balanceOfAssetInContract = tokensInExchange["0"];
  console.log({ balanceOfAssetInContract: String(balanceOfAssetInContract) });
  const balanceAssetInContractBN = toBn(balanceOfAssetInContract);

  const loanedOutAssetBN = toBn(tokenPools.longAssetBorrowPool);

  if (Number(loanedOutAssetBN) === 0) {
    return {
      loanedAsset: 0,
      totalAsset: 0,
      usedAssetPercent: 0
    };
  } else {
    const usedAssetPercentBN = loanedOutAssetBN
      .mul(toBn(ONE_ETHER))
      .mul(toBn("100"))
      .div(balanceAssetInContractBN);

    return {
      loanedAsset: Number(fromWei(loanedOutAssetBN)),
      totalAsset: Number(fromWei(balanceOfAssetInContract)),
      usedAssetPercent: Number(fromWei(usedAssetPercentBN))
    };
  }
};

export const getStablePoolInfo = async (
  tokensInExchange: { [x: string]: any },
  tokenPools: { stableTokenCollateralPool: any; stableTokenBorrowPool: any },
  exchangeData: any
) => {
  const stableTokenCollateralPool = tokenPools.stableTokenCollateralPool;
  const totalStableBalance = tokensInExchange["1"];

  const stableTokenCollateralPoolBN = toBn(stableTokenCollateralPool);
  const totalStableBalanceBN = toBn(totalStableBalance);

  const balanceStableInContract = totalStableBalanceBN.sub(
    stableTokenCollateralPoolBN
  );

  const loanedOutStableBN = toBn(tokenPools.stableTokenBorrowPool);

  if (Number(loanedOutStableBN) === 0) {
    return { loanedStable: 0, totalStable: 0, usedStablePercent: 0 };
  } else {
    const usedStablePercentBN = loanedOutStableBN
      .mul(toBn(ONE_ETHER))
      .mul(toBn("100"))
      .div(balanceStableInContract);

    const usedStablePercent = Number(fromWei(usedStablePercentBN));

    const totalStable =
      (Number(fromWei(balanceStableInContract)) *
        Number(fromWei(exchangeData.stablePrice))) /
      Number(fromWei(exchangeData.assetPrice));

    const loanedStable =
      (Number(fromWei(String(loanedOutStableBN))) *
        Number(fromWei(exchangeData.stablePrice))) /
      Number(fromWei(exchangeData.assetPrice));

    return { loanedStable, totalStable, usedStablePercent };
  }
};

export const getTransactionStatus = async (userInteractionNumber: string) => {
  try {
    const res = await axios.get(
      `${CONTRACT_CALL_ENDPOINT}/?transactionId=${userInteractionNumber}`
    );
    return res.data;
  } catch (e) {
    console.log(e);
  }
};

export const getPoolImbalance = async () => {
  let exchangeData: {
    stablePrice: BigNumberish;
    assetPrice: BigNumberish;
  } = await getExchangeData();

  const {
    "0": traderSendsDiscountedAmount,
    "1": traderWillReceiveAmount,
    "2": exchangeNeedsAsset
  } = await exchangeInstance.calculateImbalance(
    exchangeData.assetPrice,
    exchangeData.stablePrice
  );

  return {
    traderSendsDiscountedAmount,
    traderWillReceiveAmount,
    exchangeNeedsAsset
  };
};

export const getAssetTokenBalance = async () => {
  const tokenInstance = getErc20Instance(assetTokenAddress);
  const balance = await tokenInstance.balanceOf(wallet.address);
  return balance;
};

export const getStableTokenBalance = async () => {
  const tokenInstance = getErc20Instance(stableTokenAddress);
  const balance = await tokenInstance.balanceOf(wallet.address);
  return balance;
};

export const increaseStableTokenApproveBalance = async () => {
  const tokenInstance = getErc20Instance(stableTokenAddress);
  const tx = await tokenInstance.approve(
    fsWalletAddress,
    "1000000000000000000000000000000"
  );
};

export const isStableTokenApproved = async () => {
  const tokenInstance = getErc20Instance(stableTokenAddress);
  const allowanceAmount = await tokenInstance.allowance(
    wallet.address,
    fsWalletAddress
  );
  if (Number(fromWei(allowanceAmount)) > 10000) {
    return true;
  }
  return false;
};

export const getOpenTrades = async () => {
  try {
    const { data } = await axios.get(
      `${MESSAGE_PROCESSOR_API_ENDPOINT}/exchange/${exchangeAddress}/trades/${wallet.address}/`
    );
    return data.trades;
  } catch (e) {
    console.log(e);
    return [];
  }
};
export const getClosedTrades = async () => {
  try {
    const { data } = await axios.get(
      `${MESSAGE_PROCESSOR_API_ENDPOINT}/exchange/${exchangeAddress}/closedtrades/${wallet.address}/`
    );

    return data.trades;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const commify = (bN: any) => {
  const formattedNumber = utils.commify(fromWei(bN));
  return formattedNumber.slice(0, formattedNumber.indexOf(".") + 3);
};

export const getWalletTokenBalance = async () => {
  const walletInstance = getWalletInstance();

  try {
    const stableBalance = await walletInstance.balanceOf(
      stableTokenAddress,
      wallet.address
    );
    return stableBalance;
  } catch (e) {
    console.log(e);
  }
  return 0;
};

export const fsWalletDespoit = async (amount: number) => {
  const walletInstance = getWalletInstance();
  const stableTokenInstance = getErc20Instance(stableTokenAddress);

  const decimals = await stableTokenInstance.decimals();
  const safeAmountToTransfer = utils.parseUnits(String(amount), decimals);

  await walletInstance.deposit(stableTokenAddress, safeAmountToTransfer);
};

export const handleOpenTrade = async ({
  leverage,
  isLong,
  collateral
}: any) => {
  const functionId = isLong
    ? FunctionId.OPEN_LONG_ID
    : FunctionId.OPEN_SHORT_ID;

  const openTradeParams = {
    functionId,
    exchangeAddress,
    assetPriceBound: toBn("0"),
    stablePriceBound: toBn("0"),
    userInteractionNumber: toBn(userInteractionNumberRandom()),
    gasStableBound: toBn("0"),
    minTransmitterGas: toWei("0"),
    collateral: toBn(String(toWei(String(collateral)))),
    leverage: toBn(leverage),
    tradeFeeBound: toBn("0"),
    signatureTime: toBn(Math.floor(Date.now() / 1000))
  };

  const userMessageEncoder = new UserMessageEncoder();

  const { packedMessage, signature } = await userMessageEncoder.encodeOpenTrade(
    openTradeParams,
    async array => await wallet.signMessage(array)
  );

  const payload = JSON.stringify({
    signature,
    packedMessage,
    functionId
  });
  try {
    // const { data } = await axios.put(
    //   `${CONTRACT_CALL_ENDPOINT}?assetPriceOverwrite=650000000000000000000`,
    //   payload
    // );
    const { data } = await axios.put(`${CONTRACT_CALL_ENDPOINT}`, payload);
    console.log("\n");
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const handleCloseTrade = async ({
  tradeId,
  type,
  percentToCloseInWei,
  referral
}: any) => {
  const userMessageEncoder = new UserMessageEncoder();

  const closeTradeParams = {
    functionId: FunctionId.CLOSE_TRADE_ID,
    exchangeAddress: exchangeAddress,
    assetPriceBound: toBn("0"),
    stablePriceBound: toBn("0"),
    userInteractionNumber: toBn(userInteractionNumberRandom()),
    gasStableBound: toBn("0"),
    minTransmitterGas: toWei("0"),
    tradeId: toBn(tradeId),
    isLong: type === "long",
    referral: "0x0000000000000000000000000000000000000000",
    tradeFeeBound: toBn("0"),
    percentToClose: toWei("1"), //we want to full close the position so its 1 = 100%, .5 = 50%, ect...
    signatureTime: toBn(Math.floor(Date.now() / 1000))
  };

  const {
    packedMessage,
    signature
  } = await userMessageEncoder.encodeCloseTrade(
    closeTradeParams,
    async array => await wallet.signMessage(array)
  );

  const payload = JSON.stringify({
    signature,
    packedMessage,
    functionId: FunctionId.CLOSE_TRADE_ID
  });

  try {
    const response = await axios.put(CONTRACT_CALL_ENDPOINT, payload);
    console.log(response.data);
    return response;
  } catch (e) {
    console.log(e);
  }
};

export const handleAddCollateral = async (onChainId: any, collateral: any) => {
  const addCollateralParams = {
    tradeId: toBn(onChainId),
    collateral: toBn(String(toWei(String(collateral)))),
    functionId: FunctionId.ADD_COLLATERAL_ID,
    assetPriceBound: toBn("0"),
    stablePriceBound: toBn("0"),
    userInteractionNumber: toBn(userInteractionNumberRandom()),
    gasStableBound: toBn("0"),
    minTransmitterGas: toWei("0"),
    signatureTime: toBn(Math.floor(Date.now() / 1000)),
    exchangeAddress: exchangeAddress
  };

  const userMessageEncoder = new UserMessageEncoder();

  const {
    packedMessage,
    signature
  } = await userMessageEncoder.encodeAddCollateral(
    addCollateralParams,
    async array => await wallet.signMessage(array)
  );

  const payload = JSON.stringify({
    signature,
    packedMessage,
    functionId: FunctionId.ADD_COLLATERAL_ID
  });

  try {
    const response = await axios.put(CONTRACT_CALL_ENDPOINT, payload);
    console.log(response.data);
    return response;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const handleInstantWithdrawal = async (amount: any) => {
  const instantWithdrawalParams = {
    amount: toBn(String(toWei(String(amount)))),
    tokenAddress: stableTokenAddress,
    registryHolder: registryHolder,
    functionId: FunctionId.INSTANT_WITHDRAW_ID,
    assetPriceBound: toBn("0"),
    stablePriceBound: toBn("0"),
    userInteractionNumber: toBn(userInteractionNumberRandom()),
    gasStableBound: toBn("0"),
    minTransmitterGas: toWei("0"),
    signatureTime: toBn(Math.floor(Date.now() / 1000))
  };

  const userMessageEncoder = new UserMessageEncoder();

  const {
    packedMessage,
    signature
  } = await userMessageEncoder.encodeInstantWithdraw(
    instantWithdrawalParams,
    async array => await wallet.signMessage(array)
  );

  const payload = JSON.stringify({
    signature,
    packedMessage,
    functionId: FunctionId.INSTANT_WITHDRAW_ID
  });
  try {
    const res = await axios.put(CONTRACT_CALL_ENDPOINT, payload);
    console.log(res.data);
    return res.data;
  } catch (e) {
    console.log(e);
  }
};

export const callValidate = async (tradeData: any) => {
  const data = {
    isLong: tradeData.isLong,
    collateralAmount: String(toWei(String(tradeData.collateral))),
    assetAmount: "0",
    leverage: String(tradeData.leverage),
    exchangeAddress
  };

  try {
    const req = await axios.post(
      `${MESSAGE_PROCESSOR_API_ENDPOINT}/exchange/${exchangeAddress}/validation/openTrade/${wallet.address}`,
      JSON.stringify(data)
    );
    return req.data;
  } catch (e) {
    console.log(e);
  }
};
