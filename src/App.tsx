import React from 'react';
import './App.css';
import { Pool } from './features/Pool/Pool';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>React pool</h2>
        <Pool />
      </header>
    </div>
  );
}

export default App;
