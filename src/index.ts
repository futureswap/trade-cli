const inquirer = require("inquirer");
import * as _ from "lodash";
import axios from "axios";
import {
  getStableTokenBalance,
  callValidate,
  increaseStableTokenApproveBalance,
  isStableTokenApproved,
  getOpenTrades,
  commify,
  getClosedTrades,
  getWalletTokenBalance,
  fsWalletDespoit,
  handleOpenTrade,
  handleCloseTrade,
  handleAddCollateral,
  handleInstantWithdrawal,
  getExchangeData,
  fromWei,
  toWei
} from "./utils";
import { utils } from "ethers";
import { wallet } from "./provider";
import moment from "moment";

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
    "Refresh"
  ]
};

const confirmTradeActions = {
  type: "list",
  name: "confirmTradeActions",
  message: "Select an action",
  choices: ["Confirm", "Back"]
};

const main = async () => {
  const stableBalance = await getStableTokenBalance();
  const stableInFsWalletBalance = await getWalletTokenBalance();

  console.log(`
Hello ${wallet.address}
Welcome to the Trade CLI
  `);

  console.log(`USDC balances: 
  wallet: ${utils.commify(utils.formatUnits(stableBalance, 6))}
  fs-wallet: ${utils.commify(utils.formatUnits(stableInFsWalletBalance, 6))}
  `); //go to the frontend for this data

  const assetPrice = await getExchangeData();
  console.log(`Current ETH Price: $${commify(String(assetPrice))}\n`);

  checkApprove();
};
main();

const checkApprove = async () => {
  const isApproved = await isStableTokenApproved();

  if (isApproved) {
    listOfCoreActions();
  } else {
    //run approve then run main
    console.log(
      `You'll need to approve the margin account before you can start...`
    );
    console.log(`Make sure you have some ETH to run the tx`);
    console.log(`Attempting to run approve tx...`);
    await increaseStableTokenApproveBalance();

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
    .then(async (answers: { coreAction: string }) => {
      if (answers.coreAction === "Show opened trades") {
        openTradesOptions();
      } else if (answers.coreAction === "Show closed trades") {
        closedTradesOptions();
      } else if (answers.coreAction === "Open trade") {
        createTrade();
      } else if (answers.coreAction === "Withdraw") {
        withdrawMenu();
      } else if (answers.coreAction === "Deposit") {
        depositMenu();
      } else if (answers.coreAction === "Refresh") {
        main();
      } else {
        console.log("You cannot go that way. Try again");
        listOfCoreActions();
      }
    });
};

const openTradesOptions = async () => {
  const openTrades = await getOpenTrades();

  const trades = openTrades.map((trade: any) => trade.tradeId);
  console.log(`Number of trades open: ${trades.length}`);

  const openTradesPrompt = {
    type: "list",
    name: "selectOpenTrades",
    message: "Select a trade id",
    choices: [...trades, "Batch close trades", "Back"]
  };

  inquirer
    .prompt(openTradesPrompt)
    .then(async (answers: { selectOpenTrades: any }) => {
      var option = answers.selectOpenTrades;

      if (option !== "Back" && option !== "Batch close trades") {
        const tradeLocation = _.findIndex(openTrades, function (trade: any) {
          return String(trade.tradeId) == String(option);
        });

        const {
          type,
          tradeId,
          leverage,
          assetTokenBorrowed,
          tradeValue,
          openPrice,
          liquidationPrice,
          collateral,
          profitLoss,
          openTime,
          tradeFee,
          fundingRateFee,
          timeFee,
          totalReturn,
          state,
          creationTime
        } = openTrades[tradeLocation];

        console.log(`
Id: ${tradeId}
Type: ${type}
Value: $${commify(tradeValue)}
Collateral: $${commify(collateral)}
Leverage: ${Number(fromWei(leverage)).toFixed(2)}
Open Price: $${commify(openPrice)}
Created on: ${moment.unix(creationTime).format()}
Liquidation Price: $${commify(liquidationPrice)}
P&L: $${commify(profitLoss.value)}    
`);

        openTradeActions(openTrades[tradeLocation]);
      } else if (option == "Batch close trades") {
        trades;
        console.log(`
        Closing trades... 
                `);

        let tradeArrayReduced = openTrades.slice(0, 50);
        tradeArrayReduced.map((trade: any) => {
          handleCloseTrade(trade);
        });
      } else {
        listOfCoreActions();
      }
    });
};

const closedTradesOptions = async () => {
  const closedTrades = await getClosedTrades();

  const trades = closedTrades.map((trade: { tradeId: any }) => trade.tradeId);

  console.log(`Number of trades closed: ${trades.length}`);

  const closedTradesPrompt = {
    type: "list",
    name: "selectClosedTrades",
    message: "Select a trade id",
    choices: [...trades, "Back"]
  };

  inquirer
    .prompt(closedTradesPrompt)
    .then(async (answers: { selectClosedTrades: any }) => {
      var option = answers.selectClosedTrades;

      if (option !== "Back") {
        if (option !== "Back") {
          const tradeLocation = _.findIndex(closedTrades, function (
            trade: any
          ) {
            return String(trade.tradeId) == String(option);
          });

          console.log(closedTrades[tradeLocation]);

          const {
            type,
            tradeId,
            leverage,
            tradeValue,
            openPrice,
            isLiquidated,
            collateral,
            profitLoss,
            creationTime,
            tradeFee,
            fundingRateFee,
            timeFee,
            totalReturn,
            state
          } = closedTrades[tradeLocation];

          console.log(`
  Id: ${tradeId}
  Type: ${type}
  Value: $${commify(tradeValue)}
  Collateral: $${commify(collateral)}
  Leverage: ${leverage}
  Open Price: $${commify(openPrice)}
  Created on: ${moment.unix(creationTime).format()}
   P&L: $${commify(profitLoss.value)}    
  Total return: $${commify(totalReturn)}
           `);
        }
        closedTradesOptions();
      } else {
        listOfCoreActions();
      }
    });
};

const openTradeActions = (trade: any) => {
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "Select an action",
      choices: ["Close trade", "Increase collateral", "Back"]
    })
    .then(async (answers: { action: any }) => {
      var option = answers.action;

      if (option === "Close trade") {
        console.log(`
Closing trade... 
        `);

        handleCloseTrade(trade);

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
      } else if (option === "Increase collateral") {
        addCollateralAction(trade);
      } else {
        openTradesOptions();
      }
    });
};

const withdrawMenu = async () => {
  const stableInFsWalletBalance = await getWalletTokenBalance();
  const formattedAmount = utils.formatUnits(stableInFsWalletBalance, 6);
  console.log(`Margin account balance: ${utils.commify(formattedAmount)}`);

  const questions = [
    {
      type: "input",
      name: "amountToWithdraw",
      message: "Withdraw amount:",
      validate: (value: number) => {
        if (value > 0 && value <= Number(formattedAmount)) {
          return true;
        }
        return "Please enter a valid amount";
      },
      filter: Number
    }
  ];

  inquirer.prompt(questions).then(async (answers: any) => {
    console.log(`Withdrawing ${answers.amountToWithdraw} USDC`);

    handleInstantWithdrawal(answers.amountToWithdraw);

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

const addCollateralAction = async (trade: { tradeId: any }) => {
  const questions = [
    {
      type: "input",
      name: "collateralToAdd",
      message: "Amount to add:",
      filter: Number
    }
  ];

  inquirer.prompt(questions).then(async (answers: any) => {
    console.log(`Adding ${answers.collateralToAdd} USDC to position`);

    await handleAddCollateral(trade.tradeId, answers.collateralToAdd);

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
  const stableBalance = await getStableTokenBalance();
  const formattedAmount = utils.formatUnits(stableBalance, 6);
  console.log(`Wallet balance: ${utils.commify(formattedAmount)}`);

  const questions = [
    {
      type: "input",
      name: "amountToDesposit",
      message: "Deposit amount:",
      validate: (value: number) => {
        if (value > 0 && value <= Number(formattedAmount)) {
          return true;
        }
        return "Please enter a valid amount";
      },
      filter: Number
    }
  ];

  inquirer.prompt(questions).then(async (answers: any) => {
    console.log(`Depositing ${answers.amountToDesposit} USDC`);

    fsWalletDespoit(answers.amountToDesposit);

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

const createTrade = async () => {
  inquirer.prompt(createTradeQuestions).then(async (answers: any) => {
    console.log("\nTrade info:");

    const valdationValues = await callValidate(answers);
    console.log(`
    Valid: ${valdationValues.isValid}
    Collateral: $${commify(valdationValues.collateralAmount)}
    Leverage: ${answers.leverage}x
    Type: ${valdationValues.isLong ? "Long" : "Short"}
    Spread: ${utils.formatUnits(valdationValues.spreadPercentage, 18)}%
    Asset Price: $${commify(valdationValues.assetMarketPrice)}
    Gas Cost: $${commify(valdationValues.gasCostValue)}
    Trade Fee: $${commify(valdationValues.tradeFeeStable)}
    `);

    createTradeConfirmation(answers);
  });
};

const createTradeConfirmation = async (answers: any) => {
  inquirer
    .prompt(confirmTradeActions)
    .then(async (action: { confirmTradeActions: string }) => {
      if (action.confirmTradeActions === "Confirm") {
        handleOpenTrade(answers);
      } else if (action.confirmTradeActions === "Back") {
        createTrade();
      } else {
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
    filter: function (val: string) {
      if (val.toLowerCase() === "long") {
        return true;
      } else {
        return false;
      }
    }
  },
  {
    type: "input",
    name: "leverage",
    message: "Enter leverage amount (2-20)",
    default: 10,
    validate: (value: number) => {
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
    validate: (value: number) => {
      if (value >= 20) {
        return true;
      }
      return "Please enter a valid number";
    },
    filter: Number
  }
];
