import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import Task from './components/Task';
import Timer from './components/Timer';
import './global.css';

const breakpointColumnsObj = {
  default: 3,
  1100: 2,
  700: 1
};

const App = () => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('pomodoro-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [workingTaskId, setWorkingTaskId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const addTask = (task) => {
    const newTasks = [...tasks, task];
    setTasks(newTasks);
    localStorage.setItem('pomodoro-tasks', JSON.stringify(newTasks));
  };
  
  const updateTask = (id, updatedTask) => {
    const newTasks = tasks.map(task => {
      if (updatedTask.working && task.working && task.id !== id) {
        return {...task, working: false};
      }
      if (updatedTask.removeWorking && task.id === id) {
        return {...task, working: false};
      }
      return task.id === id ? {...task, ...updatedTask} : task;
    });
    
    setTasks(newTasks);
    localStorage.setItem('pomodoro-tasks', JSON.stringify(newTasks));
    
    if (updatedTask.working) {
      setWorkingTaskId(id);
    } else if (workingTaskId === id && (updatedTask.working === false || updatedTask.removeWorking)) {
      setWorkingTaskId(null);
    }
  };
  
  const deleteTask = (id) => {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
    localStorage.setItem('pomodoro-tasks', JSON.stringify(newTasks));
  };
  
  const calculateEstimatedTime = () => {
    const activeTasks = tasks.filter(task => !task.completed);
    const totalPomodoros = activeTasks.reduce((sum, task) => sum + task.pomodoros, 0);
    const completedPomodoros = activeTasks.reduce((sum, task) => sum + (task.completedPomodoros || 0), 0);
    const remainingPomodoros = totalPomodoros - completedPomodoros;
    const totalMinutes = remainingPomodoros * 25 + 
      Math.floor((remainingPomodoros - 1) / 4) * 15 + 
      Math.floor((remainingPomodoros - 1) / 4) * 3 * 5;
    
    const now = new Date();
    const endTime = new Date(now.getTime() + totalMinutes * 60000);
    
    return endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getLocalTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  return (
    <div className="container">
      <button 
        className="hamburger-menu"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>
      
      <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <button className="analytics-toggle" onClick={() => setShowAnalytics(false)}>
          Analytics
        </button>
        <div className="auto-mode-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={autoMode}
              onChange={() => setAutoMode(!autoMode)}
            />
            Auto Mode
          </label>
        </div>
        <div className="time-info">
          <h3>Current Time: {currentTime.toLocaleTimeString()}</h3>
          <h3>Estimated Completion: {calculateEstimatedTime()}</h3>
          <h3>Timezone: {getLocalTimezone()}</h3>
        </div>
      </div>

      <div className="main-content">
        
        <div className="timer-wrapper">
          <Timer 
            workingTask={tasks.find(t => t.id === workingTaskId)} 
            onPomodoroComplete={() => {
              const task = tasks.find(t => t.id === workingTaskId);
              if (task) {
                const updates = {
                  completedPomodoros: (task.completedPomodoros || 0) + 1,
                  completedAt: new Date().toISOString()
                };
                if (updates.completedPomodoros >= task.pomodoros) {
                  updates.working = false;
                  updates.completed = true;
                }
                updateTask(task.id, updates);
              }
            }}
            autoMode={autoMode}
          />
        </div>
        <div className="time-info">
          <h2>Current Time: {currentTime.toLocaleTimeString()}</h2>
          <h2>Estimated Completion: {calculateEstimatedTime()}</h2>
          <h2>Timezone: {getLocalTimezone()}</h2>
        </div>
      
        {showAnalytics ? (
          <Analytics 
            completedTasks={tasks.filter(t => t.completedAt)} 
            onBack={() => setShowAnalytics(false)}
          />
        ) : (
          <>
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {tasks.map(task => (
                <Task 
                  key={task.id}
                  task={task}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
            </Masonry>
            <button 
              className="add-task-button"
              onClick={() => addTask({
                id: Date.now(),
                title: 'New Task',
                description: '',
                pomodoros: 1
              })}
            >
              Add Task
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;