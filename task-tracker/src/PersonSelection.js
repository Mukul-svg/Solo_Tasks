// PersonSelection.js

import React from 'react';

const PersonSelection = ({ onSelectPerson }) => {
  const persons = ['Person1', 'Person2', 'Person3', 'Person4'];

  return (
    <div className="person-selection">
      <h2>Choose a person:</h2>
      <div className="person-buttons">
        {persons.map((person) => (
          <button key={person} onClick={() => onSelectPerson(person)}>
            {person}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PersonSelection;
