import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import { useSelector } from "react-redux";
import socket from "../../socket/socket.js";

const MatchmakingPage = () => {
  const { authUser } = useSelector((state) => state.user);
  // console.log("user", authUser);
  const navigate = useNavigate();
  const [matchId, setMatchId] = useState(null);
  const [countDown, setCountdown] = useState(0);
  const [opponent, setOpponent] = useState(null);
  const [activeModes, setActiveModes] = useState({
    training: { loading: false, matched: false },
    singleplayer: { loading: false, matched: false },
    multiplayer: { loading: false, matched: false, opponent: null },
  });
  useEffect(() => {
    if (!socket) return;

    // 👉 Explicitly connect
    if (!socket.connected) {
      socket.connect();
      console.log("🔌 Attempting to connect socket...");
    }

    const onConnect = () => {
      console.log("✅ Socket connected!", socket.id);
    };

    const onDisconnect = () => {
      console.log("🔌 Socket disconnected.");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const gameModes = [
    {
      id: "multiplayer",
      title: "Ranked Match",
      description: "Compete with players of similar skill level",
      icon: "⚔️",
      color: "bg-gradient-to-br from-purple-500/10 to-purple-500/5",
      border: "border-purple-500/20 hover:border-purple-500/40",
      button: "Find Match",
      redirect: "/multiplayer",
    },
    {
      id: "training",
      title: "Training Mode",
      description: "Practice at your own pace with customizable settings",
      icon: "📚",
      color: "bg-gradient-to-br from-orange-500/10 to-orange-500/5",
      border: "border-orange-500/20 hover:border-orange-500/40",
      button: "Start Training",
      redirect: "/training",
    },
    {
      id: "singleplayer",
      title: "Singleplayer",
      description: "Challenge yourself with progressively difficult puzzles",
      icon: "🧠",
      color: "bg-gradient-to-br from-blue-500/10 to-blue-500/5",
      border: "border-blue-500/20 hover:border-blue-500/40",
      button: "Play Solo",
      redirect: "/singleplayer",
    },
  ];

  // Handle matchmaking for multiplayer
  const handleModeSelect = (mode) => {
    // console.log("Mode selected: ", mode);

    if (mode.id === "multiplayer") {
      setActiveModes((prev) => ({
        ...prev,
        multiplayer: { ...prev.multiplayer, loading: true },
      }));

      // Emit socket event to join the queue for multiplayer match
      // console.log("Emitting joinQueue");
      socket.emit("joinQueue", authUser); // Emit the event to join the queue
    } else {
      // Handle other modes (e.g., singleplayer or training)
      setActiveModes((prev) => ({
        ...prev,
        [mode.id]: { loading: true, matched: true },
      }));

      setTimeout(() => {
        navigate(mode.redirect);
        setActiveModes((prev) => ({
          ...prev,
          [mode.id]: { loading: false, matched: true },
        }));
      }, 2000); // Delay the navigation by 2 seconds
    }
  };
  useEffect(() => {
    socket.on("matchStart", (data) => {
      setOpponent(data.opponent);
      setMatchId(data.matchId);
      navigate(`/multiplayer/${data.matchId}`, { state: { matchData: data } });
      setActiveModes((prev) => ({
        ...prev,
        multiplayer: { loading: false, matched: true },
      }));
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate(`/multiplayer/${data.matchId}`);
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on("countdown", (count) => {
      setCountdown(count);
    });

    socket.on("opponent_disconnected", () => {
      alert("Your opponent has disconnected. Returning to the main menu.");
      setActiveModes((prev) => ({
        ...prev,
        multiplayer: { loading: false, matched: false },
      }));
      navigate("/home"); // Or wherever you want to redirect the user.
    });

    socket.on("error", (error) => {
      alert(`Error: ${error.message}`);
      setActiveModes((prev) => ({
        ...prev,
        multiplayer: { loading: false, matched: false },
      }));
    });

    return () => {
      socket.off("matchStart");
      socket.off("countdown");
      socket.off("opponent_disconnected");
      socket.off("error");
    };
  }, [authUser, navigate]);

  const cancelMatchmaking = (modeId) => {
    setActiveModes((prev) => ({
      ...prev,
      [modeId]: { loading: false, matched: false, opponent: null },
    }));
  };

  const getButtonState = (mode) => {
    const modeState = activeModes[mode.id];

    if (modeState.loading) {
      return {
        text: mode.id === "multiplayer" ? "Matching..." : "Starting...",
        className: "bg-gray-600 cursor-not-allowed",
        disabled: true,
      };
    }

    if (modeState.matched) {
      return {
        text: "Matched!",
        className: "bg-green-600 cursor-not-allowed",
        disabled: true,
      };
    }

    return {
      text: mode.button,
      className:
        mode.id === "multiplayer"
          ? "bg-purple-600 hover:bg-purple-700"
          : mode.id === "training"
          ? "bg-orange-600 hover:bg-orange-700"
          : "bg-blue-600 hover:bg-blue-700",
      disabled: false,
    };
  };

  const loaderStyle = {
    position: "relative",
    transform: "rotateZ(45deg)",
    perspective: "1000px",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    color: "#fff",
  };

  const sharedRingStyle = {
    content: '""',
    display: "block",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    transform: "rotateX(70deg)",
  };

  const afterRingStyle = {
    ...sharedRingStyle,
    color: "#FF3D00",
    transform: "rotateY(70deg)",
    animationDelay: "0.4s",
  };

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-secondary/20 to-dark"></div>
      <div className="fixed top-0 left-0 w-full z-50 backdrop-blur- bg-dark/90 ">
        <Nav />
      </div>

      <div className="relative z-10 flex-grow container mx-auto px-4 py-8 flex flex-col">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Choose Your Game Mode
        </h2>

        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto">
          {/* Training Mode - Left Side */}
          <motion.div
            className="flex-1 flex flex-col gap-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              key={gameModes[0].id}
              whileHover={{ y: -5 }}
              className={`flex-1 flex flex-col ${gameModes[0].color} ${gameModes[0].border} rounded-2xl p-6 shadow-lg transition-all`}
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">{gameModes[0].icon}</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 text-center">
                {gameModes[0].title}
              </h3>
              <p className="text-gray-300 text-sm mb-6 text-center flex-grow">
                {gameModes[0].description}
              </p>

              <div className="relative">
                {activeModes[gameModes[0].id].loading ||
                activeModes[gameModes[0].id].matched ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 overflow-hidden"
                    >
                      {activeModes[gameModes[0].id].loading ? (
                        <div className="flex flex-col items-center">
                          <>
                            <div style={loaderStyle}>
                              <div style={sharedRingStyle}></div>
                              <div style={afterRingStyle}></div>
                            </div>
                            <style>{`
        @keyframes spin {
          0%, 100% {
            box-shadow: 0.2em 0 0 0 currentcolor;
          }
          12% {
            box-shadow: 0.2em 0.2em 0 0 currentcolor;
          }
          25% {
            box-shadow: 0 0.2em 0 0 currentcolor;
          }
          37% {
            box-shadow: -0.2em 0.2em 0 0 currentcolor;
          }
          50% {
            box-shadow: -0.2em 0 0 0 currentcolor;
          }
          62% {
            box-shadow: -0.2em -0.2em 0 0 currentcolor;
          }
          75% {
            box-shadow: 0 -0.2em 0 0 currentcolor;
          }
          87% {
            box-shadow: 0.2em -0.2em 0 0 currentcolor;
          }
        }
      `}</style>
                          </>
                          <p className="text-sm text-white">Starting soon...</p>
                          <button
                            onClick={() => cancelMatchmaking(gameModes[0].id)}
                            className="mt-2 text-xs px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-sm text-green-400 font-bold">
                          Ready to start!
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ) : null}

                <button
                  onClick={() => handleModeSelect(gameModes[0])}
                  disabled={getButtonState(gameModes[0]).disabled}
                  className={`w-full py-3 rounded-xl text-white font-medium transition-colors ${
                    getButtonState(gameModes[0]).className
                  }`}
                >
                  {getButtonState(gameModes[0]).text}
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Middle Column - Singleplayer and Multiplayer stacked */}
          <motion.div
            className="flex-1 flex flex-col gap-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Singleplayer */}
            <motion.div
              key={gameModes[1].id}
              whileHover={{ y: -5 }}
              className={`flex-1 flex flex-col ${gameModes[1].color} ${gameModes[1].border} rounded-2xl p-6 shadow-lg transition-all`}
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">{gameModes[1].icon}</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 text-center">
                {gameModes[1].title}
              </h3>
              <p className="text-gray-300 text-sm mb-6 text-center flex-grow">
                {gameModes[1].description}
              </p>

              <div className="relative">
                {activeModes[gameModes[1].id].loading ||
                activeModes[gameModes[1].id].matched ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 overflow-hidden"
                    >
                      {activeModes[gameModes[1].id].loading ? (
                        <div className="flex flex-col items-center">
                          <>
                            <div style={loaderStyle}>
                              <div style={sharedRingStyle}></div>
                              <div style={afterRingStyle}></div>
                            </div>
                            <style>{`
        @keyframes spin {
          0%, 100% {
            box-shadow: 0.2em 0 0 0 currentcolor;
          }
          12% {
            box-shadow: 0.2em 0.2em 0 0 currentcolor;
          }
          25% {
            box-shadow: 0 0.2em 0 0 currentcolor;
          }
          37% {
            box-shadow: -0.2em 0.2em 0 0 currentcolor;
          }
          50% {
            box-shadow: -0.2em 0 0 0 currentcolor;
          }
          62% {
            box-shadow: -0.2em -0.2em 0 0 currentcolor;8
          }
          75% {
            box-shadow: 0 -0.2em 0 0 currentcolor;
          }
          87% {
            box-shadow: 0.2em -0.2em 0 0 currentcolor;
          }
        }
      `}</style>
                          </>
                          <p className="text-sm text-white">Starting soon...</p>
                          <button
                            onClick={() => cancelMatchmaking(gameModes[1].id)}
                            className="mt-2 text-xs px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-sm text-green-400 font-bold">
                          Ready to start!
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ) : null}

                <button
                  onClick={() => handleModeSelect(gameModes[1])}
                  disabled={getButtonState(gameModes[1]).disabled}
                  className={`w-full py-3 rounded-xl text-white font-medium transition-colors ${
                    getButtonState(gameModes[1]).className
                  }`}
                >
                  {getButtonState(gameModes[1]).text}
                </button>
              </div>
            </motion.div>

            {/* Multiplayer */}
            <motion.div
              key={gameModes[2].id}
              whileHover={{ y: -5 }}
              className={`flex-1 flex flex-col ${gameModes[2].color} ${gameModes[2].border} rounded-2xl p-6 shadow-lg transition-all`}
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">{gameModes[2].icon}</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 text-center">
                {gameModes[2].title}
              </h3>
              <p className="text-gray-300 text-sm mb-6 text-center flex-grow">
                {gameModes[2].description}
              </p>

              <div className="relative">
                {activeModes[gameModes[2].id].loading ||
                activeModes[gameModes[2].id].matched ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 overflow-hidden"
                    >
                      {activeModes[gameModes[2].id].loading ? (
                        <div className="flex flex-col items-center">
                          <>
                            <div style={loaderStyle}>
                              <div style={sharedRingStyle}></div>
                              <div style={afterRingStyle}></div>
                            </div>
                            <style>{`
        @keyframes spin {
          0%, 100% {
            box-shadow: 0.2em 0 0 0 currentcolor;
          }
          12% {
            box-shadow: 0.2em 0.2em 0 0 currentcolor;
          }
          25% {
            box-shadow: 0 0.2em 0 0 currentcolor;
          }
          37% {
            box-shadow: -0.2em 0.2em 0 0 currentcolor;
          }
          50% {
            box-shadow: -0.2em 0 0 0 currentcolor;
          }
          62% {
            box-shadow: -0.2em -0.2em 0 0 currentcolor;
          }
          75% {
            box-shadow: 0 -0.2em 0 0 currentcolor;
          }
          87% {
            box-shadow: 0.2em -0.2em 0 0 currentcolor;
          }
        }
      `}</style>
                          </>
                          <p className="text-sm text-white">Finding match...</p>
                          <button
                            onClick={() => cancelMatchmaking(gameModes[2].id)}
                            className="mt-2 text-xs px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : activeModes[gameModes[2].id].matched &&
                        activeModes[gameModes[2].id].opponent ? (
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full ${
                                activeModes[gameModes[2].id].opponent
                                  .avatarColor
                              } flex items-center justify-center mr-2`}
                            >
                              <span className="text-xs font-bold text-white">
                                {activeModes[gameModes[2].id].opponent.avatar}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-white">
                                @{activeModes[gameModes[2].id].opponent.name}
                              </p>
                              <p className="text-xs text-gray-300">
                                Rating:{" "}
                                {activeModes[gameModes[2].id].opponent.rating}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-green-400 font-bold">
                            Matched!
                          </div>
                        </motion.div>
                      ) : (
                        <div className="text-center text-sm text-green-400 font-bold">
                          Ready to start!
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ) : null}

                <button
                  onClick={() => handleModeSelect(gameModes[2])}
                  disabled={getButtonState(gameModes[2]).disabled}
                  className={`w-full py-3 rounded-xl text-white font-medium transition-colors ${
                    getButtonState(gameModes[2]).className
                  }`}
                >
                  {getButtonState(gameModes[2]).text}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingPage;
