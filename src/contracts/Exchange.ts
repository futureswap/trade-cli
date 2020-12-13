import { exchangeAddress } from "../constants";
import { Contract } from "ethers";
import { provider } from "../provider";
import { wallet } from "../provider";

const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_registryHolder",
        type: "address"
      },
      {
        internalType: "address",
        name: "_liquidityTokenAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "_assetAddress",
        type: "address"
      },
      {
        internalType: "address",
        name: "_stableAddress",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tradeId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "leverage",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collateral",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "openFee",
        type: "uint256"
      }
    ],
    name: "TradeOpen",
    type: "event"
  },
  {
    constant: true,
    inputs: [],
    name: "constants",
    outputs: [
      {
        internalType: "uint256",
        name: "poolBalancerDiscount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "addLiquidityFeePercent",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isDisabled",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "maxLeverage",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minLeverage",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxAssetSize",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "timeFee",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxDfr",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "dfrDivider",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "linearDfrMultiple",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "liquidityProviderReturn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "liquidatorReturn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "liquidationRatio",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxLiquidationReward",
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
    name: "instances",
    outputs: [
      {
        internalType: "contract ERC20Detailed",
        name: "stableToken",
        type: "address"
      },
      {
        internalType: "contract ERC20Detailed",
        name: "assetToken",
        type: "address"
      },
      {
        internalType: "contract IIncentives",
        name: "incentive",
        type: "address"
      },
      {
        internalType: "contract InternalWallet",
        name: "wallet",
        type: "address"
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
        internalType: "address",
        name: "a",
        type: "address"
      }
    ],
    name: "isExchangeFactory",
    outputs: [
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
    name: "isExchangeInitialized",
    outputs: [
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
    inputs: [
      {
        internalType: "address",
        name: "oracleAddress",
        type: "address"
      }
    ],
    name: "isValidOracleAddress",
    outputs: [
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
    inputs: [
      {
        internalType: "address",
        name: "stamperAddress",
        type: "address"
      }
    ],
    name: "isValidStamperAddress",
    outputs: [
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
    inputs: [
      {
        internalType: "address",
        name: "verifierAddress",
        type: "address"
      }
    ],
    name: "isValidVerifierAddress",
    outputs: [
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
    inputs: [
      {
        internalType: "address",
        name: "a",
        type: "address"
      }
    ],
    name: "isVotingSystem",
    outputs: [
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
    name: "liquidityToken",
    outputs: [
      {
        internalType: "contract LiquidityToken",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "state",
    outputs: [
      {
        internalType: "uint256",
        name: "minCollateralAmount",
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
    constant: false,
    inputs: [],
    name: "initializeExchange",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
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
    constant: false,
    inputs: [
      {
        internalType: "bool",
        name: "isAdjustingPoolBalancerDiscount",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "poolBalancerDiscount",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "dfrDivider",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxAssetSize",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "addLiquidityFeePercent",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "timeFee",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxLeverage",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "minLeverage",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isUpdatingMaxDfr",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "maxDfr",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isUpdatingLinearDfrMultiple",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "linearDfrMultiple",
        type: "uint256"
      }
    ],
    name: "constantsMultiVote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "bool",
        name: "_isWhiteListVote",
        type: "bool"
      },
      {
        internalType: "address",
        name: "_whitelistAddress",
        type: "address"
      },
      {
        internalType: "bool",
        name: "_addToWhitelist",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "_minCollateralAmount",
        type: "uint256"
      }
    ],
    name: "stateMultiVote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "liquidityProviderReturn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "liquidatorReturn",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "liquidationRatio",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxLiquidationReward",
        type: "uint256"
      }
    ],
    name: "liquidationMultiVote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "disableExchange",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "disableExchangeWithVote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
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
    name: "getLtPrice",
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
  },
  {
    constant: true,
    inputs: [],
    name: "getStableTokenAvailable",
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
  },
  {
    constant: true,
    inputs: [],
    name: "getAssetTokenAvailable",
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
  },
  {
    constant: true,
    inputs: [],
    name: "getDfr",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256"
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
        name: "_tradeId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_stablePrice",
        type: "uint256"
      }
    ],
    name: "getLiquidationPrice",
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
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "uint256",
        name: "_tradeId",
        type: "uint256"
      }
    ],
    name: "tradeIdToTrade",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128"
      },
      {
        internalType: "uint128",
        name: "",
        type: "uint128"
      },
      {
        internalType: "bool",
        name: "",
        type: "bool"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint128",
        name: "",
        type: "uint128"
      },
      {
        internalType: "uint128",
        name: "",
        type: "uint128"
      },
      {
        internalType: "uint128",
        name: "",
        type: "uint128"
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
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "assetPrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "stablePrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "marketAssetPrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "tradeFeeStable",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "collateral",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "leverage",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "tradeId",
        type: "uint256"
      }
    ],
    name: "openLong",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "assetPrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "stablePrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "marketAssetPrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "tradeFeeStable",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "collateral",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "leverage",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "tradeId",
        type: "uint256"
      }
    ],
    name: "openShort",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "assetPrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "stablePrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "marketAssetPrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "tradeFeeStable",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "tradeId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "percentToClose",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "referral",
        type: "address"
      }
    ],
    name: "closeTrade",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "assetPrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "stablePrice",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "addLiquidity",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "assetPrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "stablePrice",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "removeLiquidity",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "assetPrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "stablePrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "marketAssetPrice",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "tradeId",
        type: "uint256"
      }
    ],
    name: "liquidateTrade",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "assetPrice",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "stablePrice",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "signer",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isTradingAsset",
        type: "bool"
      }
    ],
    name: "balancePools",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_collateral",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_tradeId",
        type: "uint256"
      }
    ],
    name: "addCollateral",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "getStableTokenAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "tradeId",
        type: "uint256"
      }
    ],
    name: "closeDisabledTrade",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "_liquidityProviderAddress",
        type: "address"
      }
    ],
    name: "removeLiquidityDisabled",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "onRegistryRefresh",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];

export const exchangeInstance = new Contract(exchangeAddress, abi, wallet);
