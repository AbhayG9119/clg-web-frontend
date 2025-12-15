import React, { useState, useEffect } from 'react';

const FeeStatusOverview = () => {
  const [statusData, setStatusData] = useState({
    paid: { count: 0, amount: 0, students: [] },
    pending: { count: 0, amount: 0, students: [] },
    overdue: { count: 0, amount: 0, students: [] }
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    course: '',
    year: '',
    semester: ''
  });
  const [message, setMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchFeeStatusOverview();
  }, [filters]);

  const fetchFeeStatusOverview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters);

      // Fetch payment statistics
      const statsResponse = await fetch(`http://localhost:5000/api/reports/payments/stats?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch defaulter reports only if course is selected
      let defaulterResponse = null;
      if (filters.course) {
        defaulterResponse = await fetch(`http://localhost:5000/api/reports/defaulters?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        let defaulterData = { totalDefaulters: 0, totalDueAmount: 0, defaulters: [] };

        if (defaulterResponse) {
          defaulterData = await defaulterResponse.json();
        }

        // Process the data
        const processedData = processStatusData(statsData, defaulterData);
        setStatusData(processedData);
      } else {
        setMessage('Failed to fetch fee status data');
      }
    } catch (error) {
      setMessage('Error fetching fee status data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const processStatusData = (statsData, defaulterData) => {
    // Calculate totals from stats data
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    statsData.forEach(stat => {
      totalPaid += stat.paid || 0;
      totalPending += stat.pending || 0;
    });

    // Overdue from defaulters
    totalOverdue = defaulterData.totalDueAmount || 0;

    return {
      paid: {
        count: statsData.reduce((sum, stat) => sum + (stat.paidCount || 0), 0),
        amount: totalPaid,
        students: [] // Would need additional API call to get student details
      },
      pending: {
        count: statsData.reduce((sum, stat) => sum + (stat.pendingCount || 0), 0),
        amount: totalPending,
        students: [] // Would need additional API call to get student details
      },
      overdue: {
        count: defaulterData.totalDefaulters || 0,
        amount: totalOverdue,
        students: defaulterData.defaulters || []
      }
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#28a745';
      case 'pending': return '#ffc107';
      case 'overdue': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderOverview = () => {
    return (
      <div className="overview-grid">
        <div className="status-card paid">
          <div className="status-icon">✓</div>
          <div className="status-content">
            <h3>Paid Fees</h3>
            <div className="status-numbers">
              <span className="count">{statusData.paid.count}</span>
              <span className="amount">{formatCurrency(statusData.paid.amount)}</span>
            </div>
          </div>
        </div>

        <div className="status-card pending">
          <div className="status-icon">⏳</div>
          <div className="status-content">
            <h3>Pending Fees</h3>
            <div className="status-numbers">
              <span className="count">{statusData.pending.count}</span>
              <span className="amount">{formatCurrency(statusData.pending.amount)}</span>
            </div>
          </div>
        </div>

        <div className="status-card overdue">
          <div className="status-icon">⚠️</div>
          <div className="status-content">
            <h3>Overdue Fees</h3>
            <div className="status-numbers">
              <span className="count">{statusData.overdue.count}</span>
              <span className="amount">{formatCurrency(statusData.overdue.amount)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailedList = (statusType) => {
    const data = statusData[statusType];
    const students = data.students || [];

    if (loading) {
      return <div className="loading">Loading {statusType} fee details...</div>;
    }

    if (students.length === 0) {
      return <div className="no-data">No {statusType} fees found.</div>;
    }

    return (
      <div className="detailed-list">
        <div className="list-header">
          <h3>{statusType.charAt(0).toUpperCase() + statusType.slice(1)} Fee Details</h3>
          <div className="summary-stats">
            <span>Total Students: {data.count}</span>
            <span>Total Amount: {formatCurrency(data.amount)}</span>
          </div>
        </div>

        <div className="table-container">
          <table className="status-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Course</th>
                <th>Year</th>
                <th>Semester</th>
                {statusType === 'overdue' && <th>Due Amount</th>}
                {statusType === 'overdue' && <th>Days Overdue</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.course}</td>
                  <td>{student.year}</td>
                  <td>{student.semester}</td>
                  {statusType === 'overdue' && (
                    <>
                      <td className="amount-cell">{formatCurrency(student.dueAmount)}</td>
                      <td className={`overdue-cell ${student.daysOverdue > 30 ? 'critical' : ''}`}>
                        {student.daysOverdue} days
                      </td>
                    </>
                  )}
                  <td>
                    <button
                      className="action-btn view-btn"
                      onClick={() => setSelectedStudent(student)}
                    >
                      View Details
                    </button>
                    {statusType === 'overdue' && (
                      <button className="action-btn notify-btn">
                        Send Reminder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStudentModal = () => {
    if (!selectedStudent) return null;

    return (
      <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Student Details</h3>
            <button className="close-btn" onClick={() => setSelectedStudent(null)}>×</button>
          </div>
          <div className="modal-body">
            <div className="student-info">
              <div className="info-row">
                <label>Student ID:</label>
                <span>{selectedStudent.studentId}</span>
              </div>
              <div className="info-row">
                <label>Name:</label>
                <span>{selectedStudent.name}</span>
              </div>
              <div className="info-row">
                <label>Course:</label>
                <span>{selectedStudent.course}</span>
              </div>
              <div className="info-row">
                <label>Year:</label>
                <span>{selectedStudent.year}</span>
              </div>
              <div className="info-row">
                <label>Semester:</label>
                <span>{selectedStudent.semester}</span>
              </div>
              {selectedStudent.dueAmount && (
                <div className="info-row">
                  <label>Due Amount:</label>
                  <span className="amount">{formatCurrency(selectedStudent.dueAmount)}</span>
                </div>
              )}
              {selectedStudent.daysOverdue && (
                <div className="info-row">
                  <label>Days Overdue:</label>
                  <span className={selectedStudent.daysOverdue > 30 ? 'critical' : ''}>
                    {selectedStudent.daysOverdue} days
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="menu-content">
      <h1>Fee Status Overview</h1>
      <p>Monitor active, pending, and overdue fees across all students.</p>

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

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'paid' ? 'active' : ''}`}
          onClick={() => setActiveTab('paid')}
        >
          Paid ({statusData.paid.count})
        </button>
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({statusData.pending.count})
        </button>
        <button
          className={`tab-button ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue ({statusData.overdue.count})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'paid' && renderDetailedList('paid')}
        {activeTab === 'pending' && renderDetailedList('pending')}
        {activeTab === 'overdue' && renderDetailedList('overdue')}
      </div>

      {/* Student Details Modal */}
      {renderStudentModal()}

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
          flex-wrap: wrap;
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

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .status-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.2s ease;
        }

        .status-card:hover {
          transform: translateY(-2px);
        }

        .status-card.paid {
          border-left: 4px solid #28a745;
        }

        .status-card.pending {
          border-left: 4px solid #ffc107;
        }

        .status-card.overdue {
          border-left: 4px solid #dc3545;
        }

        .status-icon {
          font-size: 32px;
          opacity: 0.8;
        }

        .status-content h3 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 18px;
        }

        .status-numbers {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .status-numbers .count {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
        }

        .status-numbers .amount {
          font-size: 16px;
          color: #666;
          font-weight: 500;
        }

        .detailed-list {
          margin-top: 20px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .summary-stats {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .summary-stats span {
          background: #f8f9fa;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          color: #495057;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .status-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .status-table th,
        .status-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .status-table th {
          background: #f8f9fa;
          font-weight: bold;
          color: #333;
          position: sticky;
          top: 0;
        }

        .amount-cell {
          font-weight: bold;
          color: #28a745;
        }

        .overdue-cell {
          font-weight: bold;
        }

        .overdue-cell.critical {
          color: #dc3545;
        }

        .action-btn {
          padding: 8px 16px;
          border: 2px solid;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          margin-right: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: inline-block;
          text-align: center;
          outline: none;
        }

        .view-btn {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }

        .view-btn:hover {
          background-color: #0056b3;
          border-color: #0056b3;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .view-btn:active {
          background-color: #004085;
          border-color: #004085;
          color: white;
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .view-btn:focus {
          outline: 2px solid #80bdff;
          outline-offset: 2px;
          color: white;
        }

        .notify-btn {
          background-color: #ffc107;
          color: #212529;
          border-color: #ffc107;
        }

        .notify-btn:hover {
          background-color: #e0a800;
          border-color: #e0a800;
          color: #212529;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .notify-btn:active {
          background-color: #d39e00;
          border-color: #d39e00;
          color: #212529;
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .notify-btn:focus {
          outline: 2px solid #ffecb3;
          outline-offset: 2px;
          color: #212529;
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h3 {
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 20px;
        }

        .student-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-row label {
          font-weight: bold;
          color: #555;
        }

        .info-row span {
          color: #333;
        }

        .info-row .amount {
          color: #28a745;
          font-weight: bold;
        }

        .info-row .critical {
          color: #dc3545;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default FeeStatusOverview;
