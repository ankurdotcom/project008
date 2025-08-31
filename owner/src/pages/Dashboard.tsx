import React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import '../App.css';

const Dashboard: React.FC = () => {
  const salesData = useSelector((state: RootState) => state.sales);

  return (
    <div className="dashboard">
      <h1>Grocery Owner Dashboard</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p>${salesData.totalSales.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Sales</h3>
          <p>${salesData.todaySales.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
