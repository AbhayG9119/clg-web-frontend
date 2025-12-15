import React, { useState, useEffect } from 'react';
import '../../styles/ManageReceipts.css';

const ManageReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [formData, setFormData] = useState({
    studentId: '',
    selectedPayment: null
  });
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentPayments, setStudentPayments] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [studentNames, setStudentNames] = useState({});
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    course: '',
    year: '',
    semester: '',
    status: '',
    sessionId: ''
  });

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
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();

      if (filters.course) queryParams.append('course', filters.course);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.semester) queryParams.append('semester', filters.semester);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sessionId) queryParams.append('sessionId', filters.sessionId);

      const url = `http://localhost:5000/api/receipts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReceipts(data);

        // Collect studentIds that need name fetching
        const studentIdsToFetch = [];
        const names = {};

        for (const receipt of data) {
          if (receipt.studentName && receipt.studentName !== 'undefined undefined' && receipt.studentName.trim() !== '') {
            names[receipt.studentId] = receipt.studentName;
          } else {
            if (!studentIdsToFetch.includes(receipt.studentId)) {
              studentIdsToFetch.push(receipt.studentId);
            }
          }
        }

        // Fetch names for missing ones
        for (const studentId of studentIdsToFetch) {
          try {
            const studentResponse = await fetch(`http://localhost:5000/api/payments/student-details/${studentId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (studentResponse.ok) {
              const studentData = await studentResponse.json();
              names[studentId] = studentData.name || 'Unknown';
            }
          } catch (error) {
            console.error('Error fetching student name:', error);
            names[studentId] = 'Unknown';
          }
        }

        setStudentNames(names);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setMessage('Error fetching receipts: ' + error.message);
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

  const handleDuplicateReceipt = async (receiptId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/receipts/${receiptId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Duplicate receipt generated successfully');
        fetchReceipts();
      } else {
        setMessage('Failed to duplicate receipt');
      }
    } catch (error) {
      setMessage('Error duplicating receipt: ' + error.message);
    }
  };

  const handleCancelReceipt = async (receiptId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/receipts/${receiptId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Cancelled by admin' })
      });

      if (response.ok) {
        setMessage('Receipt cancelled successfully');
        fetchReceipts();
      } else {
        setMessage('Failed to cancel receipt');
      }
    } catch (error) {
      setMessage('Error cancelling receipt: ' + error.message);
    }
  };

  return (
    <div className="manage-receipts">
      <h2>Manage Fee Receipts</h2>

      {message && (
        <div className="message">
          {message}
          <button onClick={() => setMessage('')} className="close-message">&times;</button>
        </div>
      )}

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Course:</label>
            <select name="course" value={filters.course} onChange={handleFilterChange}>
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
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Session:</label>
            <select name="sessionId" value={filters.sessionId} onChange={handleFilterChange}>
              <option value="">All Sessions</option>
              {sessions.map(session => (
                <option key={session._id} value={session._id}>
                  {session.sessionId} ({new Date(session.startDate).getFullYear()}-{new Date(session.endDate).getFullYear()})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <button onClick={handleApplyFilters} className="apply-filters-btn">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="receipts-section">
        <h3>Receipts List</h3>
        {loading ? (
          <p>Loading receipts...</p>
        ) : receipts.length > 0 ? (
          <div className="table-container">
            <table className="receipts-table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Course</th>
                  <th>Year/Sem</th>
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
                    <td>{studentNames[receipt.studentId] || 'Loading...'}</td>
                    <td>{receipt.course}</td>
                    <td>{receipt.year}/{receipt.semester}</td>
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
                        <>
                          <button
                            onClick={() => handleDuplicateReceipt(receipt._id)}
                            className="action-button duplicate-button"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleCancelReceipt(receipt._id)}
                            className="action-button cancel-button"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-receipts">No receipts found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageReceipts;
