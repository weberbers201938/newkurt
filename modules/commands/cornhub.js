const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
      name: "cornhub",
        version: "1.0.0",
        description: "CORN command",
        usage: "{pn} [message]",
        author: "Berwin",
        cooldown: 5,
        usePrefix: true,
        role: 0
    },
    onRun: async function({ args, api, event }) {
      const s = args.join(" ");
        
      if (!s) {
        api.sendMessage('Please use this command correctly: cornhub <query>', event.threadID);
          return;
      };
        
                api.sendMessage('Please wait, searching..', event.threadID);
        
      try {     
        const url = 'https://cornhub-api.onrender.com/corn?search=';
        const video = await axios.get(url + s);
        const video_data = video.data.url;
        
        const path_video = __dirname + "/cache/corn.mp4"; 
        const mp4 = (await axios.get(video_data, { responseType: "arraybuffer" })).data;
        
        fs.writeFileSync(path_video, Buffer.from(mp4, 'utf-8'));
        
          const { [event.senderID]: info } = await api.getUserInfo(event.senderID);
        const names = info.name;
       const names_of_name = names;
          
          api.sendMessage({
        body: "Results of: "+s+"\n Jabol nanamn si "+names_of_name+" pag patuloy mo yan!",
        attachment: fs.createReadStream(path_video)
      }, event.threadID, () => fs.unlinkSync(path_video), event.messageID);
      } catch(e) {
       api.sendMessage('Error:' + e.message, event.threadID);
      }
    }
};