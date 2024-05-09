const fs = require('fs-extra');
const pathFile = __dirname + '/txt/autoacpm.txt';

module.exports = {
  config: {
    name: "autoacpm",
    version: "1.0.0",
    description: "Automatic accepting message requests",
    usage: "{pn} [on/off]",
    author: "Ber",
    cooldown: 5,
    usePrefix: false,
    role: 0
  },

 async onEvent({ api, event, args }) {
   
  let timestamp;
  const nowTime = Date.now();
  let callbackMS
  if (!fs.existsSync(pathFile))
    fs.writeFileSync(pathFile, 'false');
  const isEnable = fs.readFileSync(pathFile, 'utf-8');
  if (isEnable == 'true') {
    const list = [
        ...(await api.getThreadList(1, null, ['PENDING'])),
        ...(await api.getThreadList(1, null, ['OTHER']))
      ];
    if (list[0]) {
      api.changeNickname(`${global.config.PREFIX} | ${global.config.BOTNAME}`, list[0].threadID, api.getCurrentUserID());
      api.sendMessage("Connecting...", list[0].threadID, (err, info) => {
        timestamp = info.timestamp;
        callbackMS = Date.now();
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      const latency = timestamp - nowTime;
      const callbackTime = callbackMS - nowTime;

      await api.sendMessage(`🌟 This thread is automatically approved by our system, Enjoy!\n\n╭───❒Accepting Thread Connection:\n│─ Status: Online\n│─ Botname: ${global.config.BOTNAME}\n│─ Owner:\n│─https://facebook.com/${global.config.ADMINBOT}\n│─ Prefix: ${global.config.PREFIX}\n╰───────────𖤓\n╭───❒Checking Ping:\n│─ Latency: Input = ${latency} ms\n│─ Callback = ${callbackTime} ms\n│─ Input & Callback Difference: ${callbackTime - latency} ms\n│─ Use ${global.config.PREFIX}help to view command details\n╰───────────𖤓`, list[0].threadID);
    }
  }
},

 async onRun({ api, event, args }) {
   
  try {
    if (args[0] == 'on') {
      fs.writeFileSync(pathFile, 'true');
      api.sendMessage('The auto_accept_message_requests function is now enabled for new messages requests.', event.threadID, event.messageID);
    } else if (args[0] == 'off') {
      fs.writeFileSync(pathFile, 'false');
      api.sendMessage('The auto_accept_message_requests function has been disabled for new messages requests.', event.threadID, event.messageID);
    } else {
      api.sendMessage('Incorrect syntax', event.threadID, event.messageID);
    }
  }
  catch (e) {
    console.log(e);
  }
 }
};