const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: "ai",
    version: "1.0.0",
    description: "AI command",
    usage: "{pn} [message]",
    author: "Ber",
    cooldown: 5,
    usePrefix: false,
    role: 0
  },

  async onRun({ api, message, args, event }) {

    const { threadID, messageID } = event;

    const query = args.join(" ");

    if (!query) {
      message.reply("❌ | Please provide a query!");
    } else {
      message.reply(`🔍 | ${query}`);

      const url = 'http://eu4.diresnode.com:3763/gemini';

      const data = {
        prompt: query
      };

      try {
        const response = await axios.post(url, data, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const a = response.data.candidates[0];
        const messageText = a.text;
        const images = a.web_images;

        if (images && images.length > 0 && images[0].url) {

          const imagePath = __dirname + `/cache/gemini.jpg`;
          
          const img = (await axios.get(images[0].url, { responseType: "arraybuffer" })).data;

          fs.writeFileSync(imagePath, Buffer.from(img, 'utf-8'));  

          api.sendMessage({
            body: messageText,
            attachment: fs.createReadStream(imagePath)
          }, threadID, () => fs.unlinkSync(imagePath), messageID);
        } else {
          api.sendMessage(messageText, threadID);
        }
      } catch (error) {
        console.error("Error:", error);
        message.reply("❌ | An error occurred while processing your request.");
      }
    }
  }
};