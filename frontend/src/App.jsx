import { Route, Routes } from "react-router-dom";
import Compete from "./Pages/compete/multiplayer.jsx";
import LeaderboardPage from "./Pages/Leaderboard/leaderboard.jsx";
import Profile from "./Pages/Profile/profile.jsx";
import Home from "./Pages/home/Home.jsx";
import MatchmakingPage from "./Pages/compete/matching.jsx";
import SinglePlayer from "./Pages/compete/singleplayer.jsx";
import Multiplayer from "./Pages/compete/multiplayer.jsx";
import Training from "./Pages/compete/training.jsx";
import SpectatorPage from "./Pages/Spectetor/LiveMatch.jsx";
import LiveMatches from "./Pages/Spectetor/LiveMatch.jsx";
import SpectatorMode from "./Pages/Spectetor/sepectetormode.jsx";
import SignIn from "./Pages/login/signIn.jsx";
import MatchResult from "./Pages/compete/matchResults.jsx";



function App() {
  return (
    // Remove the Router component
    <div className="min-h-screen bg-gray-900 text-white w-full">
  
      <main className="w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SignIn/>} />
          <Route path='/compete' element={<Compete />} />
          <Route path='/leaderboard' element={<LeaderboardPage />} />
          <Route path='/livematches' element={<LiveMatches />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/play" element={<MatchmakingPage />} />
          <Route path="/singleplayer" element={<SinglePlayer />} />
          <Route path="/multiplayer/:matchId" element={<Multiplayer />} />
          <Route path="/training" element={<Training />} />
          <Route path="/spectmatch/:matchId" element={<SpectatorMode />} />
          <Route path="/matchresult" element={<MatchResult />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;