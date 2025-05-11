import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../global.css';





















const Task = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });

  const handleUpdate = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const handlePomodoroChange = (change) => {
    const newCount = Math.max(1, task.pomodoros + change);
    onUpdate(task.id, { pomodoros: newCount });
  };

  return (
    <motion.div
      className="task-container"
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isEditing ? (
        <>
          <input 
            value={editedTask.title} 
            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
          />
          <textarea 
            value={editedTask.description} 
            onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
          />
          <div className="task-controls">
            <button onClick={handleUpdate}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <h3 className="accent-element">{task.title}</h3>
          <p className="task-description">{task.description}</p>
          <div className="pomodoro-control">
            <button onClick={() => handlePomodoroChange(-1)}>-</button>
            <span>🍅 {task.pomodoros}</span>
            <button onClick={() => handlePomodoroChange(1)}>+</button>
          </div>
          <div className="task-controls">
            <button className="edit-button" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="delete-button" onClick={() => onDelete(task.id)}>Delete</button>
            <button className="done-button" onClick={() => onUpdate(task.id, { completed: !task.completed })}>
              {task.completed ? '✓' : 'Mark Done'}
            </button>
            {!task.completed && (
              <button className="working-button" onClick={() => onUpdate(task.id, { working: !task.working })}>
                {task.working ? 'Working...' : 'Work On'}
              </button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Task;