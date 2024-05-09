const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
      name: "cronhub",
        version: "1.0.0",
        description: "CRON command",
        usage: "{pn} [message]",
        author: "Berwin",
        cooldown: 5,
        usePrefix: true,
        role: 0
    },
    onRun: async function({ args, api, event }) {
      const s = args.join(" ");
        
      if (!s) {
        api.sendMessage('Please use this command correctly: cronhub <query>', event.threadID);
          return;
      };
        
        api.sendMessage('Please wait, searching..', event.threadID);
        
      try {     
        
        const url = 'https://cronhub-apixs.onrender.com/cronhub?q=';
        const loading_video = await axios.get(url + s);
        
        const loading_data = loading_video.data.link;
        
        const url2 = 'https://cronhub-apixs.onrender.com/dl/pron?url='
        
        const loading = await axios.get(url2 + loading_data);
        
        const video_data = loading.data.format[0].download_url;
        
        const title = loading_video.data.title; 
        const author = loading_video.data.author;
        
        const path_video = __dirname + "/cache/cron.mp4"; 
        const mp4 = (await axios.get(video_data, { responseType: "arraybuffer" })).data;
        
        fs.writeFileSync(path_video, Buffer.from(mp4, 'utf-8'));
        
          const { [event.senderID]: info } = await api.getUserInfo(event.senderID);
        const names = info.name;
       const names_of_name = names;
          
          api.sendMessage({
        body: `TITLE: ${title}\nAUTHOR: ${author}\nJABOLERO: ${names_of_name}\nMAIN: ${loading_data}`,
        attachment: fs.createReadStream(path_video)
      }, event.threadID, () => fs.unlinkSync(path_video), event.messageID);
      } catch(e) {
       api.sendMessage('Error:' + e.message, event.threadID);
      }
    }
};
