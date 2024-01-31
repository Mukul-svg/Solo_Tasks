// CompletedTasks.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CompletedTasks({ selectedPerson }) {
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    if (selectedPerson) {
      fetchCompletedTasks(selectedPerson);
    }
  }, [selectedPerson]);

  const fetchCompletedTasks = async (person) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/completed-tasks/${person}`);
      setCompletedTasks(response.data);
    } catch (error) {
      console.error(`Error fetching completed tasks for ${person}:`, error);
    }
  };

  return (
    <div>
      <h1>Tasks History</h1>
      <ul>
        {completedTasks.map(({ _id, count }) => (
          <li key={_id}>{`${_id}: ${count} tasks completed`}</li>
        ))}
      </ul>
    </div>
  );
}

export default CompletedTasks;
