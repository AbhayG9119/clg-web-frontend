import React, { useState } from 'react';
import ExpenseEntry from './ExpenseEntry';
import ExpenseReports from './ExpenseReports';

const ExpenseManagement = () => {
  const [activeTab, setActiveTab] = useState('entry');

  return (
    <div className="menu-content">
      <h1>Expense Management</h1>
      <p>Track daily expenses and generate reports.</p>

      <div className="button-group" style={{ marginBottom: '20px' }}>
        <button
          className={`btn ${activeTab === 'entry' ? 'active' : ''}`}
          onClick={() => setActiveTab('entry')}
        >
          Expense Entry
        </button>
        <button
          className={`btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Expense Reports
        </button>
      </div>

      {activeTab === 'entry' && <ExpenseEntry />}
      {activeTab === 'reports' && <ExpenseReports />}
    </div>
  );
};

export default ExpenseManagement;
