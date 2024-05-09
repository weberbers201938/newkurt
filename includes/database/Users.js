const fs = require('fs-extra');
const path = require('path');
const log = require('../log');
const _ = require('lodash');

module.exports = function({ api }) {
  const usersDataPath = path.join(__dirname, 'json', 'usersData.json');
  let usersData;

  try {
    usersData = fs.readJSONSync(usersDataPath);
  } catch (error) {
    log.error(error);
    usersData = {};
  }

  async function getInfo(uid) {
    try {
      const userInfo = await api.getUserInfo(uid);
      return userInfo[uid];
    } catch (error) {
      log.error(error);
      return null;
    }
  }

  async function createData(uid) {
    try {
      const userInfo = await getInfo(uid);
      if (!userInfo) {
        throw new Error("User info not found.");
      }

      const data = {
        [uid]: {
          userID: uid,
          name: userInfo.name || '',
          vanity: userInfo.vanity || '',
          gender: userInfo.gender || 0,
          money: 1000,
          createTime: { timestamp: Date.now() },
          lastUpdate: Date.now()
        }
      };

      _.merge(usersData, data);
      fs.writeJSONSync(usersDataPath, usersData, { spaces: 2 });
    } catch (error) {
      log.error(error);
    }
  }

  function getAllUsers() {
    return usersData;
  }

  function get(uid) {
    return _.get(usersData, uid, null);
  }

  function deleteData(uid) {
    if (_.has(usersData, uid)) {
      delete usersData[uid];
      fs.writeJSONSync(usersDataPath, usersData, { spaces: 2 });
      return true;
    } else {
      return false;
    }
  }

  function setData(uid, dataKey, value) {
    if (_.has(usersData, uid)) {
      _.set(usersData[uid], dataKey, value);
      fs.writeJSONSync(usersDataPath, usersData, { spaces: 2 });
      return true;
    } else {
      return false;
    }
  }

  function subtractMoney(uid, amount) {
    if (_.has(usersData, uid)) {
      const userData = usersData[uid];
      if (userData.money >= amount) {
        userData.money -= amount;
        fs.writeJSONSync(usersDataPath, usersData, { spaces: 2 });
        return true;
      } else {
        return false; // Insufficient funds
      }
    } else {
      return false; // User not found
    }
  }

  function addMoney(uid, amount) {
    if (_.has(usersData, uid)) {
      usersData[uid].money += amount;
      fs.writeJSONSync(usersDataPath, usersData, { spaces: 2 });
      return true;
    } else {
      return false; // User not found
    }
  }

  return {
    createData: createData,
    getAllUsers: getAllUsers,
    getInfo: getInfo,
    deleteData: deleteData,
    setData: setData,
    get: get,
    subtractMoney: subtractMoney,
    addMoney: addMoney // Adding the addMoney function to the returned object
  };
};
