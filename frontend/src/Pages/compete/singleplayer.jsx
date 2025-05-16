import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav";
import { getValidHectoDigits } from "../../components/test Algo/generateProblem";
import { solveHectoForDigits } from "../../components/test Algo/solver";

const SinglePlayer = () => {
    const navigate = useNavigate();
    const [expression, setExpression] = useState("");
    const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
    const [activeModal, setActiveModal] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const [currentProblem, setCurrentProblem] = useState(null);
    const [showGiveUpModal, setShowGiveUpModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(5 * 60);
  
    const [user, setUser] = useState({
        name: "You",
        rating: 1200,
        avatar: "👨‍💻",
        attempts: []
    });

    useEffect(() => {
      const loadProblem = async () => {
        setIsLoading(true);
        let validDigits;
        let solutions;
        do {
          const generated = await getValidHectoDigits();
          validDigits = generated.digits;
          solutions = solveHectoForDigits(validDigits.split(""));
        } while (solutions.length === 0);
  
        setCurrentProblem({
          id: 1,
          title: validDigits.split("").join(" "),
          description: "By using any of the given operators [+,-,*,/,(,),^] make this sequence equal to 100 without changing the order",
        });
        setIsLoading(false);
      };
  
      loadProblem();
    }, []);
  
    useEffect(() => {
        if (timeLeft <= 0) {
            setActiveModal('timeUp');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    if (isLoading) return (
        <div className="min-h-screen bg-dark flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
                <p className="text-white text-lg">Generating challenge...</p>
            </div>
        </div>
    );
  
    const numbers = currentProblem.title.split(" ").filter((char) => /\d/.test(char));
    const operators = ["+", "-", "×", "÷", "^", "(", ")"];
  
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleButtonClick = (handler) => (e) => {
        if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
        }
    };

    const handleNextNumber = () => {
      if (currentNumberIndex < numbers.length && !disableControls) {
        if (expression.length > 0 && /\d/.test(expression.slice(-1))) return;
        setExpression(prev => prev + numbers[currentNumberIndex]);
        setCurrentNumberIndex(prev => prev + 1);
        setValidationError(null);
      }
    };
  
    const handleOperatorClick = (char) => () => {
      if (!disableControls) {
        setExpression(prev => prev + char);
        setValidationError(null);
      }
    };
  
    const handleUndo = () => {
      if (!disableControls && expression.length > 0) {
        const lastChar = expression.slice(-1);
        setExpression(prev => prev.slice(0, -1));
        if (/\d/.test(lastChar)) {
          setCurrentNumberIndex(prev => Math.max(0, prev - 1));
        }
        setValidationError(null);
      }
    };
  
    const handleClear = () => {
      if (!disableControls) {
        setExpression("");
        setCurrentNumberIndex(0);
        setValidationError(null);
      }
    };

    const calculateCurrentResult = () => {
        if (!expression) return null;
        
        if (/(\d{2,})/.test(expression)) return "AdjacentDigits";
        
        try {
            const formatted = expression
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/\^/g, "");  // Convert ^ to ** for exponentiation
            
            return eval(formatted);
        } catch {
            return "Invalid";
        }
    };
  
    const handleSubmit = () => {
        if (disableControls) return;

        const result = calculateCurrentResult();
        if (result === "Invalid" || result === "AdjacentDigits") {
            setActiveModal('invalidExpression');
            setLastResult(result === "AdjacentDigits" 
                ? "Cannot have adjacent digits!" 
                : "Invalid expression!");
            return;
        }

        const newAttempt = {
            number: user.attempts.length + 1,
            timestamp: formatTime(5 * 60 - timeLeft),
            expression,
            result,
            correct: result === 100
        };

        setUser(prev => ({ ...prev, attempts: [...prev.attempts, newAttempt] }));

        if (result === 100) {
            setActiveModal('success');
            setExpression("");
            setCurrentNumberIndex(0);
        } else {
            setActiveModal('wrongAnswer');
            setLastResult(result);
        }
    };
  
    const handleModalConfirm = () => {
      if (activeModal === "success") {
        navigate("/play", {
          state: {
            user: {
              ...user,
              attempts: [...user.attempts.filter(a => a.correct)]
            },
            opponent: {
              name: "TrainerBot",
              avatar: "🤖",
              rating: 1200,
              attempts: [],
            },
            result: "win",
          },
        });
      } else {
        setActiveModal(null);
      }
    };
  
    const handleGiveUp = () => {
      if (!disableControls) {
        setShowGiveUpModal(true);
      }
    };
  
    const confirmGiveUp = () => {
      setShowGiveUpModal(false);
      navigate('/play');
    };
  
    const cancelGiveUp = () => {
      setShowGiveUpModal(false);
    };
  
    const disableControls = timeLeft <= 0;
    const disableSubmit = disableControls || 
                         currentNumberIndex < numbers.length || 
                         validationError || 
                         !expression;
  
    return (
      <div className="min-h-screen bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-secondary/20 to-dark"></div>
        <Nav />
  
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4 flex flex-col gap-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Sequence: {currentProblem.title}</h2>
                  <div className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-green-500'}`}>
                      {formatTime(timeLeft)}
                  </div>
                </div>
                <p className="text-gray-300">{currentProblem.description}</p>
              </div>
    
              <div className="bg-gray-800 rounded-lg p-6">
                <label className="block text-white font-medium mb-2">Your Solution</label>
                <div className="my-2 p-4 border border-gray-700 rounded bg-gray-700 min-h-12 text-white font-mono text-lg">
                  {expression || "Start building your equation..."}
                </div>
    
                {validationError && (
                  <div className="mb-4 p-2 bg-gray-900 rounded text-center">
                    <span className="text-red-500 font-bold">{validationError}</span>
                  </div>
                )}
    
                <div className="mb-4">
                  <button
                    onClick={handleButtonClick(handleNextNumber)}
                    onKeyDown={handleButtonClick(handleNextNumber)}
                    tabIndex={currentNumberIndex >= numbers.length || disableControls || (expression.length > 0 && /\d/.test(expression.slice(-1))) ? -1 : 0}
                    disabled={currentNumberIndex >= numbers.length || disableControls || (expression.length > 0 && /\d/.test(expression.slice(-1)))}
                    className={`w-full py-3 mb-4 rounded-lg ${
                      currentNumberIndex >= numbers.length || disableControls || (expression.length > 0 && /\d/.test(expression.slice(-1)))
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
                      onClick={handleOperatorClick(op)}
                      onKeyDown={handleButtonClick(handleOperatorClick(op))}
                      tabIndex={disableControls ? -1 : 0}
                      disabled={disableControls}
                      className={`p-3 rounded-lg bg-primary/10 hover:bg-primary/20 font-bold text-xl text-primary ${
                        disableControls ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary focus:outline-none'
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
                    tabIndex={disableControls || expression.length === 0 ? -1 : 0}
                    disabled={disableControls || expression.length === 0}
                    className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
                  >
                    Undo
                  </button>
                  <button
                    onClick={handleButtonClick(handleClear)}
                    onKeyDown={handleButtonClick(handleClear)}
                    tabIndex={disableControls || expression.length === 0 ? -1 : 0}
                    disabled={disableControls || expression.length === 0}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-red-400 focus:outline-none transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
    
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={handleButtonClick(handleSubmit)}
                  onKeyDown={handleButtonClick(handleSubmit)}
                  tabIndex={disableSubmit ? -1 : 0}
                  disabled={disableSubmit}
                  className={`bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-lg ${
                    disableSubmit ? "bg-gray-600 cursor-not-allowed" : "focus:ring-2 focus:ring-primary focus:outline-none"
                  } transition-colors`}
                >
                  {disableControls ? 'Time Expired' : 
                   currentNumberIndex < numbers.length ? 'Use All Numbers First' : 
                   validationError ? 'Fix Expression' : 
                   'Submit Solution'}
                </button>
                <button
                  onClick={handleButtonClick(handleGiveUp)}
                  onKeyDown={handleButtonClick(handleGiveUp)}
                  tabIndex={disableControls ? -1 : 0}
                  disabled={disableControls}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-red-400 focus:outline-none transition-colors"
                >
                  Give Up
                </button>
              </div>
            </div>

            <div className="lg:w-1/4 bg-gray-800 rounded-xl p-6 border border-gray-700 h-fit sticky top-4">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center border-2 border-blue-500/30 mr-4">
                  <span className="text-2xl font-bold text-blue-400">{user.avatar}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user.name}</h2>
                  <div className="text-gray-400">Rating: {user.rating}</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-3">Your Attempts</h3>
              {user.attempts.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {user.attempts.map(attempt => (
                    <div key={attempt.number} className={`bg-gray-900/50 p-3 rounded-lg border ${attempt.correct ? 'border-green-500/30' : 'border-red-500/30'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-white">Attempt #{attempt.number}</span>
                        <span className={`px-2 py-1 text-xs rounded ${attempt.correct ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {attempt.correct ? '✓' : `✗ (${attempt.result})`}
                        </span>
                      </div>
                      <div className="text-sm font-mono bg-gray-800 p-2 rounded mt-1 break-all">
                        {attempt.expression}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {attempt.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 italic">No attempts yet</div>
              )}
            </div>
          </div>
        </div>
  
        {activeModal === "success" && (
          <GameModal
            emoji="🎉"
            title="Correct!"
            message="Your solution is correct. Great job!"
            onConfirm={handleModalConfirm}
            buttonText="Continue"
          />
        )}
  
        {activeModal === "wrongAnswer" && (
          <GameModal
            emoji="❌"
            title="Incorrect Answer"
            message={`Your result was ${lastResult}. Try again!`}
            onConfirm={handleModalConfirm}
            buttonText="Try Again"
          />
        )}
  
        {activeModal === "invalidExpression" && (
          <GameModal
            emoji="⚠"
            title="Invalid Expression"
            message={lastResult}
            onConfirm={handleModalConfirm}
            buttonText="Okay"
          />
        )}

        {activeModal === "timeUp" && (
          <GameModal
            emoji="⏱"
            title="Time's Up!"
            message="The time limit for this challenge has ended."
            onConfirm={handleModalConfirm}
            buttonText="Continue"
          />
        )}
  
        {showGiveUpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
              <div className="text-center">
                <div className="text-5xl mb-4">🤔</div>
                <h3 className="text-2xl font-bold text-white mb-2">Are you sure?</h3>
                <p className="text-gray-300 mb-6">Do you really want to give up this challenge?</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={cancelGiveUp}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmGiveUp}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Give Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};

const GameModal = ({ emoji, title, message, onConfirm, buttonText }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
        <div className="text-center">
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
    </div>
);
  
export default SinglePlayer;