import { useState, useEffect, useRef } from 'react'
import './Timer.css' // We'll create this file next

// Helper: interpolate between two colors
function lerpColor(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

// Helper: convert rgb array to hex
function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// Helper: convert rgb array to rgba string
function rgbToRgba([r, g, b], alpha) {
  return `rgba(${r},${g},${b},${alpha})`;
}

// Color stops: yellow, orange, red (green is handled separately)
const COLOR_STOPS = [
  [255, 255, 0],    // yellow
  [255, 140, 0],    // orange
  [255, 0, 0],      // red
];
const GREEN = [0, 255, 0];
const RED = [255, 0, 0];

function getGradientColor(percent) {
  if (percent >= 1) return rgbToHex(COLOR_STOPS[0]);
  if (percent <= 0) return rgbToHex(COLOR_STOPS[2]);
  const n = COLOR_STOPS.length - 1;
  const scaled = percent * n;
  const idx = Math.floor(scaled);
  const t = scaled - idx;
  return rgbToHex(lerpColor(COLOR_STOPS[idx], COLOR_STOPS[idx + 1], t));
}

function getGradientRgb(percent) {
  if (percent >= 1) return COLOR_STOPS[0];
  if (percent <= 0) return COLOR_STOPS[2];
  const n = COLOR_STOPS.length - 1;
  const scaled = percent * n;
  const idx = Math.floor(scaled);
  const t = scaled - idx;
  return lerpColor(COLOR_STOPS[idx], COLOR_STOPS[idx + 1], t);
}

function App() {
  const [timeInSeconds, setTimeInSeconds] = useState(5 * 60); // Default: 5 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isNegative, setIsNegative] = useState(false);
  const [initialTime, setInitialTime] = useState(5 * 60);
  const [color, setColor] = useState('#00ff00');
  const [glow, setGlow] = useState('rgba(0,255,0,0.7)');
  const lastTimeRef = useRef(null);
  const requestRef = useRef(null);

  // Format time as MM:SS (no minus sign)
  const formatTime = (seconds) => {
    const absSeconds = Math.abs(seconds);
    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = Math.floor(absSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Animation frame based timer for smooth countdown
  const animateTimer = (timestamp) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    const elapsed = timestamp - lastTimeRef.current;
    if (elapsed > 1000) {
      setTimeInSeconds(prevTime => {
        const newTime = prevTime - 1;
        // Check for negative time
        if (newTime < 0 && !isNegative) {
          setIsNegative(true);
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

  // Color logic
  useEffect(() => {
    if (isNegative || timeInSeconds <= 10) {
      setColor('#ff0000');
      setGlow('rgba(255,0,0,0.7)');
      return;
    }
    // Stay green for the first 5 seconds
    if (timeInSeconds > initialTime - 5) {
      setColor('#00ff00');
      setGlow('rgba(0,255,0,0.7)');
      return;
    }
    // Gradient for the rest
    const gradientDuration = initialTime - 14; // Exclude first 5s and last 10s
    const elapsed = initialTime - 5 - timeInSeconds + 1; // +1 to avoid red at transition
    const percent = Math.max(0, Math.min(1, elapsed / gradientDuration));
    const hex = getGradientColor(percent);
    const rgb = getGradientRgb(percent);
    setColor(hex);
    setGlow(rgbToRgba(rgb, 0.7));
  }, [timeInSeconds, isNegative, initialTime]);

  // Handle start/pause
  const toggleTimer = () => {
    setIsRunning(prevState => !prevState);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimeInSeconds(initialTime);
    setIsNegative(false);
    lastTimeRef.current = null;
  };

  // Set custom time (in minutes)
  const setCustomTime = (minutes) => {
    if (!isRunning) {
      setTimeInSeconds(minutes * 60);
      setInitialTime(minutes * 60);
      setIsNegative(false);
    }
  };
  
  // Set custom time in seconds directly
  const setCustomTimeInSeconds = (seconds) => {
    if (!isRunning) {
      setTimeInSeconds(seconds);
      setInitialTime(seconds);
      setIsNegative(false);
    }
  };

  // Get timer display classes based on state
  const getTimerClasses = () => {
    let classes = "timer-display";
    
    if (isNegative) {
      classes += " overtime";
    }
    
    return classes;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      }
      if (!isRunning && e.key >= '1' && e.key <= '9') {
        setCustomTime(Number(e.key));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning]);

  return (
    <div className="presentation-timer">
      <div className={getTimerClasses()}>
        {isNegative && (
          <div className="overtime-label">OVERTIME</div>
        )}
        <span className="time" style={{ color, textShadow: `0 0 20px ${glow}` }}>{formatTime(timeInSeconds)}</span>
      </div>
      
      <div className="timer-controls">
        <div className="time-presets">
          <button onClick={() => setCustomTime(3)}>3:00</button>
          <button onClick={() => setCustomTime(5)}>5:00</button>
          <button onClick={() => setCustomTime(7)}>7:00</button>
          <button onClick={() => setCustomTime(10)}>10:00</button>
          {/* Testing buttons */}
          <button onClick={() => setCustomTimeInSeconds(5)} className="test-btn">0:05</button>
          <button onClick={() => setCustomTimeInSeconds(65)} className="test-btn">1:05</button>
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
