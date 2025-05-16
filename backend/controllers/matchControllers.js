import {getIo} from "../socket/socket.js";
import { Match } from "../models/matchModel.js";
import { User } from "../models/userModel.js";
import { getValidHectoDigits } from "../utils/generateProblem.js";


export const submitAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId, answer } = req.body;

    if (!matchId || !answer) {
      return res
        .status(400)
        .json({ message: "Match ID and answer are required" });
    }

    const match = await Match.findById(matchId);
    if (!match || match.status !== "started") {
      return res
        .status(404)
        .json({ message: "Match not found or already finished" });
    }

    let isValid = false;
    try {
      const evalAnswer = answer
        .replace(/×|x/g, "*")
        .replace(/÷/g, "/") 
        .replace(/\^/g, "**");
      if (eval(evalAnswer) === 100) {
        isValid = true;
      }
    } catch (error) {
      console.error("Invalid expression:", error);
      return res.status(400).json({ message: "Invalid expression format" });
    }

    if (isValid) {
      if (!match.winner) {
        match.winner = userId;
        match.status = "finished";
        match.endTime = new Date();
        await match.save();

        const now = new Date();
        const todayStr = now.toLocaleDateString("en-CA");
        const todayDayName = now.toLocaleDateString("en-US", {
          weekday: "long",
        });

        // 🔥 UPDATE WINNER
        const winner = await User.findById(userId);

        let updatedStreak = winner.currentStreak || 0;
        let shouldIncreaseStreak = true;

        if (winner.lastgameDate) {
          const lastDate = new Date(winner.lastgameDate);
          const lastStr = lastDate.toLocaleDateString("en-CA");

          if (lastStr === todayStr) {
            shouldIncreaseStreak = false;
          } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yStr = yesterday.toLocaleDateString("en-CA");

            if (lastStr === yStr) {
              updatedStreak += 1;
            } else {
              updatedStreak = 1;
            }
          }
        } else {
          updatedStreak = 1;
        }

        const highestRating = Math.max(
          winner.highestRating || 0,
          updatedRating
        );

        const updatedWinner = await User.findByIdAndUpdate(
          userId,
          {
            $inc: { "stats.gamesPlayed": 1, "stats.wins": 1 },
            $set: {
              currentStreak: shouldIncreaseStreak
                ? updatedStreak
                : winner.currentStreak,
              lastgameDate: now,
              lastGameDay: todayDayName,
              rating: updatedRating,
              highestRating: highestRating,
            },
          },
          { new: true }
        );

        // 🔥 UPDATE LOSER
        const loserId =
          userId === String(match.player1) ? match.player2 : match.player1;

        if (loserId) {
          const loser = await User.findById(loserId);

          if (loser) {
            let loserStreak = 1;
            let updateLoserStreak = true;

            if (loser.lastgameDate) {
              const last = new Date(loser.lastgameDate);
              const lastStr = last.toLocaleDateString("en-CA");

              if (lastStr === todayStr) {
                updateLoserStreak = false;
              } else {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yStr = yesterday.toLocaleDateString("en-CA");

                if (lastStr === yStr) {
                  loserStreak = loser.currentStreak + 1;
                }
              }
            }

            const newLosses = loser.stats.losses + 1;
            const newWins = loser.stats.wins;
            const newRating = Math.round((newWins - newLosses / 4) * 100);

            await User.findByIdAndUpdate(loserId, {
              $inc: { "stats.gamesPlayed": 1, "stats.losses": 1 },
              $set: {
                lastgameDate: now,
                currentStreak: updateLoserStreak
                  ? loserStreak
                  : loser.currentStreak,
                lastGameDay: todayDayName,
                rating: newRating,
              },
            });
          }
        }

        return res.status(200).json({
          message: "Correct answer! You won the match!",
          match,
          updatedWinner,
        });
      } else {
        return res
          .status(400)
          .json({ message: "Match already won by another player!" });
      }
    }

    return res.status(400).json({ message: "Incorrect answer, try again!" });
  } catch (error) {
    console.error("Error in submitAnswer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// rating change code
// ✅ Fetch all matches for spectator mode (only if status is "started")
export const getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find({ status: "started" })
      .sort({ startTime: -1 }) // Most recent first
      .populate("player1 player2 winner", "userName rating profilePic")
      .select("problem startTime status player1 player2 winner");

    return res.status(200).json({ matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSingleMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Match.findById(id).populate(
      "player1 player2 winner",
      "userName rating profilePic"
    );
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    return res.status(200).json({ match });
  } catch (error) {
    console.error("Error fetching match:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
