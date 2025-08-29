import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './App.css';

function Dashboard() {
  const sales = useSelector(state => state.sales);
  
  return (
    <div className="dashboard">
      <h1>Grocery Owner Dashboard</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p>${sales.total.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Sales</h3>
          <p>${sales.today.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Terminals</h3>
          <p>{sales.terminals}</p>
        </div>
      </div>
      <div className="actions">
        <button className="sync-btn">Force Sync</button>
        <button className="settings-btn">Settings</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
