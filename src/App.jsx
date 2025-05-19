import { useState, useEffect } from 'react'

function App() {
  const [targetDate, setTargetDate] = useState('');
  const [targetName, setTargetName] = useState('');
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [savedTargets, setSavedTargets] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId;
    
    if (isRunning && targetDate) {
      intervalId = setInterval(() => {
        updateCountdown();
      }, 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [isRunning, targetDate]);

  const updateCountdown = () => {
    const currentTime = new Date().getTime();
    const targetTime = new Date(targetDate).getTime();
    const timeRemaining = targetTime - currentTime;
    
    if (timeRemaining <= 0) {
      setIsRunning(false);
      setCountdown({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      });
      return;
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    setCountdown({ days, hours, minutes, seconds });
  };

  const handleStartCountdown = () => {
    if (targetDate) {
      updateCountdown();
      setIsRunning(true);
    }
  };

  const handleStopCountdown = () => {
    setIsRunning(false);
  };

  const handleSaveTarget = () => {
    if (targetDate && targetName) {
      const newTarget = {
        id: Date.now(),
        name: targetName,
        date: targetDate
      };
      setSavedTargets([...savedTargets, newTarget]);
      
      // Optionally save to localStorage
      const updatedTargets = [...savedTargets, newTarget];
      localStorage.setItem('savedTargets', JSON.stringify(updatedTargets));
    }
  };

  const loadSavedTarget = (target) => {
    setTargetName(target.name);
    setTargetDate(target.date);
    setIsRunning(false);
  };

  const deleteSavedTarget = (id) => {
    const updatedTargets = savedTargets.filter(target => target.id !== id);
    setSavedTargets(updatedTargets);
    localStorage.setItem('savedTargets', JSON.stringify(updatedTargets));
  };

  // Load saved targets from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('savedTargets');
    if (savedData) {
      setSavedTargets(JSON.parse(savedData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-700 flex flex-col items-center justify-start p-4">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-white mb-2">CountClock</h1>
          <p className="text-blue-100">Track time to your important dates</p>
        </header>

        <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Set Your Target</h2>
              
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Event Name</label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="E.g., Birthday, Anniversary..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Target Date & Time</label>
                <input
                  type="datetime-local"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                {!isRunning ? (
                  <button
                    onClick={handleStartCountdown}
                    disabled={!targetDate}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      !targetDate
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Start Countdown
                  </button>
                ) : (
                  <button
                    onClick={handleStopCountdown}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Pause
                  </button>
                )}
                
                <button
                  onClick={handleSaveTarget}
                  disabled={!targetDate || !targetName}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    !targetDate || !targetName
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Save Target
                </button>
              </div>
            </div>
            
            {/* Display Section */}
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Time Remaining</h2>
              
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-4xl font-bold text-blue-700">{countdown.days}</div>
                  <div className="text-xs uppercase text-gray-500 font-semibold">Days</div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-4xl font-bold text-blue-700">{countdown.hours}</div>
                  <div className="text-xs uppercase text-gray-500 font-semibold">Hours</div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-4xl font-bold text-blue-700">{countdown.minutes}</div>
                  <div className="text-xs uppercase text-gray-500 font-semibold">Minutes</div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-4xl font-bold text-blue-700">{countdown.seconds}</div>
                  <div className="text-xs uppercase text-gray-500 font-semibold">Seconds</div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-lg font-medium">
                  {targetName && isRunning
                    ? `Counting down to: ${targetName}`
                    : "Set a target and start the countdown"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Saved Targets Section */}
        {savedTargets.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Saved Targets</h2>
            <div className="space-y-3">
              {savedTargets.map(target => (
                <div key={target.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div>
                    <h3 className="font-semibold text-gray-800">{target.name}</h3>
                    <p className="text-sm text-gray-600">{new Date(target.date).toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadSavedTarget(target)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSavedTarget(target.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
