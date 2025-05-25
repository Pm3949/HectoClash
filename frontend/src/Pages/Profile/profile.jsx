import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { removeAuthUser } from "../../redux/userSlice.js";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.user);
  const name = authUser?.name || "Guest";
  const username = authUser?.userName || "User101";
  const useremail = authUser?.email || "No email provided";
  const rating = authUser?.rating;
  const totalGames = authUser?.stats?.gamesPlayed || 0;
  const wins = authUser?.stats?.wins || 0;
  const highestRating = authUser?.highestRating || 0;

  const winPercentage =
    totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const handleLogout = async () => {
    try {
      const res = await axios.get(`https://hectoclash-backend.onrender.com/api/users/logout`);
      toast.success(res.data.message);
      dispatch(removeAuthUser());
      navigate("/");
    } catch (error) {
      console.log("logout")
      toast.error(error.response.data.message);
    }
  };

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
                      <p className="text-gray-400">@{username}</p>
                      <p className="text-gray-400 text-sm mt-1">{useremail}</p>

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
                              {/* {new Date(user.joinDate).toLocaleDateString()} */}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Last Active</span>
                            <span className="text-white">
                              {/* {new Date(user.lastActive).toLocaleDateString()} */}
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
                    {/* 
                    <div className="mt-8">
                      <h4 className="text-lg font-bold text-white mb-4">
                        Achievements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {user.achievements.map((achievement, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div> */}

                    {/* <div className="mt-8 flex-grow">
                      <h4 className="text-lg font-bold text-white mb-4">
                        Recent Activity
                      </h4>
                      <div className="space-y-3">
                        <ActivityItem
                          title="Solved 'Fibonacci Sequence' problem"
                          time="2 hours ago"
                          icon="✅"
                        />
                        <ActivityItem
                          title="Reached new rating high: 2450"
                          time="1 day ago"
                          icon="📈"
                        />
                        <ActivityItem
                          title="Competed in Weekly Challenge"
                          time="3 days ago"
                          icon="⚔"
                        />
                        <ActivityItem
                          title="Solved 'Prime Numbers' challenge"
                          time="5 days ago"
                          icon="✅"
                        />
                      </div>
                    </div> */}
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

// Reusable Activity Item
const ActivityItem = ({ title, time, icon }) => (
  <div className="flex items-start gap-3 p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
    <span className="text-xl">{icon}</span>
    <div>
      <p className="text-white">{title}</p>
      <p className="text-gray-400 text-xs">{time}</p>
    </div>
  </div>
);

export default Profile;
