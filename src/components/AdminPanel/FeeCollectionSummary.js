import React, { useState, useEffect } from 'react';

const FeeCollectionSummary = () => {
  const [summaryData, setSummaryData] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');
  const [filters, setFilters] = useState({
    course: '',
    year: '',
    semester: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCollectionSummary();
  }, [activeTab, filters]);

  const fetchCollectionSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        period: activeTab,
        ...filters
      });

      const response = await fetch(`http://localhost:5000/api/reports/collections?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSummaryData(prev => ({
          ...prev,
          [activeTab]: data
        }));
      } else {
        setMessage('Failed to fetch collection summary');
      }
    } catch (error) {
      setMessage('Error fetching collection summary: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getTotalCollection = (data) => {
    return data.reduce((sum, item) => sum + item.totalCollection, 0);
  };

  const getTotalPayments = (data) => {
    return data.reduce((sum, item) => sum + item.totalPayments, 0);
  };

  const renderSummaryTable = () => {
    const data = summaryData[activeTab] || [];

    if (loading) {
      return <div className="loading">Loading collection summary...</div>;
    }

    if (data.length === 0) {
      return <div className="no-data">No collection data available for the selected period.</div>;
    }

    return (
      <div className="summary-container">
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Collection</h3>
            <p className="amount">{formatCurrency(getTotalCollection(data))}</p>
          </div>
          <div className="summary-card">
            <h3>Total Payments</h3>
            <p className="count">{getTotalPayments(data)}</p>
          </div>
          <div className="summary-card">
            <h3>Average per Payment</h3>
            <p className="amount">
              {getTotalPayments(data) > 0
                ? formatCurrency(getTotalCollection(data) / getTotalPayments(data))
                : formatCurrency(0)}
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Total Collection</th>
                <th>Total Payments</th>
                <th>Payment Types</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item._id.course}</td>
                  <td>{item._id.year}</td>
                  <td>{item._id.semester}</td>
                  <td className="amount-cell">{formatCurrency(item.totalCollection)}</td>
                  <td>{item.totalPayments}</td>
                  <td>
                    {item.paymentTypes?.map((type, idx) => (
                      <div key={idx} className="payment-type">
                        {type.type}: {formatCurrency(type.totalAmount)} ({type.count} payments)
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="menu-content">
      <h1>Fee Collection Summary</h1>
      <p>Comprehensive overview of fee collections across different time periods and categories.</p>

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filter-row">
          <div className="filter-group">
            <label>Course:</label>
            <select
              value={filters.course}
              onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
            >
              <option value="">All Courses</option>
              <option value="B.A">B.A</option>
              <option value="B.Sc">B.Sc</option>
              <option value="B.Ed">B.Ed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Year:</label>
            <input
              type="number"
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              placeholder="e.g., 2024"
            />
          </div>
          <div className="filter-group">
            <label>Semester:</label>
            <select
              value={filters.semester}
              onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
            >
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="tab-navigation">
        {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
          <button
            key={period}
            className={`tab-button ${activeTab === period ? 'active' : ''}`}
            onClick={() => setActiveTab(period)}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Content */}
      <div className="tab-content">
        {renderSummaryTable()}
      </div>

      <style>{`
        .menu-content {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .message {
          padding: 10px;
          margin: 10px 0;
          border-radius: 4px;
          font-weight: bold;
        }

        .message.error {
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #ef5350;
        }

        .message.success {
          background-color: #e8f5e8;
          color: #2e7d32;
          border: 1px solid #4caf50;
        }

        .filters-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .filter-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          min-width: 150px;
        }

        .filter-group label {
          margin-bottom: 5px;
          font-weight: bold;
        }

        .filter-group select,
        .filter-group input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .tab-navigation {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }

        .tab-button {
          padding: 12px 24px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-button.active {
          border-bottom-color: #007bff;
          background-color: #007bff;
          color: white;
          font-weight: bold;
        }

        .tab-button:hover {
          background-color: #f8f9fa;
        }

        .summary-container {
          margin-top: 20px;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }

        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
          text-transform: uppercase;
        }

        .summary-card .amount {
          font-size: 24px;
          font-weight: bold;
          color: #28a745;
          margin: 0;
        }

        .summary-card .count {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          margin: 0;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .summary-table {
          width: 100%;
          border-collapse: collapse;
        }

        .summary-table th,
        .summary-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .summary-table th {
          background: #f8f9fa;
          font-weight: bold;
          color: #333;
        }

        .amount-cell {
          font-weight: bold;
          color: #28a745;
        }

        .payment-type {
          margin-bottom: 4px;
          font-size: 12px;
          color: #666;
        }

        .loading, .no-data {
          text-align: center;
          padding: 40px;
          font-size: 16px;
          color: #666;
        }

        .no-data {
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default FeeCollectionSummary;
