import { useState, useEffect, useRef } from 'react'
import './Timer.css' // We'll create this file next

function App() {
  const [timeInSeconds, setTimeInSeconds] = useState(5 * 60); // Default: 5 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isNegative, setIsNegative] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const lastTimeRef = useRef(null);
  const requestRef = useRef(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const absSeconds = Math.abs(seconds);
    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = Math.floor(absSeconds % 60);
    
    return `${isNegative ? '-' : ''}${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Animation frame based timer for smooth countdown
  const animateTimer = (timestamp) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - lastTimeRef.current;
    
    // Update once per second
    if (elapsed > 1000) {
      setTimeInSeconds(prevTime => {
        const newTime = prevTime - 1;
        
        // Check for negative time
        if (newTime < 0 && !isNegative) {
          setIsNegative(true);
        }
        
        // Check for 1:00 warning
        if (newTime <= 60 && newTime > 0 && !isWarning) {
          setIsWarning(true);
        } else if ((newTime > 60 || newTime <= 0) && isWarning) {
          setIsWarning(false);
        }
        
        return newTime;
      });
      
      lastTimeRef.current = timestamp;
    }
    
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animateTimer);
    }
  };

  // Start or stop the timer
  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animateTimer);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning]);

  // Handle start/pause
  const toggleTimer = () => {
    setIsRunning(prevState => !prevState);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimeInSeconds(5 * 60); // Reset to 5 minutes
    setIsNegative(false);
    setIsWarning(false);
    lastTimeRef.current = null;
  };

  // Set custom time (in minutes)
  const setCustomTime = (minutes) => {
    if (!isRunning) {
      setTimeInSeconds(minutes * 60);
      setIsNegative(false);
      setIsWarning(false);
    }
  };

  // Get timer display classes based on state
  const getTimerClasses = () => {
    let classes = "timer-display";
    
    if (isWarning) {
      classes += " warning";
    }
    
    if (isNegative) {
      classes += " overtime";
    }
    
    return classes;
  };

  return (
    <div className="presentation-timer">
      <div className={getTimerClasses()}>
        <span className="time">{formatTime(timeInSeconds)}</span>
      </div>
      
      <div className="timer-controls">
        <div className="time-presets">
          <button onClick={() => setCustomTime(3)}>3:00</button>
          <button onClick={() => setCustomTime(5)}>5:00</button>
          <button onClick={() => setCustomTime(7)}>7:00</button>
          <button onClick={() => setCustomTime(10)}>10:00</button>
        </div>
        
        <div className="main-controls">
          <button className="control-btn" onClick={toggleTimer}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="control-btn" onClick={resetTimer}>Reset</button>
        </div>
      </div>
    </div>
  )
}

export default App
