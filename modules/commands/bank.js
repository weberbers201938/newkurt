const _ = require('lodash');

module.exports = {
  config: {
    name: "bank",
    role: 0,
    author: "Berwin",
    description: "Manage your bank account.",
    usePrefix: true,
    usage: "{pn} [register | bal | top | daily claim | rob <uid> | invest <money_amount> | transfer <target_user_id> <amount>]",
  },
  async onRun({ api, event, fonts, Users, args }) {
    const { threadID, senderID } = event;

    const header = `${fonts.bold('Bank')} 🏦 
━━━━━━━━━━━━━━━`;

    const subCommand = args[0];

    switch (subCommand) {
      case "register":
        return registerUser(api, event, fonts, Users);
      case "bal":
        return checkBalance(api, event, fonts, Users, threadID);
      case "top":
        return viewTopUsers(api, event, fonts, Users);
      case "daily":
        return dailyClaim(api, event, fonts, Users, threadID, senderID);
      case "rob":
        return robUser(api, event, fonts, Users, threadID, senderID, args[1]);
      case "invest":
        return investMoney(api, event, fonts, Users, threadID, senderID, args[1]);
      case "transfer":
        return transferMoney(api, event, fonts, Users, threadID, senderID, args[1], args[2]);
      default:
        return api.sendMessage(`${header}\n${fonts.sans("Invalid subcommand. Use 'register', 'bal', 'top', 'daily claim', 'rob <uid>', 'invest <money_amount>', or 'transfer <target_user_id> <amount>'.")}`, threadID);
    }
  },
};

async function registerUser(api, event, fonts, Users) {
  const { senderID, threadID } = event;

  const userExists = await Users.get(senderID);
  if (userExists && userExists.money !== undefined) {
    return api.sendMessage(`${fonts.bold('Bank')} 🏦\n${fonts.sans("You are already registered and have money.")}`, threadID);
  } else {
    await Users.createData(senderID);
    return api.sendMessage(`${fonts.bold('Bank')} 🏦\n${fonts.sans("You have been successfully registered and received 1000 coins.")}`, threadID);
  }
}

async function checkBalance(api, event, fonts, Users, threadID) {
  const header = `${fonts.bold('Balance')} 💰 
━━━━━━━━━━━━━━━`;

  // Get user information
  const user = await Users.get(event.senderID);
  if (user && user.money !== undefined) {
    const balance = user.money;
    return api.sendMessage(`${header}\n${fonts.sans(`Your current balance is ${balance} coins.`)}`, threadID);
  } else {
    return api.sendMessage(`${header}\n${fonts.sans("You are not registered. Use 'bank register' to register.")}`, threadID);
  }
}

async function viewTopUsers(api, event, fonts, Users) {
  const header = `${fonts.bold('Top Users')} 🏆 
━━━━━━━━━━━━━━━`;

  // Get all user data
  const allUsers = await Users.getAllUsers();
  if (allUsers && Object.keys(allUsers).length > 0) {
    const sortedUsers = Object.values(allUsers)
      .filter(user => user.money !== undefined)
      .sort((a, b) => b.money - a.money)
      .slice(0, 10); 

    let message = `${header}\n`;
    sortedUsers.forEach((user, index) => {
      message += `${index + 1}. ${user.name || user.userID}: ${user.money || 0} coins\n`;
    });

    return api.sendMessage(message, event.threadID);
  } else {
    
    return api.sendMessage(`${header}\n${fonts.sans("Error retrieving user data or no users with money.")}`, event.threadID);
  }
}

async function dailyClaim(api, event, fonts, Users, threadID, senderID) {
  const header = `${fonts.bold('Daily Claim')} 🎁 
━━━━━━━━━━━━━━━`;

  const user = await Users.get(senderID);
  if (!user) {
    return api.sendMessage(`${header}\n${fonts.sans("You are not registered. Use 'bank register' to register.")}`, threadID);
  }

  
  const lastClaimTime = user.lastClaimTime || 0;
  const currentTime = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; 

  if (currentTime - lastClaimTime < oneDay) {
    return api.sendMessage(`${header}\n${fonts.sans("You have already claimed your daily reward. Please come back later.")}`, threadID);
  }

  
  const updatedMoney = user.money + 500;
  const success = await Users.setData(senderID, 'money', updatedMoney);
  if (success) {
    
    await Users.setData(senderID, 'lastClaimTime', currentTime);
    return api.sendMessage(`${header}\n${fonts.sans("Congratulations! You have claimed your daily reward of 500 coins.")}`, threadID);
  } else {
    return api.sendMessage(`${header}\n${fonts.sans("Failed to claim daily reward. Please try again later.")}`, threadID);
  }
}

async function robUser(api, event, fonts, Users, threadID, senderID, targetID) {
  const header = `${fonts.bold('Rob')} 🚨 
━━━━━━━━━━━━━━━`;

  if (!targetID || isNaN(targetID)) {
    return api.sendMessage(`${header}\n${fonts.sans("Invalid target user ID. Please provide a valid user ID to rob.")}`, threadID);
  }

  const user = await Users.get(senderID);
  const targetUser = await Users.get(targetID);
  
  if (!user || !targetUser) {
    return api.sendMessage(`${header}\n${fonts.sans("Invalid user or target user. Please make sure both users are registered.")}`, threadID);
  }
  const lastRobTime = user.lastRobTime || 0;
  const currentTime = Date.now();
  const oneHour = 60 * 60 * 1000; 

  if (currentTime - lastRobTime < oneHour) {
    return api.sendMessage(`${header}\n${fonts.sans("You can only rob once an hour. Please try again later.")}`, threadID);
  }
  const successChance = Math.random() < 0.2;

  if (successChance) {
    
    const stolenAmount = Math.floor(targetUser.money / 2);
    const updatedSenderMoney = user.money + stolenAmount;
    const updatedTargetMoney = targetUser.money - stolenAmount;

    await Users.setData(senderID, 'money', updatedSenderMoney);
    await Users.setData(targetID, 'money', updatedTargetMoney);
    await Users.setData(senderID, 'lastRobTime', currentTime);

    return api.sendMessage(`${header}\n${fonts.sans(`You have successfully stolen ${stolenAmount} coins from the target user!`)}`, threadID);
  } else {
    // Failure
    await Users.setData(senderID, 'lastRobTime', currentTime);
    return api.sendMessage(`${header}\n${fonts.sans("Your robbery attempt failed. Better luck next time!")}`, threadID);
  }
}

async function investMoney(api, event, fonts, Users, threadID, senderID, amount) {
  const header = `${fonts.bold('Invest')} 📈 
━━━━━━━━━━━━━━━`;

  amount = parseInt(amount);
  if (!amount || isNaN(amount) || amount <= 0 || amount > 500) {
    return api.sendMessage(`${header}\n${fonts.sans("Invalid amount. Please enter an amount between 1 and 500 coins.")}`, threadID);
  }

  const user = await Users.get(senderID);
  if (!user || user.money < amount) {
    return api.sendMessage(`${header}\n${fonts.sans("You don't have enough money to invest.")}`, threadID);
  }

  const updatedMoney = user.money - amount;
  const returnAmount = amount * 2; 
  const currentTime = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  setTimeout(async () => {
    const success = await Users.setData(senderID, 'money', user.money + returnAmount);
    if (success) {
      return api.sendMessage(`${header}\n${fonts.sans(`Your investment of ${amount} coins has doubled! You received ${returnAmount} coins.`)}`, threadID);
    } else {
      return api.sendMessage(`${header}\n${fonts.sans("Failed to return investment. Please try again later.")}`, threadID);
    }
  }, oneWeek);
  const success = await Users.setData(senderID, 'money', updatedMoney);
  if (success) {
    return api.sendMessage(`${header}\n${fonts.sans(`Your investment of ${amount} coins has been successful. You will receive ${returnAmount} coins after one week.`)}`, threadID);
  } else {
    return api.sendMessage(`${header}\n${fonts.sans("Failed to invest. Please try again later.")}`, threadID);
  }
}

async function transferMoney(api, event, fonts, Users, threadID, senderID, targetID, amount) {
  const header = `${fonts.bold('Transfer')} 💸 
━━━━━━━━━━━━━━━`;

  if (!targetID || isNaN(targetID)) {
    return api.sendMessage(`${header}\n${fonts.sans("Invalid target user ID. Please provide a valid user ID to transfer money.")}`, threadID);
  }

  amount = parseInt(amount);
  if (!amount || isNaN(amount) || amount <= 0) {
    return api.sendMessage(`${header}\n${fonts.sans("Invalid amount. Please enter a positive number as the amount to transfer.")}`, threadID);
  }

  const user = await Users.get(senderID);
  const targetUser = await Users.get(targetID);
  
  if (!user || !targetUser) {
    return api.sendMessage(`${header}\n${fonts.sans("Invalid user or target user. Please make sure both users are registered.")}`, threadID);
  }

  if (user.money < amount) {
    return api.sendMessage(`${header}\n${fonts.sans("Insufficient funds.")}`, threadID);
  }

  const updatedSenderMoney = user.money - amount;
  const updatedTargetMoney = targetUser.money + amount;

  const successSender = await Users.setData(senderID, 'money', updatedSenderMoney);
  const successTarget = await Users.setData(targetID, 'money', updatedTargetMoney);

  if (successSender && successTarget) {
    return api.sendMessage(`${header}\n${fonts.sans(`Successfully transferred ${amount} coins to ${targetID}.`)}`, threadID);
  } else {
    return api.sendMessage(`${header}\n${fonts.sans("Failed to transfer money. Please try again later.")}`, threadID);
  }
}