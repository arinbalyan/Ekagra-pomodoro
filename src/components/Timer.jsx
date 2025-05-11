import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../global.css';

const Timer = ({ initialTime = 25 * 60, workingTask, onPomodoroComplete, autoMode }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionType, setSessionType] = useState('Pomodoro');

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      
      if (isBreak) {
        // Break ended, start work session
        setIsBreak(false);
        setTimeLeft(25 * 60);
        setSessionType('Pomodoro');
        if (autoMode) setIsActive(true);
      } else {
        // Work session ended, start break
        setIsBreak(true);
        const newPomodoroCount = pomodoroCount + 1;
        setPomodoroCount(newPomodoroCount);
        const isLongBreak = newPomodoroCount % 4 === 0;
        setTimeLeft(isLongBreak ? 15 * 60 : 5 * 60);
        setSessionType(isLongBreak ? 'Long Break' : 'Short Break');
        if (autoMode) setIsActive(true);
        
        // Notify parent component about pomodoro completion
        if (workingTask) {
          onPomodoroComplete && onPomodoroComplete();
        }
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, autoMode, isBreak, pomodoroCount, workingTask, onPomodoroComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
    setIsBreak(false);
    setSessionType('Pomodoro');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSkip = () => {
    if (!isBreak) {
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      const isLongBreak = newPomodoroCount % 4 === 0;
      setTimeLeft(isLongBreak ? 15 * 60 : 5 * 60);
      setSessionType(isLongBreak ? 'Long Break' : 'Short Break');
      setIsBreak(true);
      if (autoMode) setIsActive(true);
      
      if (workingTask) {
        if ((workingTask.completedPomodoros || 0) < workingTask.pomodoros) {
          onPomodoroComplete && onPomodoroComplete();
        } else {
          onPomodoroComplete && onPomodoroComplete({removeWorking: true});
        }
      }
    } else {
      setTimeLeft(25 * 60);
      setSessionType('Pomodoro');
      setIsBreak(false);
      if (autoMode) setIsActive(true);
    }
  };

  return (
    <motion.div
      className="timer-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="timer-section">
        <h3>{sessionType}</h3>
        <h2 className="timer-display">{formatTime(timeLeft)}</h2>
        <div className="timer-info">
          <p>Pomodoro Count: {pomodoroCount}</p>
          <p>Next Long Break: {4 - (pomodoroCount % 4)} pomodoros away</p>
        </div>
        <div className="timer-controls">
          <button className="timer-button" onClick={toggleTimer}>
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button className="timer-button" onClick={resetTimer}>Reset</button>
          <button className="timer-button" onClick={handleSkip}>
            Skip
          </button>
        </div>
      </div>
      
      {workingTask && (
        <div className={`task-section ${workingTask.working ? 'working' : ''}`}>
          <h3>{workingTask.title}</h3>
          <p>{workingTask.description}</p>
          <div>
            Pomodoros: {workingTask.completedPomodoros || 0}/{workingTask.pomodoros}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Timer;