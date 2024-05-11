const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const figlet = require('figlet');
const chalk = require('chalk');
const login = require('./includes/login');
const log = require('./includes/log');
const { createLogger, transports, format } = require('winston');

// Initialize Express app
const app = express();
const port = process.env.PORT || 6049;
process.on("unhandledRejection", (error) => console.log(error));
process.on("uncaughtException", (error) => console.log(error));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error(`Express Error: ${error}`);
  res.status(500).send('Internal Server Error');
});


// Define root route to serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'web.html'));
});


// Initialize Winston logger
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});


// Load configuration
const config = loadConfig("config.json");
// Initialize bot object
global.client = {
  config: config,
  botPrefix: config.botPrefix,
  botAdmins: config.botAdmins,
  commands: new Map(),
  events: new Map(),
  replies: new Map(),
  cooldowns: new Map(),
  reactions: {}
};
// Start the application

start();

// Load configuration data
function loadConfig(a) {
  try {
    return fs.readJSONSync(path.join(__dirname, 'json', a));
  } catch (error) {
    logger.error(`Config Load Error: ${error}`);
    return {};
  }
}

// Start function
async function start() {
  // Read initial app state data
  const appState = fs.readJSONSync(path.join(__dirname, 'json', 'cookies.json'));
  const utils = require('./utils');
  global.utils = utils;

  // Generate ASCII art for startup message
  figlet.text('BOTFILE', (err, data) => {
    if (err) return log.error(err);
    
    // Load utility functions
    utils.loadAll();

    // Display startup message
    console.log(chalk.cyan(data));
    console.log(chalk.blue(`› Bot Name: ${config.botName}`));
    console.log(chalk.blue(`› Bot Owner: ${config.botOwner}`));
    console.log(chalk.blue(`› Time: ${new Date().toLocaleString()}`));
    console.log(chalk.blue(`› Bot is running on port: ${port}`));
    console.log();

    // Start Express server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Start bot login process
    login({ appState }, (err, api) => {
      if (err) return log.error(err);

      // Set bot options
      api.setOptions(config.fcaOptions);
  api.sendMessage('🟢 Im Alive!, Hello World!', global.client.botAdmins);
      // Listen for events
      api.listenMqtt(async (err, event) => {
        if (err) return log.error(err);
        const listen = require('./includes/listen');
        listen({ api, event });
          
      });
    });
  });

  // Define a rainbow color array
  const rainbowColors = [chalk.red, chalk.yellow, chalk.green, chalk.blue, chalk.magenta, chalk.cyan];

  // Define a loading message
  const loadingMessage = 'Loading';

  // Function to display loading animation
  function showLoadingAnimation() {
    let index = 0;
    setInterval(() => {
      const color = rainbowColors[index % rainbowColors.length];
      process.stdout.clearLine();  // Clear the previous line
      process.stdout.cursorTo(0); // Move the cursor to the beginning of the line
      process.stdout.write(color(`${loadingMessage}...`)); // Write the loading message
      index++;
    }, 200); // Adjust speed as needed
  }

  // Call the function to start the loading animation
  showLoadingAnimation();
};
