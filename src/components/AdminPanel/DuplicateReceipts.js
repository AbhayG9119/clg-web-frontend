import React, { useState, useEffect } from 'react';
import '../../styles/DuplicateReceipts.css';

const DuplicateReceipts = () => {
  const [duplicateReceipts, setDuplicateReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [batches, setBatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    course: '',
    year: '',
    semester: '',
    status: '',
    sessionId: ''
  });

  useEffect(() => {
    fetchDuplicateReceipts();
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/erp/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchDuplicateReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();
      const url = `http://localhost:5000/api/receipts/duplicates/all${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDuplicateReceipts(data);
      } else {
        setMessage('Failed to fetch duplicate receipts');
      }
    } catch (error) {
      console.error('Error fetching duplicate receipts:', error);
      setMessage('Error fetching duplicate receipts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchDuplicateReceipts();
  };

  const handleDownloadReceipt = async (receiptId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/receipts/${receiptId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duplicate_receipt_${receiptId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setMessage('Failed to download receipt');
      }
    } catch (error) {
      setMessage('Error downloading receipt: ' + error.message);
    }
  };

  const handleCancelReceipt = async (receiptId) => {
    if (!window.confirm('Are you sure you want to cancel this duplicate receipt?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/receipts/${receiptId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Duplicate receipt cancelled successfully!');
        fetchDuplicateReceipts();
      } else {
        setMessage('Failed to cancel receipt');
      }
    } catch (error) {
      setMessage('Error cancelling receipt: ' + error.message);
    }
  };

  return (
    <div className="duplicate-receipts-container">
      <div className="duplicate-receipts-header">
        <h1>Duplicate Receipts</h1>
        <p>View and manage automatically generated duplicate receipts.</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('Failed') ? 'error' : ''}`}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Course:</label>
            <select
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
            >
              <option value="">All Courses</option>
              <option value="B.A">B.A</option>
              <option value="B.Sc">B.Sc</option>
              <option value="B.Ed">B.Ed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Year:</label>
            <select name="year" value={filters.year} onChange={handleFilterChange}>
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Semester:</label>
            <select name="semester" value={filters.semester} onChange={handleFilterChange}>
              <option value="">All Semesters</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Session:</label>
            <select
              name="sessionId"
              value={filters.sessionId}
              onChange={handleFilterChange}
            >
              <option value="">All Sessions</option>
              {sessions.map(session => (
                <option key={session._id} value={session._id}>
                  {session.sessionId} ({new Date(session.startDate).getFullYear()}-{new Date(session.endDate).getFullYear()})
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <button onClick={handleApplyFilters} className="apply-filters-button">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate Receipts List */}
      <div className="duplicate-receipts-list">
        <h3>Duplicate Receipts List</h3>
        {loading ? (
          <div className="loading">Loading duplicate receipts...</div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {duplicateReceipts.length > 0 ? (
              <table className="duplicate-receipts-table">
                <thead>
                  <tr>
                    <th>Duplicate Receipt No</th>
                    <th>Original Receipt No</th>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Session</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Generated Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicateReceipts.map(receipt => (
                    <tr key={receipt._id}>
                      <td>
                        {receipt.receiptNumber}
                      </td>
                      <td>
                        {receipt.originalReceiptId?.receiptNumber || 'N/A'}
                      </td>
                      <td>
                        {receipt.studentId}
                      </td>
                      <td>
                        {receipt.studentName}
                      </td>
                      <td>
                        {receipt.sessionId?.sessionId || 'N/A'}
                      </td>
                      <td>
                        ₹{receipt.amount}
                      </td>
                      <td>
                        <span className={`status-badge ${receipt.status === 'active' ? 'status-active' : 'status-cancelled'}`}>
                          {receipt.status}
                        </span>
                      </td>
                      <td>
                        {new Date(receipt.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDownloadReceipt(receipt._id)}
                          className="action-button download-button"
                        >
                          Download
                        </button>
                        {receipt.status === 'active' && (
                          <button
                            onClick={() => handleCancelReceipt(receipt._id)}
                            className="action-button cancel-button"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-duplicate-receipts">No duplicate receipts found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DuplicateReceipts;
