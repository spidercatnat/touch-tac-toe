import React from 'react';
import logo from './logo.svg';
import './App.css';
import { TicTacToe } from './components';

function App() {
  return (
    <div>
        <TicTacToe style={{ width: '100%', height: '98vh' }}  />
    </div>
  );
}

export default App;
