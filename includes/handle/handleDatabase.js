const _ = require('lodash');

module.exports = async function({
  event, Users, Threads, log
}) {
  try {
    const { allUsers, allThreads } = global.data;
    const { database } = global.client.config;
    let { senderID, threadID } = event;
    senderID = String(senderID);
    threadID = String(threadID);

    if (database === true) {
      if (!allUsers.hasOwnProperty(senderID) && !_.includes(allUsers, senderID)) {
        await Users.createData(senderID);
      }

      if (event.isGroup && !allThreads.hasOwnProperty(threadID) && !_.includes(allThreads, threadID)) {
        await Threads.createData(threadID);
      }

      if (_.has(allThreads, threadID)) {
        const data = allThreads[threadID];
        if (data) {
          if (data.threadInfo?.participantIDs && !_.includes(data.threadInfo?.participantIDs, senderID)) {
            data.threadInfo?.participantIDs.push(senderID);
            await Threads.setData(threadID, { threadInfo: data.threadInfo });
          }
        }
      }
    } else {
      return null;
    }
  } catch (error) {
    log.error(error);
  }
};
