import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../../components/Nav";
import { motion } from "framer-motion";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/users/leaderboard");
        setLeaderboard(res.data.leaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { backgroundColor: "#facc15" };
    if (rank === 2) return { backgroundColor: "#d1d5db" };
    if (rank === 3) return { backgroundColor: "#f59e0b" };
    return {};
  };

  const top15 = leaderboard.slice(0, 15);
  const podium = top15.slice(0, 3);
  const rest = top15.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-secondary/20 to-dark"></div>
      <Nav />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-white mb-2">
            HectoClash Champions
          </h1>
          <p className="text-gray-400 text-center mb-12">
            Top performers this week
          </p>

          {/* Podium */}
          <div className="mb-16 grid grid-cols-3 gap-4 h-64 items-end">
            {/* 2nd */}
            <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-lg flex flex-col items-center justify-end pb-4 relative" style={{ height: "70%" }}>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl">🥈</div>
              <div className="text-4xl opacity-0">🥈</div>
              <div className="font-bold text-black text-lg">{podium[1]?.userName}</div>
              <div className="text-black font-mono font-bold">{podium[1]?.rating}</div>
              <div className="absolute -bottom-6 left-0 right-0 text-center font-bold text-gray-300">2nd</div>
            </div>

            {/* 1st */}
            <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-lg flex flex-col items-center justify-end pb-4 relative" style={{ height: "100%" }}>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl">👑</div>
              <div className="text-4xl opacity-0">👑</div>
              <div className="font-bold text-black text-lg">{podium[0]?.userName}</div>
              <div className="text-black font-mono font-bold">{podium[0]?.rating}</div>
              <div className="absolute -bottom-6 left-0 right-0 text-center font-bold text-gray-300">1st</div>
            </div>

            {/* 3rd */}
            <div className="bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-lg flex flex-col items-center justify-end pb-4 relative" style={{ height: "50%" }}>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl">🥉</div>
              <div className="text-4xl opacity-0">🥉</div>
              <div className="font-bold text-white text-lg">{podium[2]?.userName}</div>
              <div className="text-white font-mono font-bold">{podium[2]?.rating}</div>
              <div className="absolute -bottom-6 left-0 right-0 text-center font-bold text-gray-300">3rd</div>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 bg-gray-800 p-4 font-bold text-gray-300">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-7">Player</div>
              <div className="col-span-2 text-right">Wins</div>
              <div className="col-span-2 text-right pr-4">Rating</div>
            </div>

            {rest.map((player) => (
              <div
                key={player.userName}
                className="grid grid-cols-12 items-center p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-all"
                style={getRankStyle(player.rank)}
              >
                <div className="col-span-1 text-center font-bold text-xl">
                  {getRankIcon(player.rank)}
                </div>
                <div className="col-span-7 pl-4 font-medium">{player.userName}</div>
                <div className="col-span-2 text-right font-mono">{player.wins}</div>
                <div className="col-span-2 text-right pr-4 font-bold">{player.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
