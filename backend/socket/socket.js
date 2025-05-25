import { Server } from "socket.io";
import { getValidHectoDigits } from "../utils/generateProblem.js";
import { Match } from "../models/matchModel.js";
import { User } from "../models/userModel.js";

// Constants
const COUNTDOWN_DURATION = 3; // seconds
const RATING_CHANGE_WIN = 10;
const RATING_CHANGE_LOSS = -5;

// Global variables
let io;
const playerQueue = new Map(); // key = socketId, value = { socket, user }
const activeMatches = new Map(); // key = roomId, value = { player1: socketId, player2: socketId }
const userSocketMap = new Map(); // key = userId, value = socketId
const matchTimeoutMap = new Map(); // key = matchId, value = timeoutId

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["https://hectoclash-cuwf.onrender.com"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Track user-socket mapping
    socket.on("authenticate", (userId) => {
      userSocketMap.set(userId, socket.id);
    });

    socket.on("joinQueue", handleJoinQueue(socket));
    socket.on("submitAnswer", handleSubmitAnswer(socket));
    socket.on("disconnect", handleDisconnect(socket));
    socket.on("leaveQueue", handleLeaveQueue(socket));
  });
}

// Handler functions
function handleJoinQueue(socket) {
  return async (user) => {
    try {
      console.log(`🎮 ${user.userName} joined queue`);
      playerQueue.set(socket.id, { socket, user });

      // Matchmaking when 2 players are available
      if (playerQueue.size >= 2) {
        const [id1, player1] = Array.from(playerQueue.entries())[0];
        const [id2, player2] = Array.from(playerQueue.entries())[1];

        playerQueue.delete(id1);
        playerQueue.delete(id2);

        const roomId = `match_${Date.now()}`;
        activeMatches.set(roomId, { player1: id1, player2: id2 });

        // Join room
        await player1.socket.join(roomId);
        await player2.socket.join(roomId);

        // Generate problem
        const problem = await getValidHectoDigits();
        const match = await Match.create({
          player1: player1.user._id,
          player2: player2.user._id,
          problem,
          status: "started",
          startTime: new Date(),
        });

        // Countdown before match starts
        let count = COUNTDOWN_DURATION;
        const countdownInterval = setInterval(() => {
          if (count > 0) {
            io.to(roomId).emit("countdown", count);
            count--;
          } else {
            clearInterval(countdownInterval);
            startMatch(roomId, player1, player2, problem, match._id);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Matchmaking error:", error);
      socket.emit("queueError", { message: "Failed to join queue" });
    }
  };
}
function startMatch(roomId, player1, player2, problem, matchId) {
  const matchData = {
    roomId,
    problem,
    matchId,
    opponent: {
      id: player2.user._id,
      name: player2.user.name,
      rating: player2.user.rating,
    },
  };

  player1.socket.emit("matchStart", {
    ...matchData,
    opponent: {
      id: player2.user._id,
      name: player2.user.name,
      rating: player2.user.rating,
    },
  });

  player2.socket.emit("matchStart", {
    ...matchData,
    opponent: {
      id: player1.user._id,
      name: player1.user.name,
      rating: player1.user.rating,
    },
  });

  console.log(`🎮 Match started in room ${roomId}`);

  // ⏱️ Set a timeout for match draw
  // In the startMatch function, update the timeout handler:
  const timeoutId = setTimeout(async () => {
    const currentMatch = await Match.findById(matchId);
    if (currentMatch && currentMatch.status === "started") {
      await Match.findByIdAndUpdate(matchId, {
        status: "finished",
        endTime: new Date(),
        winner: null,
      });

      io.to(roomId).emit("matchCompleted", {
        matchId,
        winner: null,
        isDraw: true,
        message: "Time's up! Match ended in a draw.",
        ratingChanges: {
          winner: 0, // No rating change for draw
          loser: 0, // No rating change for draw
        },
        stats: {
          winner: null,
          loser: null,
        },
      });

      activeMatches.delete(roomId);
      matchTimeoutMap.delete(matchId);
      console.log(`⏱️ Match ${matchId} ended in draw due to timeout`);
    }
  }, 60000);

  matchTimeoutMap.set(String(matchId), timeoutId);
}

function calculateResult(expression) {
  if (!expression) return null;
  if (/\d{2,}/.test(expression)) return "AdjacentDigits";
  try {
    const formatted = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/\^/g, "**");
    const result = eval(formatted);
    return Math.round(result * 100) / 100;
  } catch {
    return "Invalid";
  }
}

function calculateRatingChange(winnerRating, loserRating) {
  const K = 32;
  const expectedWin =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoss = 1 - expectedWin;

  const winChange = Math.round(K * (1 - expectedWin));
  const lossChange = -Math.round(K * expectedLoss); // keep negative

  return { winChange, lossChange };
}

function handleSubmitAnswer(socket) {
  return async ({ matchId, expression, userId, opponentId }) => {
    try {
      console.log(`✅ Answer submitted by ${userId} for match ${matchId}`);
      const roomId = `match_${matchId}`;

      const match = await Match.findById(matchId);
      if (!match || match.status !== "started") {
        return socket.emit("answerError", {
          message: match?.winner ? "Match already completed" : "Invalid match",
          matchId,
        });
      }

      // Calculate result
      const calculatedResult = calculateResult(expression);

      // Notify opponent of attempt
      io.to(roomId).emit("opponentAttempt", {
        expression,
        result: calculatedResult,
      });

      // Only proceed if it's a winning answer
      if (calculatedResult !== 100) {
        return socket.emit("answerError", {
          message: "Incorrect solution",
          matchId,
        });
      }

      // Update match
      const updatedMatch = await Match.findByIdAndUpdate(
        matchId,
        {
          $set: {
            status: "finished",
            winner: userId,
            endTime: new Date(),
            winningExpression: expression,
          },
        },
        { new: true }
      );

      // Clear match timeout
      const timeoutId = matchTimeoutMap.get(matchId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        matchTimeoutMap.delete(matchId);
      }

      // Update players
      const { winner, loser, ratingChanges } = await updatePlayerStats(
        userId,
        match
      );

      // Notify players
      io.to(roomId).emit("matchCompleted", {
        matchId,
        winner: userId,
        expression,
        ratingChanges: {
          winner: RATING_CHANGE_WIN,
          loser: RATING_CHANGE_LOSS,
        },
        stats: {
          winner: {
            rating: winner.rating,
            wins: winner.stats.wins,
          },
          loser: loser && {
            rating: loser.rating,
            losses: loser.stats.losses,
          },
        },
      });

      // Individual confirmations
      socket.emit("answerSuccess", {
        matchId,
        isWinner: true,
        ratingChange: ratingChanges.winner,
        newRating: winner.rating,
      });

      if (loser) {
        let opponentSocketId = userSocketMap.get(opponentId || loser._id);

        if (!opponentSocketId) {
          // Try to retrieve from activeMatches
          for (const [room, match] of activeMatches.entries()) {
            if (match.player1 === socket.id || match.player2 === socket.id) {
              opponentSocketId =
                match.player1 === socket.id ? match.player2 : match.player1;
              break;
            }
          }
        }

        if (opponentSocketId) {
          const opponentSocket = io.sockets.sockets.get(opponentSocketId);
          opponentSocket?.emit("answerSuccess", {
            matchId,
            isWinner: false,
            ratingChange: ratingChanges.loser,
            newRating: loser.rating,
          });
        }
      }
    } catch (error) {
      console.error("Error processing answer:", error);
      socket.emit("answerError", {
        message: "Failed to process answer",
        matchId,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
}

async function updatePlayerStats(winnerId, match) {
  const loserId =
    winnerId === String(match.player1) ? match.player2 : match.player1;

  const winnerDoc = await User.findById(winnerId);
  const loserDoc = await User.findById(loserId);

  if (!winnerDoc || !loserDoc) throw new Error("One of the players not found");

  const { winChange, lossChange } = calculateRatingChange(
    winnerDoc.rating,
    loserDoc.rating
  );

  const updatedWinner = await User.findByIdAndUpdate(
    winnerId,
    [
      {
        $set: {
          rating: { $add: ["$rating", winChange] },
          "stats.wins": { $add: ["$stats.wins", 1] },
          "stats.gamesPlayed": { $add: ["$stats.gamesPlayed", 1] },
          currentStreak: { $add: ["$currentStreak", 1] },
          lastgameDate: new Date(),
          lastGameDay: new Date().toLocaleDateString("en-US", {
            weekday: "long",
          }),
          highestRating: {
            $max: ["$highestRating", { $add: ["$rating", winChange] }],
          },
        },
      },
    ],
    { new: true }
  );

  await User.findByIdAndUpdate(winnerId, {
    $push: {
      "stats.ratingHistory": {
        date: new Date(),
        rating: updatedWinner.rating,
      },
    },
  });

  const updatedLoser = await User.findByIdAndUpdate(
    loserId,
    {
      $inc: {
        "stats.losses": 1,
        rating: lossChange,
        "stats.gamesPlayed": 1,
      },
      $set: {
        lastgameDate: new Date(),
        lastGameDay: new Date().toLocaleDateString("en-US", {
          weekday: "long",
        }),
        currentStreak: 0,
      },
    },
    { new: true }
  );

  await User.findByIdAndUpdate(loserId, {
    $push: {
      "stats.ratingHistory": {
        date: new Date(),
        rating: updatedLoser.rating,
      },
    },
  });

  return {
    winner: updatedWinner,
    loser: updatedLoser,
    ratingChanges: { winner: winChange, loser: lossChange },
  };
}

function handleDisconnect(socket) {
  return () => {
    console.log(`❌ User disconnected: ${socket.id}`);

    // Remove from queue
    if (playerQueue.has(socket.id)) {
      playerQueue.delete(socket.id);
      console.log(`🗑️ Removed ${socket.id} from queue`);
    }

    // Handle active match disconnection
    const roomId = Array.from(activeMatches.entries()).find(
      ([_, match]) => match.player1 === socket.id || match.player2 === socket.id
    )?.[0];

    if (roomId) {
      const match = activeMatches.get(roomId);
      const matchId = roomId.replace("match_", "");

      const timeoutId = matchTimeoutMap.get(matchId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        matchTimeoutMap.delete(matchId);
      }
      const opponentId =
        match.player1 === socket.id ? match.player2 : match.player1;

      if (opponentId) {
        const opponentSocket = io.sockets.sockets.get(opponentId);
        opponentSocket?.emit("opponentDisconnected");
      }

      activeMatches.delete(roomId);
      console.log(`🏁 Match ${roomId} ended due to disconnect`);
    }

    // Remove user-socket mapping
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };
}

function handleLeaveQueue(socket) {
  return () => {
    if (playerQueue.has(socket.id)) {
      playerQueue.delete(socket.id);
      socket.emit("leftQueue");
      console.log(`🚪 ${socket.id} left queue`);
    }
  };
}

function getIo() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

export { initSocket, getIo };
