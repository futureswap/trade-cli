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
            // main();
            const tradesToClose = [
                "0x11baab60c67e6bc0f8c96deb817aa4272ec7f3438f9d26a94592e240fbd72c01",
                "0x18261be45f6a8f7695698a54c0271fba1544ad8d9f97e8c4e299f95c9ecf1001",
                "0x1a56866a8124f2445a74930615555215709525500d4dd1d1f4c22f19df84cb01",
                "0x1b319c67793e06e344dabc7a8c6a1aa17c5a69ab731563799d46dcab08878801",
                "0x1c7e39702b2b0f21761f9e9950e522c48094914bab3a7def1dadddc17488c101",
                "0x1e183f6b1e25f0d40de89c02cdfce10f2322c047a718affbbca1da19d3627501",
                "0x22d9a5709a344e5e56367481d843e51c643c67127198b599497d5cd631017801",
                "0x25f6acc8d42e1003094215fd0598380615480ed803f1b76ee7a060e5df2eb801",
                "0x2d2ca0cef652c4fcbe1a89421340993209580e9d581c02a1496df95cacab3a01",
                "0x2dc3a6212b4b8efeaece01d9f3812b078fb0218c978335047d6eca78e9ea7a01",
                "0x2f81e123343d270962d2224821d1120d403367229e082d74a55fb6c763263e01",
                "0x3526065e4951aa2ac1511df6b445d16fd69a2e33e6123eb0f850df7e70875001",
                "0x35fd9c4e849869ae1b2d7aa69265f0ba80745211dcbd99bb46abaa4f1561ca01",
                "0x36d31971fbd981e23d85d2722db5ce080c4e93c5e4f7d130c20922f962484601",
                "0x37a4e457f4419f9e708330f64141a3edbfd80d010987beed3cf1385480b78b01",
                "0x387424f899d5012199e7353b8830ce0e67d69175621b604cd608144ae7571001",
                "0x38a4863d70817220560e69ba94d566993a47986f78cab4d1e89ca85709bd4b01",
                "0x39942729d7a5cb840b4815c871a3b1690d18859aac23730cc738f701018aa301",
                "0x3b6c9ae870ae9631a2d421b13be6c74dd39c81bd6b1d1348b0a5bf4c6b9efa01",
                "0x3bff9140ffc880c92869944df598c02ad878537d2d5bd0826ea672900d16f601",
                "0x4011993b81f7f336c36316a7a720ab44aa6c2478f7be62931ca106a82ae40201",
                "0x438347adf67e442943267594b720537f8df38b440be5a709eafc193c8acaac01",
                "0x495afe245d2e71c50736b0f5dd939553a0b5c069283a0cddaf602319d2ba3101",
                "0x4d57d51cffcad69d9951bd1ea6e8770b24fa6ad8974d34bd9931444a50e40201",
                "0x4debea769ac5917a645180e8d29b5f55e2787192cc5605379b7367a97602e701",
                "0x4ecd269aa670eb2119d0f84978ff9e1892afb1992ccdadfbb1e29fa86f2ea401",
                "0x53c41db56906a94f3457fc558964b730a527cc83baf5b7e786226ba219a28801",
                "0x5e339aac8e07c68702d8d94fe9fa1d21c61beb006f27347aa5c3acf60487bb01",
                "0x5e52747df07934fbc1e559be2948f2b50f30ec0f503b94fda698b25b39522b01",
                "0x5f7d7d7c54d840eba2aabf6f8ded5e8b88e01fbaf6117a8f67e7840b70370401",
                "0x61bfbabdc6f93874a9d4fdbb7a2204d9b3e5b4145519a9b20570e471ea1b5201",
                "0x63de36a869ffe357beaec241ca1558169f5c4d81120b43da1fe26e6444465c01",
                "0x64d68b84cdab7e21cb22c34a54d6a622d45cb673e532e5954b58af27c4b1b701",
                "0x6c8f01f956781f89acafa0f8b53c8a4ccd9fa583c8361dd595717598da2ab901",
                "0x6dc4f4252b12b353fc73528fdbb9968b726d289f372db8603f44a7976946b201",
                "0x6e6441942b476957cbaf0d0731d81ddf5a09bde6deab8a7c2e759f730173f101",
                "0x711ef512b63d1b3f1f5d6a3840262bd4fe4fbe67d02d0e52a6f99a589b00aa01",
                "0x72519f0a0f7f8bbcbf662a8d9fb474de2e704e2513df96d59deab5e46f910f01",
                "0x72f1d4812b43d24a86c6500c4d90fa9f821a88cee3799ddb7f7f8101559a01",
                "0x734304739ef303eef8f68027d504548884a67c75a3c47aa351178af266e6b501",
                "0x74f811500d4d6f763d0b2d9774e597f868659642fc2d56ec96976512d041e001",
                "0x7629eb7b15a550630019c4636d26b9a666f85880e21c17fc3acf39ee1a573a01",
                "0x78b62372c0b0b35bb81a472b4598a7eb02da85f402b4485e78ce5299f0c41701",
                "0x791e146ee982f7ca788f1a23dec838812a2e21ecda24b95e80f9577bd6749e01",
                "0x7c4f2574d6ed045abf19d0cab19ddc35898a5b22638c24783cf6ae66b4076501",
                "0x7fbe3ca0521df41dfb4a2a41c9117dd5b0ee0a589e582972f502532bc96cb801",
                "0x810937afec39915120be36dae361cf5f6bd1d8d3f64c9229673e0c255d2c5d01",
                "0x82f77d3a24423c102fae37970f0c0684f809d45e0a120f6ba6c50a578215e401",
                "0x843a9e07bc1ed80eb671af26b558ee971475869ac82b202bde0f9e241d5cb401",
                "0x877bc7d2b084a1fd6ad796b758544eac8c8814b4086053ea1c65b09d76b2e901",
                "0x89250b5e50deb1c0719f8c13a6e2ae34d3064ad96803433e7a9568ca1719701",
                "0x8a2fef06c9c200c07db718d9af455fcbc62568b79458e377bb53be78cb55f901",
                "0x8bf7aa737bf40ca3270a5d1a62cf8a67e2418d05d6c41e95a4e58e96911e1501",
                "0x8d0afb447a1587c0c7080eef2845fa2f6a69f70de729fe18baf40c15a1300b01",
                "0x9069f60ee506597a9f979117bb16d82a8d02ff7dea9312968f3be17181fe2301",
                "0x92807ac6b7677858b0eeac8b18a3afb6c0ba3269497c0e5c7ec7b0daab1cb201",
                "0x93770d10275bec66337605278985db4539b8a2af836d769e4fad40ebd9174901",
                "0x9660b42cc3c3b93b55115ec191488b2b34409d6358c633105f6e78f0b950c01",
                "0x9718e38e969ea9cb0778b5f40c702b56e2e6ddd2274d147e2abae90601619901",
                "0xa05fb3870b536c1a9b20967026760d78273ed6e67fb25ecf3ecc55c3fdcc2d01",
                "0xa0cf76ff8282aa883e31db0df17dc72c5f5e277ed04dae87c90ee0bed1b72a01",
                "0xa36d6b116d107a8aa90e1228b3388cf6e50d823a2a0b4a111eaa8e1a62b1f001",
                "0xa3e0bd4a4b4b022948c0f27cb4109d67057d840e50948b52fce65042b0b3b901",
                "0xa58d22da810a55e0fa31dabcd73a60907dfe7b8e25f45b019fa188fbfa123201",
                "0xa5afe5cb6e59bab7a95101ae1522a32cc51fbf11aa313c83455ed4974cff3c01",
                "0xa82853907a4e1ce891521b38107ee0d4f5be50c4f98c78ddc258a1b401f66301",
                "0xa9fba6dd2176ecde81de06ea224cc9f93864da3d1e7e559009ed5195d45ddd01",
                "0xaba3f598bca25a39fa826daadb33a012738d1545801338619ae28884c79c0101",
                "0xac317d1659d1a8dd452b20d87a82ceca9aaa74dd101b09894813255689c76501",
                "0xaea20ee011afa1949677040e0513b1760640c01c1863b25fe0832b641c2ecd01",
                "0xafc1fe3b8f3815e6fe718a61a46192f0d5f62b205d13e365530cef753161d201",
                "0xb1492ea35366c8d1240ed545c95a02600aa27392949e7aac2be95a8a25fb8001",
                "0xb1de1d14f8d66ddb1bef187af24c1439d643129354537e30387bd7392d1bb101",
                "0xb3ac0a0e951a4ccb80f0a1eac37b0929e5e3048cfeb8ab949bb0ed1f51410b01",
                "0xb82b644f3857868509ab4caaeb7566bc79f065b40f5de23b7a9271cbcbf93801",
                "0xba19221a4599c35275a08c8f7d64ef64f96ad489d86c9fdaa6cae42841c8a301",
                "0xbca088d3aaca70623a64eb50f6aba6f2c464a56f85ec0de64dcf0ba621ab0d01",
                "0xbda20b5efc24e42346ea63e3d1895885038486e6799f6b1dab9f8ad3b6d49001",
                "0xbe9a7aafee72327de99f3a3b4a17b33b85f47a708ef43a63bdb9dbdf67e78d01",
                "0xc0a096b57a5346f958ec04f87adb9c5a87c185a49c9640f00966bda30398e901",
                "0xcad106bda98d688a3ab3a9f48a7d234e66d39f396d9bbeecf31ac88b5a6b8b01",
                "0xcbf492dca12e2156f6b759b06ccf82c7b34ab761b6349d1f47304d066f923201",
                "0xcdbb9c2c8b74d0b9e4170617b201f6065dad39edea09b8bc64ef19a38863cb01",
                "0xd21ed82ccf9556c16ac75ba3a6db79e90037b4d3bfd074841db82ba1da793201",
                "0xd3bc1677e6dbff38635b3587e8406cfd2fc905f3b11399582a2b9a5d0d847b01",
                "0xd784a02575dfa2b2008b4660a7e612e72ed0f721e65ee336bac5f09fb485801",
                "0xd844c1245ad13cdd77dc4bfe49fed2505787aabf9dd46027326f3b681fb52d01",
                "0xd8be183051d3679d4eefda5555d9042579cfff510dc06a34bd70acce38d00301",
                "0xdaa0d062e7f18e3829515e98bd7cf912d7dcd736416b4655b266bad2cd46a101",
                "0xdb511a85a4d90f4e56573ff19e54904cce38c71b569acf6811654f49856e8001",
                "0xdd2228bbe30108af40778aae1e4747525cc4797c12179ba60a9fa10dc03fbd01",
                "0xdfc8e29bdedaa58c80a18b30802408e3dbadd0091c04be4650c475b7a362cc01",
                "0xe65ee77467ad8777d121dc425da9337af19f924f1762a58e77ab2cfd593c8401",
                "0xe8ae65007c3d75c2e221c896d2475b51cd5187a6122d80880b0503279befd301",
                "0xe8ebcc48b6d7d70e4d752cb03d55aa62272887ffc3922e482d6bc6a5f4e36801",
                "0xea64d5c1765771a017407cfec146d695cda441aa013f6de678019c1a84b1cd01",
                "0xed58e9d8d5518293998a5b3c7f7cbf12a756e2d97579fe567d85ee7cdc346601",
                "0xf4ad5a264695732237818e16faf5466f86bfcae6d9bb46117f7a2b7536045801",
                "0xf4b0e88eae4b1f8f0e44bef790ad9af7b9ebc9139bdfb6bb9b6bf4450811fd01",
                "0xfa714b973c652ec54afd0d48a6e109accb7d991cba1b2f6bb92c15f7fe817801"
            ];
            // let transaction = await tradesToClose.map(async id => {
            // });
            // await Promise.all(transaction);
            for (var j = 0; j < tradesToClose.length; j++) {
                await utils_1.closeDisableTrade(tradesToClose[j]);
            }
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
