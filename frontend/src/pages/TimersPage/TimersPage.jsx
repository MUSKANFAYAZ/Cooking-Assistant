import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import Timer from '../../components/Timer/Timer';
import './TimersPage.css';
import { useAuth } from '../../context/AuthContext';
import { getUserTimers as apiGetUserTimers, setUserTimers as apiSetUserTimers } from '../../services/apiService';

const TimersPage = () => {
  const { currentUser } = useAuth();

  // Initialize empty; we'll load from server if logged in, else from localStorage
  const [timers, setTimers] = useState([]);

  const [timerName, setTimerName] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(10);

  // Save timers to localStorage only for guests (not logged in)
  useEffect(() => {
    if (currentUser) return; // don't write to localStorage for authenticated users
    try {
      localStorage.setItem('timers', JSON.stringify(timers));
    } catch (error) {
      console.error('Could not save guest timers to localStorage', error);
    }
  }, [timers, currentUser]);

  // 3b. If logged in, load timers from backend on login/change
  useEffect(() => {
    const load = async () => {
      if (currentUser) {
        try {
          const serverTimers = await apiGetUserTimers();
          if (Array.isArray(serverTimers)) {
            setTimers(serverTimers);
          } else {
            setTimers([]);
          }
        } catch (e) {
          console.warn('Failed to load timers from server:', e?.message || e);
        }
      } else {
        // Guest mode: load from localStorage
        try {
          const savedTimers = localStorage.getItem('timers');
          setTimers(savedTimers ? JSON.parse(savedTimers) : []);
        } catch (error) {
          console.error('Could not load guest timers from localStorage', error);
          setTimers([]);
        }
      }
    };
    load();
  }, [currentUser]);

  // 3c. If logged in, persist timers to backend whenever they change
  useEffect(() => {
    const save = async () => {
      if (!currentUser) return;
      try {
        await apiSetUserTimers(timers);
      } catch (e) {
        console.warn('Failed to save timers to server:', e?.message || e);
      }
    };
    save();
  }, [timers, currentUser]);

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