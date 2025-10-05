import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';

const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');

const Timer = ({ initialMinutes, name, onRemove }) => {
  const initialSeconds = initialMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);
  
  // --- ADD THIS LINE ---
  // A ref to track if we have "unlocked" the audio yet
  const audioUnlocked = useRef(false);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            alarmSound.play(); // This will now be allowed to play
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  // --- MODIFY THIS FUNCTION ---
  const toggle = () => {
    // This is the one-time "unlock" for the audio.
    // It happens so fast, you won't hear it.
    if (!audioUnlocked.current) {
      alarmSound.volume = 0;
      alarmSound.play().catch(() => {}); // The browser might still throw an error here, so we catch it.
      alarmSound.pause();
      alarmSound.currentTime = 0;
      alarmSound.volume = 1;
      audioUnlocked.current = true;
    }

    setIsActive(!isActive);
  };

  const reset = () => {
    // Also stop the sound if the timer is reset while it's ringing
    alarmSound.pause();
    alarmSound.currentTime = 0;
    setIsActive(false);
    setSecondsLeft(initialSeconds);
  };

  // ... (the rest of the component is the same) ...

  const formatTime = () => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className={`timer ${secondsLeft === 0 ? 'finished' : ''}`}>
      <div className="timer-info">
        <p className="timer-name">{name}</p>
        <h2 className="timer-display">{formatTime()}</h2>
      </div>
      <div className="timer-controls">
        <button onClick={toggle} className="timer-button">
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="timer-button secondary">
          Reset
        </button>
        <button onClick={onRemove} className="timer-button remove">
          Remove
        </button>
      </div>
    </div>
  );
};

export default Timer;