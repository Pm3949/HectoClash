import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Nav from "../../components/Nav";
import socket from "../../socket/socket.js";

const PlayerPanel = ({ user, isOpponent, isActive }) => {
  if (!user || !user.name) {
    return (
      <div className="flex flex-col gap-6 text-white opacity-50">
        Loading player...
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-6 transition-opacity ${
        isActive ? "opacity-100" : "opacity-70"
      }`}
    >
      <div className="bg-gray-800 rounded-xl p-6 border-gray-700 relative">
        {isActive && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            Playing
          </div>
        )}
        <div className="flex items-center mb-6">
          <div
            className={`w-16 h-16 rounded-full ${
              isOpponent
                ? "bg-purple-600/20 border-purple-500/30"
                : "bg-blue-600/20 border-blue-500/30"
            } flex items-center justify-center border-2 mr-4`}
          >
            <span
              className={`text-2xl font-bold ${
                isOpponent ? "text-purple-400" : "text-blue-400"
              }`}
            >
              {user.name[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">@{user.name}</h2>
            <div className="text-gray-400">Rating: {user.rating}</div>
          </div>
        </div>
        {!isOpponent && (
          <>
            <h3 className="text-lg font-bold text-white mb-3">Your Attempts</h3>
            {user?.attempts?.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {user.attempts.map((attempt) => (
                  <div
                    key={attempt.number}
                    className={`bg-gray-900/50 p-3 rounded-lg border ${
                      attempt.correct ? "border-green-500/30" : "border-red-500/30"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-white">
                        Attempt #{attempt.number}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          attempt.correct
                            ? "bg-green-900/50 text-green-400"
                            : "bg-red-900/50 text-red-400"
                        }`}
                      >
                        {attempt.correct ? "✓" : `✗ (${attempt.result})`}
                      </span>
                    </div>
                    {attempt.expression && (
                      <div className="text-sm font-mono bg-gray-800 p-2 rounded mt-1 break-all">
                        {attempt.expression}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 italic">No attempts yet</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const GameModal = ({ emoji, title, message, onConfirm, buttonText }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <button
        onClick={onConfirm}
        className="bg-primary hover:bg-primary/80 text-white font-bold py-2 px-6 rounded-lg transition-colors"
      >
        {buttonText}
      </button>
    </div>
  </div>
);

const Multiplayer = () => {
  const { authUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState(60);
  const [expression, setExpression] = useState("");
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [problem, setProblem] = useState("");
  const [matchId, setMatchId] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const [user, setUser] = useState({
    id: authUser?._id || null,
    name: authUser?.userName || "You",
    rating: authUser?.rating || 0,
    avatar: (authUser?.userName?.[0] || "Y").toUpperCase(),
    attempts: [],
  });

  const [opponent, setOpponent] = useState({
    name: "Opponent",
    rating: 0,
    attempts: [],
  });

  useEffect(() => {
    if (location.state?.matchData) {
      initializeMatch(location.state.matchData);
    }
  }, [location.state]);

  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    const onMatchCompleted = (data) => {
      setGameEnded(true);
      clearInterval(timerRef.current);

      const currentUserId = authUser?._id || user.id;
      const winnerId = typeof data.winner === "object" ? String(data.winner) : data.winner;

      if (data.isDraw || winnerId === null) {
        setActiveModal("draw");
        setLastResult("⏰ Time's up! Match ended in a draw.");
      } else {
        const isUserWinner = winnerId === currentUserId;
        setActiveModal(isUserWinner ? "success" : "opponentWin");
        setLastResult(
          `Match Over! ${isUserWinner ? "You won!" : "You lost!"}\n` +
            `Expression: ${data.expression}\n` +
            `Rating ${isUserWinner ? "+" : ""}${
              isUserWinner
                ? data.ratingChanges.winner
                : data.ratingChanges.loser
            }`
        );
      }
    };

    const onAnswerSuccess = (data) => {
      const { isWinner, ratingChange, newRating } = data;

      setUser((prev) => ({
        ...prev,
        rating: newRating,
      }));

      const message = isWinner
        ? `🎉 You won! +${ratingChange} rating`
        : `😓 You lost. ${ratingChange} rating`;

      setLastResult(`${message}\nNew Rating: ${newRating}`);
      setActiveModal(isWinner ? "success" : "opponentWin");

      if (!isWinner) {
        setGameEnded(true);
        clearInterval(timerRef.current);
      }
    };

    const onOpponentAttempt = (attemptData) => {
      setOpponent((prev) => ({
        ...prev,
        attempts: [
          ...prev.attempts,
          {
            number: prev.attempts.length + 1,
            timestamp: formatTime(60 - timeLeft),
            expression: attemptData.expression,
            result: attemptData.result,
            correct: attemptData.result === 100,
          },
        ],
      }));
    };

    socket.on("matchCompleted", onMatchCompleted);
    socket.on("answerSuccess", onAnswerSuccess);
    socket.on("opponentAttempt", onOpponentAttempt);

    return () => {
      socket.off("matchCompleted", onMatchCompleted);
      socket.off("answerSuccess", onAnswerSuccess);
      socket.off("opponentAttempt", onOpponentAttempt);
    };
  }, [timeLeft]);

  const initializeMatch = (data) => {
    setMatchId(data.matchId);
    setProblem(data.problem);
    setOpponent({
      id: data.opponent.id,
      name: data.opponent.name,
      rating: data.opponent.rating,
      avatar: data.opponent.name[0].toUpperCase(),
      attempts: [],
    });
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const calculateResult = () => {
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
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleButtonClick = (handler) => (e) => {
    if (e.type === "click" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };

  const handleNextNumber = () => {
    if (currentNumberIndex < numbers.length) {
      if (expression.length > 0 && /\d/.test(expression.slice(-1))) return;
      setExpression((prev) => prev + numbers[currentNumberIndex]);
      setCurrentNumberIndex((prev) => prev + 1);
    }
  };

  const handleOperatorClick = (char) => {
    if (!gameEnded) setExpression((prev) => prev + char);
  };

  const handleUndo = () => {
    if (expression.length === 0 || gameEnded) return;
    const lastChar = expression.slice(-1);
    setExpression((prev) => prev.slice(0, -1));
    if (/\d/.test(lastChar)) setCurrentNumberIndex((prev) => prev - 1);
  };

  const handleClear = () => {
    if (!gameEnded) {
      setExpression("");
      setCurrentNumberIndex(0);
    }
  };

  const handleSubmit = () => {
    const result = calculateResult();
    const isInvalid = result === "Invalid" || result === "AdjacentDigits";

    if (result === 100) {
      socket.emit("submitAnswer", {
        matchId,
        expression,
        userId: user.id,
        opponentId: opponent.id,
      });
    }

    if (isInvalid) {
      setLastResult(
        result === "AdjacentDigits"
          ? "Cannot have adjacent digits!"
          : "Invalid expression!"
      );
      setActiveModal("wrongAnswer");
      return;
    }

    const newAttempt = {
      number: user.attempts.length + 1,
      timestamp: formatTime(60 - timeLeft),
      expression,
      result,
      correct: result === 100,
    };

    setUser((prev) => ({
      ...prev,
      attempts: [...prev.attempts, newAttempt],
    }));

    if (result === 100) {
      setGameEnded(true);
      setActiveModal("success");
    } else {
      setLastResult(`Result: ${result}`);
      setActiveModal("wrongAnswer");
    }

    setExpression("");
    setCurrentNumberIndex(0);
  };

  const handleModalConfirm = () => {
    setActiveModal(null);
    if (["success", "opponentWin", "draw"].includes(activeModal)) {
      navigate("/matchresult", {
        state: {
          matchId,
          problem,
          userAttempts: user.attempts,
          opponentAttempts: opponent.attempts,
          result:
            activeModal === "success"
              ? "win"
              : activeModal === "opponentWin"
              ? "loss"
              : "draw",
        },
      });
    }
  };

  const numbers = useMemo(() => {
    if (!problem) return [];
    return problem.split("").filter((char) => /^\d$/.test(char));
  }, [problem]);

  const operators = ["+", "-", "×", "÷", "^", "(", ")"];
  const currentResult = calculateResult();

  const disableSubmit =
    currentNumberIndex < numbers.length || validationError || !expression || gameEnded;

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-secondary/20 to-dark"></div>
      <Nav />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4 flex flex-col gap-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Sequence: {problem}</h2>
                <div className={`text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              <p className="text-gray-300">
                Use operators [+,-,*,/,(,),^] to make the sequence equal 100.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <label className="block text-white font-medium mb-2">Your Solution</label>
              <div className="my-2 p-4 border border-gray-700 rounded bg-gray-700 min-h-12 text-white font-mono text-lg">
                {expression || "Start building your equation..."}
              </div>

              <div className="mb-4">
                <button
                  onClick={handleButtonClick(handleNextNumber)}
                  onKeyDown={handleButtonClick(handleNextNumber)}
                  tabIndex={
                    currentNumberIndex >= numbers.length ||
                    (expression.length > 0 && /\d/.test(expression.slice(-1))) ||
                    gameEnded
                      ? -1
                      : 0
                  }
                  disabled={
                    currentNumberIndex >= numbers.length ||
                    (expression.length > 0 && /\d/.test(expression.slice(-1))) ||
                    gameEnded
                  }
                  className={`w-full py-3 mb-4 rounded-lg ${
                    currentNumberIndex >= numbers.length ||
                    (expression.length > 0 && /\d/.test(expression.slice(-1))) ||
                    gameEnded
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  } text-white font-medium transition-colors`}
                >
                  {currentNumberIndex >= numbers.length
                    ? "All numbers used"
                    : `Add Next Number (${numbers[currentNumberIndex]})`}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 my-4">
                {operators.map((op) => (
                  <button
                    key={op}
                    onClick={() => handleOperatorClick(op)}
                    onKeyDown={handleButtonClick(() => handleOperatorClick(op))}
                    tabIndex={gameEnded ? -1 : 0}
                    disabled={gameEnded}
                    className={`p-3 rounded-lg bg-primary/10 hover:bg-primary/20 font-bold text-xl text-primary ${
                      gameEnded ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary focus:outline-none'
                    } transition-colors`}
                    aria-label={op === '^' ? 'exponent' : op}
                  >
                    {op}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleButtonClick(handleUndo)}
                  onKeyDown={handleButtonClick(handleUndo)}
                  tabIndex={expression.length === 0 || gameEnded ? -1 : 0}
                  disabled={expression.length === 0 || gameEnded}
                  className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
                >
                  Undo
                </button>
                <button
                  onClick={handleButtonClick(handleClear)}
                  onKeyDown={handleButtonClick(handleClear)}
                  tabIndex={expression.length === 0 || gameEnded ? -1 : 0}
                  disabled={expression.length === 0 || gameEnded}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-red-400 focus:outline-none transition-colors"
                >
                  Clear
                </button>
              </div>

              <button
                onClick={handleButtonClick(handleSubmit)}
                onKeyDown={handleButtonClick(handleSubmit)}
                tabIndex={disableSubmit ? -1 : 0}
                disabled={disableSubmit}
                className={`mt-4 w-full py-3 rounded-lg text-white font-bold ${
                  disableSubmit
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                } transition-colors`}
              >
                {gameEnded ? 'Game Ended' : 
                 currentNumberIndex < numbers.length ? 'Use All Numbers First' : 
                 !expression ? 'Enter Expression' : 
                 'Submit Solution'}
              </button>
            </div>
          </div>

          <div className="lg:w-1/4 flex flex-col gap-6">
            <PlayerPanel user={opponent} isOpponent={true} isActive={true} />
            <PlayerPanel user={user} isOpponent={false} isActive={true} />
          </div>
        </div>
      </div>

      {activeModal && (
        <GameModal
          emoji={
            activeModal === "success"
              ? "🎉"
              : activeModal === "wrongAnswer"
              ? "❌"
              : activeModal === "opponentWin"
              ? "😞"
              : activeModal === "draw"
              ? "⏰"
              : "❓"
          }
          title={
            activeModal === "success"
              ? "Correct!"
              : activeModal === "wrongAnswer"
              ? "Try Again"
              : activeModal === "opponentWin"
              ? "Opponent Won!"
              : activeModal === "draw"
              ? "It's a Draw!"
              : "Game Over"
          }
          message={lastResult}
          onConfirm={handleModalConfirm}
          buttonText="OK"
        />
      )}
    </div>
  );
};

export default Multiplayer;