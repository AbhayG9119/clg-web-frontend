import React, { useState, useEffect } from 'react';
import Alert from './Alert';
import ConfirmationModal from './ConfirmationModal';
import '../../styles/CancelReceipts.css';

const CancelReceipt = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    course: '',
    year: '',
    semester: '',
    status: '',
    sessionId: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchReceipts();
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

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();
      const url = `http://localhost:5000/api/receipts${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReceipts(data);
      } else {
        setMessage('Failed to fetch receipts');
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setMessage('Error fetching receipts: ' + error.message);
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
    fetchReceipts();
  };

  const handleCancelReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setCancelReason('');
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      setMessage('Please provide a reason for cancellation');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/receipts/${selectedReceipt._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (response.ok) {
        setMessage('Receipt cancelled successfully!');
        fetchReceipts();
        setShowConfirmModal(false);
        setSelectedReceipt(null);
      } else {
        setMessage('Failed to cancel receipt');
      }
    } catch (error) {
      setMessage('Error cancelling receipt: ' + error.message);
    }
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
        a.download = `receipt_${receiptId}.pdf`;
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

  const userRole = localStorage.getItem('role');
  const canCancel = userRole === 'admin';

  return (
    <div className="cancel-receipts-container">
      <div className="cancel-receipts-header">
        <h1>Cancel Receipts</h1>
        <p>View and cancel issued fee receipts. This action cannot be undone.</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('Failed') ? 'error' : ''}`}>
          {message}
        </div>
      )}

      {!canCancel && (
        <div className="warning-message">
          <p>⚠️ Only administrators can cancel receipts.</p>
        </div>
      )}

      {canCancel && (
        <>
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

          {/* Receipts List */}
          <div className="cancel-receipts-list">
            <h3>Receipts List</h3>
            {loading ? (
              <div className="loading">Loading receipts...</div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {receipts.length > 0 ? (
                  <table className="cancel-receipts-table">
                    <thead>
                      <tr>
                        <th>Receipt No</th>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Session</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map(receipt => (
                        <tr key={receipt._id}>
                          <td>{receipt.receiptNumber}</td>
                          <td>{receipt.studentId}</td>
                          <td>{receipt.studentName}</td>
                          <td>{receipt.sessionId?.sessionId || 'N/A'}</td>
                          <td>₹{receipt.amount}</td>
                          <td>
                            <span className={`status-badge ${receipt.status === 'active' ? 'status-active' : 'status-cancelled'}`}>
                              {receipt.status}
                            </span>
                          </td>
                          <td>{new Date(receipt.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              onClick={() => handleDownloadReceipt(receipt._id)}
                              className="action-button download-button"
                            >
                              Download
                            </button>
                            {receipt.status === 'active' && (
                              <button
                                onClick={() => handleCancelReceipt(receipt)}
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
                  <p className="no-receipts">No receipts found.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Cancellation"
        message={
          <div>
            <p>Are you sure you want to cancel receipt <strong>{selectedReceipt?.receiptNumber}</strong>? This action cannot be undone.</p>
            <div className="form-group">
              <label>Reason for Cancellation (Required):</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows="4"
                placeholder="Please provide a detailed reason for cancelling this receipt..."
                required
              />
            </div>
          </div>
        }
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirmModal(false)}
        confirmText="Cancel Receipt"
        cancelText="Keep Receipt"
      />
    </div>
  );
};

export default CancelReceipt;
