import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import axios from "axios";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { removeAuthUser } from "../../redux/userSlice"; // ✅ correct import path

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (error) {
        console.error("Failed to fetch user", error);
        toast.error("Failed to fetch user data");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/users/logout`, {
        withCredentials: true, // Ensure cookies/session are sent
      });
      toast.success(res.data.message);
      dispatch(removeAuthUser()); // ✅ Clear Redux auth state
      navigate("/"); // ✅ Redirect to home
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  const {
    name,
    userName,
    email,
    rating,
    highestRating,
    stats,
    createdAt,
    updatedAt,
  } = user;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const formattedDate = new Date(label).toISOString().slice(0, 10); // YYYY-MM-DD
      return (
        <div className="bg-gray-800 text-white p-3 rounded shadow-lg border border-gray-600">
          <p className="text-sm text-gray-400">{formattedDate}</p>
          <p className="text-lg font-semibold text-primary">
            Rating: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalGames = stats?.gamesPlayed || 0;
  const wins = stats?.wins || 0;
  const ratingHistory = stats?.ratingHistory || [];
  const winPercentage =
    totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-secondary/20 to-dark"></div>
      <Nav />

      <div className="relative z-10 flex-grow container mx-auto px-4 py-8">
        <div className="h-full flex flex-col">
          <div className="flex-grow">
            <div className="max-w-7xl mx-auto h-full">
              <div className="h-full flex flex-col md:flex-row gap-8">
                {/* Profile Card */}
                <div className="w-full md:w-1/3 h-full">
                  <div className="h-full bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 flex flex-col">
                    <div className="flex flex-col items-center flex-grow">
                      <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/50 mb-4">
                        <span className="text-5xl font-bold text-primary">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white">{name}</h2>
                      <p className="text-gray-400">@{userName}</p>
                      <p className="text-gray-400 text-sm mt-1">{email}</p>

                      <div className="mt-6 w-full flex justify-center">
                        <div className="bg-gray-900/50 p-3 rounded-lg text-center w-full max-w-xs">
                          <div className="text-2xl font-bold text-primary">
                            {rating}
                          </div>
                          <div className="text-xm text-gray-400">Rating</div>
                        </div>
                      </div>

                      <div className="mt-6 w-full flex-grow">
                        <h4 className="text-lg font-bold text-white mb-3">
                          Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Member Since</span>
                            <span className="text-white">
                              {new Date(createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Last Active</span>
                            <span className="text-white">
                              {new Date(updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="w-full md:w-2/3 h-full">
                  <div className="h-full bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-6">
                      Player Statistics
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <StatCard
                        title="Highest Rating"
                        value={highestRating}
                        icon="⭐"
                        color="text-purple-400"
                      />
                      <StatCard
                        title="Win Percentage"
                        value={`${winPercentage}%`}
                        icon="📊"
                        color="text-purple-400"
                      />
                      <StatCard
                        title="Total Games Played"
                        value={totalGames}
                        icon="🎮"
                        color="text-blue-400"
                      />
                      <StatCard
                        title="Games Won"
                        value={wins}
                        icon="🏆"
                        color="text-green-400"
                      />
                    </div>

                    <div className="mt-8">
                      <h4 className="text-lg font-bold text-white mb-4">
                        Rating Progress
                      </h4>
                      <div className="w-full h-64 bg-gray-900/50 p-4 rounded-lg">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={ratingHistory}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#444"
                            />
                            <XAxis
                              dataKey="date"
                              stroke="#aaa"
                              tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getFullYear()}-${(
                                  date.getMonth() + 1
                                )
                                  .toString()
                                  .padStart(2, "0")}-${date
                                  .getDate()
                                  .toString()
                                  .padStart(2, "0")}`;
                              }}
                              tick={{ fontSize: 12 }}
                              angle={-30}
                              textAnchor="end"
                              height={60}
                            />

                            <YAxis stroke="#aaa" />
                            <Tooltip content={<CustomTooltip />} />

                            <Line
                              type="monotone"
                              dataKey="rating"
                              stroke="#8884d8"
                              strokeWidth={2}
                              dot={{ r: 3.5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Log Out
            </button>
            <Link
              to="/profile/edit"
              className="bg-primary hover:bg-primary/80 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-gray-900/50 p-4 rounded-lg">
    <div className="flex items-center gap-3">
      <span className={`text-2xl ${color}`}>{icon}</span>
      <div>
        <h4 className="text-gray-400 text-sm">{title}</h4>
        <p className="text-white font-bold text-xl">{value}</p>
      </div>
    </div>
  </div>
);

export default Profile;
