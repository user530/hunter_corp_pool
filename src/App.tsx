import React from 'react';
import './App.css';
import { Game } from './features/Game/Game';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>React pool</h2>
        <Game />
      </header>
    </div>
  );
}

export default App;
