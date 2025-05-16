import React, { useState, useEffect } from 'react';
import Nav from '../../components/Nav';

const SpectatorMode = () => {
    const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
    const [currentProblem, setCurrentProblem] = useState({
        id: 1,
        title: "1 2 3 4 5 6",
        description: "By using any of given operator[+,-,*,/,(,),^] make this sequence answer as 100 without changing the sequence",
        correctSolution: "1 + 2 + 3 - 4 + 5 + 6" // Correct solution
    });

    // Player data with solution history (now in chronological order)
    const [players, setPlayers] = useState([
        { 
            id: 'CodeMaster42', 
            rating: 2450, 
            rank: 1,
            solutions: [
                { attempt: '1 * 2 * 3 * 4 + 5 - 6', time: '04:45', isCorrect: false, attemptNumber: 1 },
                { attempt: '1 + 2 * 3 + 4 * 5 * 6', time: '03:22', isCorrect: false, attemptNumber: 2 },
                { attempt: '1 + 2 + 3 - 4 + 5 + 6', time: '01:15', isCorrect: true, attemptNumber: 3 }
            ],
            hasSolved: true
        },
        { 
            id: 'AlgorithmQueen', 
            rating: 2350, 
            rank: 2,
            solutions: [
                { attempt: '(1 + 2 + 3) * (4 + 5) - 6', time: '04:30', isCorrect: false, attemptNumber: 1 },
                { attempt: '1 * (2 + 3) * 4 * 5 - 6', time: '02:45', isCorrect: false, attemptNumber: 2 }
            ],
            hasSolved: false
        }
    ]);

    // Simulate player submissions
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
            
            // Simulate new submissions randomly
            if (Math.random() > 0.95 && timeLeft > 120) {
                const playerIdx = Math.floor(Math.random() * players.length);
                if (!players[playerIdx].hasSolved) {
                    const newPlayers = [...players];
                    const isCorrect = Math.random() > 0.7 && timeLeft < 180;
                    const newSolution = {
                        attempt: isCorrect ? currentProblem.correctSolution : generateRandomSolution(),
                        time: formatTime(timeLeft),
                        isCorrect,
                        attemptNumber: newPlayers[playerIdx].solutions.length + 1
                    };
                    
                    newPlayers[playerIdx].solutions.push(newSolution); // Add to end (chronological order)
                    newPlayers[playerIdx].hasSolved = isCorrect;
                    setPlayers(newPlayers);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, players]);

    // Helper function to generate random solutions
    const generateRandomSolution = () => {
        const operators = ['+', '-', '*', '/', '(', ')', '^'];
        const numbers = [1, 2, 3, 4, 5, 6];
        let solution = '';
        
        numbers.forEach((num, i) => {
            solution += num;
            if (i < numbers.length - 1) {
                solution += ` ${operators[Math.floor(Math.random() * operators.length)]} `;
            }
        });
        
        return solution;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleExit = () => {
        if (window.confirm('Are you sure you want to exit spectator mode?')) {
            window.location.href = '/';
        }
    };

    return (
        <div className="min-h-screen bg-dark relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-secondary/20 to-dark"></div>
            <Nav />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Problem and Timer Section */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4">Current Problem</h2>
                            <h3 className="text-lg text-primary mb-2">{currentProblem.title}</h3>
                            <div className="text-gray-300 whitespace-pre-line">
                                {currentProblem.description}
                            </div>
                            <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-800">
                                <p className="text-green-400 font-medium">Correct Solution:</p>
                                <code className="text-white font-mono">{currentProblem.correctSolution}</code>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                            <h2 className="text-xl font-bold text-white mb-4">Match Timer</h2>
                            <div className={`text-4xl font-mono font-bold ${
                                timeLeft < 60 ? 'text-red-500' : 'text-green-500'
                            }`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="mt-4 text-gray-400">
                                {players.some(p => p.hasSolved) ? (
                                    <span className="text-green-400">Problem solved!</span>
                                ) : (
                                    "Waiting for correct solution..."
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Players Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {players.map((player, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-bold text-xl">{player.rank}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{player.id}</h3>
                                        <p className="text-gray-400">Rating: {player.rating}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    player.hasSolved ? 'bg-green-500/20 text-green-400' : 
                                    player.solutions.length > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
                                }`}>
                                    {player.hasSolved ? 'Solved!' : 
                                     player.solutions.length > 0 ? 'Attempting...' : 'Thinking...'}
                                </span>
                            </div>

                            <div className="mt-6 space-y-3 max-h-96 overflow-y-auto pr-2">
                                {player.solutions.length > 0 ? (
                                    player.solutions.map((solution, sIdx) => (
                                        <div key={sIdx} className={`p-4 rounded-lg border ${
                                            solution.isCorrect ? 
                                                'bg-green-900/30 border-green-800' : 
                                                'bg-gray-700/50 border-gray-600'
                                        }`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-400 text-sm">Attempt #{solution.attemptNumber}</span>
                                                <span className="text-gray-400 text-sm">{solution.time}</span>
                                            </div>
                                            <code className="text-white font-mono text-lg block mb-2">{solution.attempt}</code>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    solution.isCorrect ? 
                                                        'bg-green-500/20 text-green-400' : 
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {solution.isCorrect ? 'CORRECT' : 'INCORRECT'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No solutions submitted yet
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <button
                        onClick={handleExit}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                    >
                        Exit Spectator Mode
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpectatorMode;