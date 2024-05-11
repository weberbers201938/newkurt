'use strict';

// Require necessary modules
var utils = require("../utils");
var log = require("npmlog");

// Export a function that takes three parameters
module.exports = function (message, contactId, threadId) {
  return async function sendTask(message, contactId, threadId) {
    // Define empty functions
    var resolvePromise = function () {};
    var rejectPromise = function () {};

    // Create a promise and assign resolve and reject functions
    var promise = new Promise(function (resolve, reject) {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    // If no callback function is provided, assign a default one
    if (!threadId) {
      threadId = function (error, result) {
        if (error) {
          return rejectPromise(error);
        }
        resolvePromise(result);
        result;
      };
    }

    let requestId = 0;
    // Construct a JSON payload
    var payload = JSON.stringify({
      'app_id': "2220391788200892",
      'payload': JSON.stringify({
        'tasks': [{
          'label': "359",
          'payload': JSON.stringify({
            'contact_id': contactId,
            'sync_group': 0x1,
            'text': message || '',
            'thread_id': threadId
          }),
          'queue_name': 'messenger_contact_sharing',
          'task_id': Math.random() * 0x3e9 << 0x0,
          'failure_count': null
        }],
        'epoch_id': utils.generateOfflineThreadingID(),
        'version_id': "7214102258676893"
      }),
      'request_id': ++requestId,
      'type': 0x3
    });

    // Publish the payload to a MQTT topic
    global.mqttClient.publish("/ls_req", payload);

    // Return the promise
    return promise;
  };
};
