  import React, { useState, useEffect } from 'react';
  import { useNavigate, useLocation } from 'react-router-dom';
  import axios from 'axios';
  import { useSelector } from 'react-redux';

  const MatchResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [match, setMatch] = useState(null);
    const [result, setResult] = useState(null);

const playerId = location.state?.playerId;

    useEffect(() => {
      const fetchMatchData = async () => {
        try {
          // Get matchId from navigation state or URL
          const matchId = location.state?.matchId || window.location.pathname.split('/').pop();
          
          if (matchId) {
            const response = await axios.get(`http://localhost:8080/api/match/${matchId}`);
            const apiData = response.data.match; // Access the match object from response
            // console.log(apiData);
            
            setMatch(apiData);
            
            // Determine result based on match data
            let resultStatus;
            
            if (apiData.winner === null) {
              resultStatus = 'draw';
            } else {
            resultStatus = apiData.winner?._id === playerId ? 'win' : 'loss';
            }
            
            setResult(resultStatus);
          }
        } catch (err) {
          console.error('Error fetching match data:', err);
          setError('Failed to load match data');
        } finally {
          setLoading(false);
        }
      };

      fetchMatchData();
    }, [location.state, playerId]);

    // console.log("Match",match);
    const calculateStats = () => {
      if (!match) return null;

      const isPlayer1 = match.player1._id === playerId;
      const user = isPlayer1 ? match.player1 : match.player2;
      const opponent = isPlayer1 ? match.player2 : match.player1;

      let ratingChange = 0;
      if (result === 'win') ratingChange = 10;
      else if (result === 'loss') ratingChange = -5;

      return {
        user,
        opponent,
        ratingChange,
        matchResult: result,
        newUserRating: user.rating + ratingChange,
        oldUserRating: user.rating,
      };
    };

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading match data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    if (!match) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
          <div className="text-center">
            <p>No match data available</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    
    const stats = calculateStats();

    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Match Result</h1>

          {/* Result Banner */}
          <div className={`p-4 rounded-lg mb-8 text-center ${
            stats.matchResult === 'win'
              ? 'bg-green-900'
              : stats.matchResult === 'loss'
              ? 'bg-red-900'
              : 'bg-yellow-900'
          }`}>
            <h2 className="text-2xl font-bold">
              {stats.matchResult === 'win'
                ? '🎉 You Won!'
                : stats.matchResult === 'loss'
                ? '😞 You Lost'
                : '🤝 Match Draw'}
            </h2>
            {stats.matchResult !== 'draw' && (
              <p className="mt-2">
                {stats.ratingChange > 0 ? '+' : ''}
                {stats.ratingChange} Rating ({stats.oldUserRating} → {stats.newUserRating})
              </p>
            )}
          </div>

          {/* Player Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* User */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center border-2 border-blue-500/30 mr-4">
                  <span className="text-2xl font-bold text-blue-400">
                    {stats.user.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">@{stats.user.userName}</h3>
                  <div className="text-gray-400">
                    Rating: {stats.newUserRating}
                    {stats.matchResult !== 'draw' && (
                      <span className={`ml-2 ${stats.ratingChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ({stats.ratingChange > 0 ? '+' : ''}{stats.ratingChange})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Opponent */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center border-2 border-purple-500/30 mr-4">
                  <span className="text-2xl font-bold text-purple-400">
                    {stats.opponent.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">@{stats.opponent.userName}</h3>
                  <div className="text-gray-400">Rating: {stats.opponent.rating}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-4">Match Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Problem:</p>
                <p className="text-white font-mono">{match.problem}</p>
              </div>
              <div>
                <p className="text-gray-400">Duration:</p>
                <p className="text-white">
                  {Math.floor((new Date(match.endTime) - new Date(match.startTime)) / 1000)} seconds
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/play')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex-1"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex-1"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default MatchResult;