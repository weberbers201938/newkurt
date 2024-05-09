const axios = require('axios');

module.exports = new Object({
  config: new Object({
    name: "ai2",
    description: "ai but conversational",
    usage: "{pn} [query]",
    cooldown: 5,
    role: 0,
    usePrefix: false
  }),

  onRun: async function({
    message,
    args,
    cmdName,
    fonts,
    event,
  }) {
    const input = args.join(" ");

    if (!args) {
      message.reply("❌ | Please provide a query!");
    } else {
      const onReply = global.client.replies;
      
      const url = 'https://cronhub-apixs.onrender.com/claude?prompt=';

      const response = await axios.post(url+input);
      
      const info = await message.reply(`${response.data.reply}\n\n${fonts.sans('Reply to continue conversation!')}`);
      onReply.set(info.messageID, {
        cmdName,
        author: event.senderID,
      });
    };
  },

  onReply: async function({
    message,
    args,
    data,
    cmdName,
    fonts,
    event,
  }) {

    if (data.author === event.senderID) {
      
      const onReply = global.client.replies;
      const url = 'https://cronhub-apixs.onrender.com/claude?prompt='
      const response = await axios.post(url+event.body);

      const info = await message.reply(`${response.data.reply}\n\n${fonts.sans('Reply to continue conversation!')}`);
      onReply.set(info.messageID, {
        cmdName,
        author: event.senderID
      });
    } else {
      message.reply('why u replyin');
    };
  },
});