import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import Timer from '../../components/Timer/Timer';
import './TimersPage.css';

const TimersPage = () => {
  // 2. Load initial timers from localStorage
  const [timers, setTimers] = useState(() => {
    try {
      const savedTimers = localStorage.getItem('timers');
      return savedTimers ? JSON.parse(savedTimers) : [];
    } catch (error) {
      console.error("Could not load timers from localStorage", error);
      return [];
    }
  });

  const [timerName, setTimerName] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(10);

  // 3. Save timers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('timers', JSON.stringify(timers));
    } catch (error) {
      console.error("Could not save timers to localStorage", error);
    }
  }, [timers]); // This effect runs every time the 'timers' array is updated

  const addTimer = (e) => {
    e.preventDefault();
    if (!timerMinutes > 0) return;
    
    const newTimer = {
      id: Date.now(),
      name: timerName || `Timer #${timers.length + 1}`,
      minutes: parseInt(timerMinutes, 10),
    };

    setTimers([...timers, newTimer]);
    setTimerName('');
  };

  const removeTimer = (id) => {
    setTimers(timers.filter(timer => timer.id !== id));
  };

  return (
    <div className="timers-page">
      <h1 className="timers-title">Cooking Timers</h1>
      
      <form onSubmit={addTimer} className="add-timer-form">
        <input 
          type="text"
          value={timerName}
          onChange={(e) => setTimerName(e.target.value)}
          placeholder="Timer Name (e.g., 'Boil Pasta')"
          className="timer-input"
        />
        <input 
          type="number"
          value={timerMinutes}
          onChange={(e) => setTimerMinutes(e.target.value)}
          min="1"
          className="timer-input number"
        />
        <span>minutes</span>
        <button type="submit" className="add-button">Add Timer</button>
      </form>

      <div className="timers-list">
        {timers.length > 0 ? (
          timers.map(timer => (
            <Timer 
              key={timer.id} 
              name={timer.name} 
              initialMinutes={timer.minutes}
              onRemove={() => removeTimer(timer.id)} 
            />
          ))
        ) : (
          <p className="no-timers-message">Add a timer to get started!</p>
        )}
      </div>
    </div>
  );
};

export default TimersPage;