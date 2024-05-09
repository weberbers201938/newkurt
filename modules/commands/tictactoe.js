const _ = require('lodash');

module.exports = {
  config: {
    name: "tictactoe",
    description: "Play tic-tac-toe game with the bot.",
    usage: "{pn} tictactoe",
    role: 0,
  },

  onRun: async function({ message, event }) {
    const { threadID } = event;

    const playerEmoji = '❌'; // Emoji for player
    const botEmoji = '⭕'; // Emoji for bot

    let board = ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️']; // Initial empty board

    let playerTurn = true; // Flag to track player's turn

    const displayBoard = () => {
      const rows = _.chunk(board, 3); // Split the board into rows
      const formattedRows = rows.map(row => row.join('')); // Format each row as a string
      const boardMessage = formattedRows.join('\n'); // Join rows with line breaks
      return boardMessage;
    };

    const checkWinner = (player) => {
      const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
      ];

      for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === player && board[b] === player && board[c] === player) {
          return true; // Return true if the player has won
        }
      }
      return false; // Return false if no winner
    };

    const botMove = () => {
      let emptyCells = [];
      for (let i = 0; i < 9; i++) {
        if (board[i] === '⬜️') {
          emptyCells.push(i);
        }
      }
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const botChoice = emptyCells[randomIndex];
      board[botChoice] = botEmoji;
    };

    const gameLoop = async () => {
      let winner = null;
      while (!winner && board.includes('⬜️')) {
        const currentPlayer = playerTurn ? playerEmoji : botEmoji;
        const currentPlayerID = playerTurn ? event.senderID : 'bot';

        const currentPlayerMessage = await message.reply(displayBoard());
        const response = await message.awaitReply({ participantIDs: [currentPlayerID], timeout: 60000 });

        if (response) {
          const choice = parseInt(response.body) - 1;
          if (choice >= 0 && choice < 9 && board[choice] === '⬜️') {
            board[choice] = currentPlayer;
            winner = checkWinner(currentPlayer);
            playerTurn = !playerTurn;
          } else {
            await message.reply('Invalid move. Please choose an empty cell (1-9).');
          }
        } else {
          await message.reply('No response received. Game aborted.');
          return;
        }
        await message.deleteMessage(currentPlayerMessage.messageID);
      }

      const resultMessage = winner ? (winner === playerEmoji ? 'You win!' : 'Bot wins!') : 'It\'s a tie!';
      await message.reply(displayBoard() + '\n' + resultMessage);
    };

    await gameLoop();
  },

  onReply: async function({ message, event }) {
    // Check if the current player is the bot
    if (event.senderID === 'bot') {
      // Parse the response from the player
      const choice = parseInt(event.body) - 1;
      // Update the board with player's move
      if (choice >= 0 && choice < 9 && board[choice] === '⬜️') {
        board[choice] = playerEmoji;
        // Check for winner after player's move
        const winner = checkWinner(playerEmoji);
        // If no winner, continue the game loop
        if (!winner && board.includes('⬜️')) {
          await gameLoop();
        } else {
          // If winner or tie, end the game
          const resultMessage = winner ? 'You win!' : 'It\'s a tie!';
          await message.reply(displayBoard() + '\n' + resultMessage);
        }
      } else {
        // If invalid move, prompt the player to choose again
        await message.reply('Invalid move. Please choose an empty cell (1-9).');
        await gameLoop();
      }
    }
  }
};
