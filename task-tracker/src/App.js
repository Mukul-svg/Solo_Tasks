// App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import CompletedTasks from './CompletedTasks';
import './App.css';

function App() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [personInfo, setPersonInfo] = useState(null);

  useEffect(() => {
    if (selectedPerson) {
      fetchTasks(selectedPerson);
      fetchPersonInfo(selectedPerson);
    }
  }, [selectedPerson]);

  const fetchTasks = async (person) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tasks/${person}`);
      setTasks(response.data);
    } catch (error) {
      console.error(`Error fetching ${person}'s tasks:`, error);
    }
  };

  const fetchPersonInfo = async (person) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/persons/${person}`);
      setPersonInfo(response.data);
    } catch (error) {
      console.error(`Error fetching ${person}'s info:`, error);
    }
  };

  const markTaskCompleted = async (taskId) => {
    try {
      await axios.post(`http://localhost:5000/api/tasks/${selectedPerson}/${taskId}/complete`);
      fetchTasks(selectedPerson);
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  const selectPerson = (person) => {
    setSelectedPerson(person);
  };

  return (
    <Router>
      <div className="app-container">
        {!selectedPerson && (
          <div className="person-selection">
            <h2>Select a Person:</h2>
            <div className="person-buttons">
              <button onClick={() => selectPerson('Mukul')}>Mukul</button>
              <button onClick={() => selectPerson('Aryan')}>Aryan</button>
              <button onClick={() => selectPerson('Atharva')}>Atharva</button>
              <button onClick={() => selectPerson('Rachit')}>Rachit</button>
            </div>
          </div>
        )}

        {selectedPerson && (
          <div className="glass-box">
            <div className="title">
              <h1>{`TODAY'S TASKS - ${selectedPerson.toUpperCase()}`}</h1>
            </div>
            <div className="tasks-section">
              <ul>
                {tasks.map((task) => (
                  <li key={task._id}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => markTaskCompleted(task._id)}
                      disabled={task.completed}
                    />
                    {task.name}
                  </li>
                ))}
              </ul>
            </div>
            {personInfo && (
              <div className="person-info-section">
                <h2>{`Name: ${personInfo.name}`}</h2>
                <h2>{`Points: ${personInfo.points}`}</h2>
              </div>
            )}
            <Link to="/completed-tasks">View Tasks History</Link>
          </div>
        )}

        <Routes>
          <Route path="/completed-tasks" element={<CompletedTasks selectedPerson={selectedPerson} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
