const _ = require('lodash');

function getRandomEmoji(emojis) {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

module.exports = {
  config: {
    name: "slot",
    description: "🎰 Play the enchanted slot machine! 🌟",
    usage: "{prefix}slot <bet>",
    cooldown: 5, // Set cooldown time in seconds
    role: 0 // Set role requirement if necessary
  },
  async onRun({ api, event, args, Users }) {
    const { threadID, senderID } = event;
    const bet = parseInt(args[0]);

    // Check if bet is a valid number
    if (isNaN(bet) || bet <= 0) {
      return api.sendMessage("🚫 Please enter a valid bet amount. 🚫", threadID);
    }

    // Get user's data from the database
    const userData = await Users.get(senderID);

    // Check if the user has enough money
    if (!userData || userData.money < bet) {
      return api.sendMessage("⚠️ You don't have enough enchanted coins to place this bet. ⚠️", threadID);
    }

    // Define emojis for the enchanted slot machine
    const emojis = ['🔮', '🌟', '🦄', '🍄', '🔥', '💎'];

    // Generate random results for each slot
    const slot1 = getRandomEmoji(emojis);
    const slot2 = getRandomEmoji(emojis);
    const slot3 = getRandomEmoji(emojis);

    // Display the enchanted slot machine
    const slotMachine = `
🌌✨🌟 Fantasy Enchantment 🌟✨🌌
 ${slot1} | ${slot2} | ${slot3}
    `;

    // Determine the result
    let result;
    if (slot1 === slot2 && slot2 === slot3 || _.random(0, 1)) {
      result = "🎉 Congratulations! You're enchanted with riches! 🎉";
      // Double the bet and add it to the user's money
      await Users.addMoney(senderID, bet);
    } else {
      result = "😔 Alas! The enchantment didn't favor you this time. 😔";
      // Subtract the bet from the user's money
      await Users.subtractMoney(senderID, bet);
    }

    // Send the enchanted slot machine display and result
    api.sendMessage(`🔮✨🌟 Fantasy Enchantment 🌟✨🔮\n\n${slotMachine}\n\nResult: ${result}`, threadID);
  }
};
