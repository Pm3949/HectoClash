import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav";
import axios from "axios";

const LiveMatches = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch live matches from backend API
  const fetchLiveMatches = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/match/getAllMatches`
      );
      // Ensure we're working with an array
      const matchesData = Array.isArray(response.data)
        ? response.data
        : response.data.matches || response.data.data || [];
      console.log("Matches data:", matchesData); // Debug the response
      setLiveMatches(matchesData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching live matches:", err);
      setError("Failed to load live matches. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();

    // Optional: Set up polling to refresh matches periodically
    const intervalId = setInterval(fetchLiveMatches, 5000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-secondary/20 to-dark"></div>
      <Nav />

      <div className="relative z-10 flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Live Matches</h1>
          <button
            onClick={fetchLiveMatches}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <span className={`${isLoading ? "opacity-50" : ""}`}>Refresh</span>
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchLiveMatches}
                className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : liveMatches.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">
              No live matches available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(liveMatches) &&
              liveMatches.map((match) => (
                <motion.div
                  key={match._id || match.id}
                  whileHover={{ y: -5 }}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-lg"
                >
                  <Link
                    to={`/spectmatch/${match._id || match.id}`}
                    className="block"
                  >
                    <div className="p-6">
                      {/* Players */}
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/30 mr-3">
                            <span className="text-xl font-bold text-blue-400">
                              {
                                "P"}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">
                              @{match.player1.userName || match.player1.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-400">
                              <span>{match.player1.rating}</span>
                              <span className="mx-2">•</span>
                              <span>{match.player1.country || "🌍"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center px-4">
                          <div className="text-xs text-gray-400 mb-1">Time</div>
                          <div className="text-white font-mono">
                            {match.timeElapsed ||
                              new Date(match.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </div>
                        </div>

                        <div className="flex items-center text-right">
                          <div>
                            <h3 className="text-white font-medium">
                              @{match.player2.userName || match.player2.name}
                            </h3>
                            <div className="flex items-center justify-end text-sm text-gray-400">
                              <span>{match.player2.country || "🌍"}</span>
                              <span className="mx-2">•</span>
                              <span>{match.player2.rating}</span>
                            </div>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/30 ml-3">
                            <span className="text-xl font-bold text-purple-400">
                              {match.player2.avatar ||
                                match.player2.userName?.[0]?.toUpperCase() ||
                                "P"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Problem */}
                      <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700">
                        <h4 className="text-white font-bold mb-1">
                          {match.problem.title}
                        </h4>
                        <div className="flex justify-between text-sm">
                          <span
                            className={`px-2 py-1 rounded ${
                              match.problem.difficulty === "Easy"
                                ? "bg-green-900/50 text-green-400"
                                : match.problem.difficulty === "Medium"
                                ? "bg-yellow-900/50 text-yellow-400"
                                : "bg-red-900/50 text-red-400"
                            }`}
                          >
                            {match.problem.difficulty}
                          </span>
                          <span className="text-primary">
                            {match.problem.points} pts
                          </span>
                        </div>
                      </div>

                      {/* Match Info */}
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Moves: {match.moves}</span>
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          Spectate Now →
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMatches;
