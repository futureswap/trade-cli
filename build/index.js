"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const _ = __importStar(require("lodash"));
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("./utils");
const ethers_1 = require("ethers");
const provider_1 = require("./provider");
const moment_1 = __importDefault(require("moment"));
//push this into a lib
let loader = ["/ Loading", "| Loading", "\\ Loading", "- Loading"];
let i = 4;
const coreActionList = {
    type: "list",
    name: "coreAction",
    message: "Select an action",
    choices: [
        "Show opened trades",
        "Show closed trades",
        "Open trade",
        "Withdraw",
        "Deposit",
        "Refresh",
        "Terms"
    ]
};
const confirmTradeActions = {
    type: "list",
    name: "confirmTradeActions",
    message: "Select an action",
    choices: ["Confirm", "Back"]
};
const main = async () => {
    const stableBalance = await utils_1.getStableTokenBalance();
    const stableInFsWalletBalance = await utils_1.getWalletTokenBalance();
    console.log(`
Hello ${provider_1.wallet.address}
Welcome to the Trade CLI
  `);
    console.log(`USDC balances: 
  wallet: ${ethers_1.utils.commify(ethers_1.utils.formatUnits(stableBalance, 6))}
  fs-wallet: ${ethers_1.utils.commify(ethers_1.utils.formatUnits(stableInFsWalletBalance, 6))}
  `); //go to the frontend for this data
    const assetPrice = await utils_1.getExchangeData();
    console.log(`Current ETH Price: $${utils_1.commify(String(assetPrice))}\n`);
    checkTerms();
};
main();
const checkApprove = async () => {
    const isApproved = await utils_1.isStableTokenApproved();
    if (isApproved) {
        listOfCoreActions();
    }
    else {
        //run approve then run main
        console.log(`You'll need to approve the margin account before you can start...`);
        console.log(`Make sure you have some ETH to run the tx`);
        console.log(`Attempting to run approve tx...`);
        await utils_1.increaseStableTokenApproveBalance();
        var uiBottom = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] });
        const loadingUi = setInterval(() => {
            uiBottom.updateBottomBar(loader[i++ % 4]);
        }, 300);
        setTimeout(() => {
            clearInterval(loadingUi);
            uiBottom.updateBottomBar("");
            checkApprove();
        }, 30000);
    }
};
const listOfCoreActions = async () => {
    inquirer
        .prompt(coreActionList)
        .then(async (answers) => {
        if (answers.coreAction === "Show opened trades") {
            openTradesOptions();
        }
        else if (answers.coreAction === "Show closed trades") {
            closedTradesOptions();
        }
        else if (answers.coreAction === "Open trade") {
            createTrade();
        }
        else if (answers.coreAction === "Withdraw") {
            withdrawMenu();
        }
        else if (answers.coreAction === "Deposit") {
            depositMenu();
        }
        else if (answers.coreAction === "Terms") {
            getTerms();
        }
        else if (answers.coreAction === "Refresh") {
            main();
        }
        else {
            console.log("You cannot go that way. Try again");
            listOfCoreActions();
        }
    });
};
const openTradesOptions = async () => {
    const openTrades = await utils_1.getOpenTrades();
    const trades = openTrades.map((trade) => trade.tradeId);
    console.log(`Number of trades open: ${trades.length}`);
    const openTradesPrompt = {
        type: "list",
        name: "selectOpenTrades",
        message: "Select a trade id",
        choices: [...trades, "Batch close trades", "Back"]
    };
    inquirer
        .prompt(openTradesPrompt)
        .then(async (answers) => {
        var option = answers.selectOpenTrades;
        if (option !== "Back" && option !== "Batch close trades") {
            const tradeLocation = _.findIndex(openTrades, function (trade) {
                return String(trade.tradeId) == String(option);
            });
            const { type, tradeId, leverage, assetTokenBorrowed, tradeValue, openPrice, liquidationPrice, collateral, profitLoss, openTime, tradeFee, fundingRateFee, timeFee, totalReturn, state, creationTime } = openTrades[tradeLocation];
            console.log(`
Id: ${tradeId}
Type: ${type}
Value: $${utils_1.commify(tradeValue)}
Collateral: $${utils_1.commify(collateral)}
Leverage: ${Number(utils_1.fromWei(leverage)).toFixed(2)}
Open Price: $${utils_1.commify(openPrice)}
Created on: ${moment_1.default.unix(creationTime).format()}
Liquidation Price: $${utils_1.commify(liquidationPrice)}
P&L: $${utils_1.commify(profitLoss.value)}    
`);
            openTradeActions(openTrades[tradeLocation]);
        }
        else if (option == "Batch close trades") {
            trades;
            console.log(`
        Closing trades... 
                `);
            let tradeArrayReduced = openTrades.slice(0, 50);
            tradeArrayReduced.map((trade) => {
                utils_1.handleCloseTrade(trade);
            });
        }
        else {
            listOfCoreActions();
        }
    });
};
const closedTradesOptions = async () => {
    const closedTrades = await utils_1.getClosedTrades();
    const trades = closedTrades.map((trade) => trade.tradeId);
    console.log(`Number of trades closed: ${trades.length}`);
    const closedTradesPrompt = {
        type: "list",
        name: "selectClosedTrades",
        message: "Select a trade id",
        choices: [...trades, "Back"]
    };
    inquirer
        .prompt(closedTradesPrompt)
        .then(async (answers) => {
        var option = answers.selectClosedTrades;
        if (option !== "Back") {
            if (option !== "Back") {
                const tradeLocation = _.findIndex(closedTrades, function (trade) {
                    return String(trade.tradeId) == String(option);
                });
                console.log(closedTrades[tradeLocation]);
                const { type, tradeId, leverage, tradeValue, openPrice, isLiquidated, collateral, profitLoss, creationTime, tradeFee, fundingRateFee, timeFee, totalReturn, state } = closedTrades[tradeLocation];
                console.log(`
  Id: ${tradeId}
  Type: ${type}
  Value: $${utils_1.commify(tradeValue)}
  Collateral: $${utils_1.commify(collateral)}
  Leverage: ${leverage}
  Open Price: $${utils_1.commify(openPrice)}
  Created on: ${moment_1.default.unix(creationTime).format()}
   P&L: $${utils_1.commify(profitLoss.value)}    
  Total return: $${utils_1.commify(totalReturn)}
           `);
            }
            closedTradesOptions();
        }
        else {
            listOfCoreActions();
        }
    });
};
const openTradeActions = (trade) => {
    inquirer
        .prompt({
        type: "list",
        name: "action",
        message: "Select an action",
        choices: ["Close trade", "Increase collateral", "Back"]
    })
        .then(async (answers) => {
        var option = answers.action;
        if (option === "Close trade") {
            console.log(`
Closing trade... 
        `);
            utils_1.handleCloseTrade(trade);
            var uiBottom = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] });
            const loadingUi = setInterval(() => {
                uiBottom.updateBottomBar(loader[i++ % 4]);
            }, 300);
            setTimeout(() => {
                clearInterval(loadingUi);
                uiBottom.updateBottomBar("");
                console.log("\nSuccess!\n");
                openTradesOptions();
            }, 90000);
        }
        else if (option === "Increase collateral") {
            addCollateralAction(trade);
        }
        else {
            openTradesOptions();
        }
    });
};
const withdrawMenu = async () => {
    const stableInFsWalletBalance = await utils_1.getWalletTokenBalance();
    const formattedAmount = ethers_1.utils.formatUnits(stableInFsWalletBalance, 6);
    console.log(`Margin account balance: ${ethers_1.utils.commify(formattedAmount)}`);
    const questions = [
        {
            type: "input",
            name: "amountToWithdraw",
            message: "Withdraw amount:",
            validate: (value) => {
                if (value > 0 && value <= Number(formattedAmount)) {
                    return true;
                }
                return "Please enter a valid amount";
            },
            filter: Number
        }
    ];
    inquirer.prompt(questions).then(async (answers) => {
        console.log(`Withdrawing ${answers.amountToWithdraw} USDC`);
        utils_1.handleInstantWithdrawal(answers.amountToWithdraw);
        var uiBottom = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] });
        const loadingUi = setInterval(() => {
            uiBottom.updateBottomBar(loader[i++ % 4]);
        }, 300);
        setTimeout(() => {
            clearInterval(loadingUi);
            uiBottom.updateBottomBar("");
            // console.log("\nSuccess!\n");
            listOfCoreActions();
        }, 10000);
    });
};
const addCollateralAction = async (trade) => {
    const questions = [
        {
            type: "input",
            name: "collateralToAdd",
            message: "Amount to add:",
            filter: Number
        }
    ];
    inquirer.prompt(questions).then(async (answers) => {
        console.log(`Adding ${answers.collateralToAdd} USDC to position`);
        await utils_1.handleAddCollateral(trade.tradeId, answers.collateralToAdd);
        var uiBottom = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] });
        const loadingUi = setInterval(() => {
            uiBottom.updateBottomBar(loader[i++ % 4]);
        }, 300);
        setTimeout(() => {
            clearInterval(loadingUi);
            uiBottom.updateBottomBar("");
            console.log("\nSuccess!\n");
            openTradesOptions();
        }, 90000);
    });
};
const depositMenu = async () => {
    const stableBalance = await utils_1.getStableTokenBalance();
    const formattedAmount = ethers_1.utils.formatUnits(stableBalance, 6);
    console.log(`Wallet balance: ${ethers_1.utils.commify(formattedAmount)}`);
    const questions = [
        {
            type: "input",
            name: "amountToDesposit",
            message: "Deposit amount:",
            validate: (value) => {
                if (value > 0 && value <= Number(formattedAmount)) {
                    return true;
                }
                return "Please enter a valid amount";
            },
            filter: Number
        }
    ];
    inquirer.prompt(questions).then(async (answers) => {
        console.log(`Depositing ${answers.amountToDesposit} USDC`);
        utils_1.fsWalletDespoit(answers.amountToDesposit);
        var uiBottom = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] });
        const loadingUi = setInterval(() => {
            uiBottom.updateBottomBar(loader[i++ % 4]);
        }, 300);
        setTimeout(() => {
            clearInterval(loadingUi);
            uiBottom.updateBottomBar("");
            console.log("\nSuccess!\n");
            listOfCoreActions();
        }, 30000);
    });
};
const checkTerms = async () => {
    //check if they have agree to the terms
    let actions;
    try {
        const { data } = await axios_1.default.get(`https://api.dev.futureswap.gg/prod/api/v1/allowedactions/${provider_1.wallet.address}`);
        actions = data;
    }
    catch (e) {
        console.log("could not fetch actions");
        return false;
    }
    if (actions.allowedActions.length > 0 && actions.agreedToTerms) {
        checkApprove();
        return;
    }
    let terms;
    try {
        const { data } = await axios_1.default.get("https://api.dev.futureswap.gg/prod/api/v1/terms");
        terms = data;
    }
    catch (e) {
        console.log("could not fetch terms, contact support");
        console.log(e);
        return;
    }
    console.log(terms);
    inquirer
        .prompt({
        type: "list",
        name: "action",
        message: "Select an action",
        choices: ["Agree", "Disagree"]
    })
        .then(async (answers) => {
        var option = answers.action;
        if (option === "Agree") {
            try {
                const { data } = await axios_1.default.put("https://api.dev.futureswap.gg/prod/api/v1/terms", {
                    userAddress: provider_1.wallet.address,
                    agreesToTerms: true
                });
                console.log("You agreed to the terms. ");
                checkApprove();
            }
            catch (e) {
                console.log("Failed submitting terms request");
            }
            return true;
        }
        else if (option === "Disagree") {
            const { data } = await axios_1.default.put("https://api.dev.futureswap.gg/prod/api/v1/terms", {
                userAddress: provider_1.wallet.address,
                agreesToTerms: false
            });
            console.log("You did not agree to the terms. You cannot use this product");
            return false;
        }
    });
};
const getTerms = async () => {
    let terms;
    try {
        const { data } = await axios_1.default.get("https://api.dev.futureswap.gg/prod/api/v1/terms");
        terms = data;
    }
    catch (e) {
        console.log("could not fetch terms, contact support");
        console.log(e);
        return;
    }
    console.log(terms);
};
const createTrade = async () => {
    inquirer.prompt(createTradeQuestions).then(async (answers) => {
        console.log("\nTrade info:");
        const valdationValues = await utils_1.callValidate(answers);
        console.log(`
    Valid: ${valdationValues.isValid}
    Collateral: $${utils_1.commify(valdationValues.collateralAmount)}
    Leverage: ${answers.leverage}x
    Type: ${valdationValues.isLong ? "Long" : "Short"}
    Spread: ${ethers_1.utils.formatUnits(valdationValues.spreadPercentage, 18)}%
    Asset Price: $${utils_1.commify(valdationValues.assetMarketPrice)}
    Gas Cost: $${utils_1.commify(valdationValues.gasCostValue)}
    Trade Fee: $${utils_1.commify(valdationValues.tradeFeeStable)}
    `);
        createTradeConfirmation(answers);
    });
};
const createTradeConfirmation = async (answers) => {
    inquirer
        .prompt(confirmTradeActions)
        .then(async (action) => {
        if (action.confirmTradeActions === "Confirm") {
            utils_1.handleOpenTrade(answers);
        }
        else if (action.confirmTradeActions === "Back") {
            createTrade();
        }
        else {
            console.log("You cannot go that way. Try again");
            listOfCoreActions();
        }
        var uiBottom = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] });
        const loadingUi = setInterval(() => {
            uiBottom.updateBottomBar(loader[i++ % 4]);
        }, 300);
        setTimeout(() => {
            clearInterval(loadingUi);
            uiBottom.updateBottomBar("");
            console.log("\nSuccess!\n");
            listOfCoreActions();
        }, 90000);
    });
};
const createTradeQuestions = [
    {
        type: "list",
        name: "isLong",
        message: "Long or short?",
        default: "Long",
        choices: ["Long", "Short"],
        filter: function (val) {
            if (val.toLowerCase() === "long") {
                return true;
            }
            else {
                return false;
            }
        }
    },
    {
        type: "input",
        name: "leverage",
        message: "Enter leverage amount (2-20)",
        default: 10,
        validate: (value) => {
            if (value >= 2 && value <= 20) {
                return true;
            }
            return "Please enter a valid leverage amount";
        },
        filter: Number
    },
    {
        type: "input",
        name: "collateral",
        message: "Enter collateral amount (minimum: 20)",
        default: 20,
        validate: (value) => {
            if (value >= 20) {
                return true;
            }
            return "Please enter a valid number";
        },
        filter: Number
    }
];
