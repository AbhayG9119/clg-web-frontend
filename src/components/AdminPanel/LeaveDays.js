import React, { useState, useEffect } from 'react';
import { staffAttendanceApi } from '../../services/adminApi';

const LeaveDays = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [leaveLoading, setLeaveLoading] = useState({});

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [leaveRequests, filter]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    const result = await staffAttendanceApi.getLeaveRequests();
    if (result.success) {
      setLeaveRequests(result.data);
    } else {
      setMessage('Failed to fetch leave requests');
    }
    setLoading(false);
  };

  const filterRequests = () => {
    if (filter === 'all') {
      setFilteredRequests(leaveRequests);
    } else {
      setFilteredRequests(leaveRequests.filter(request => request.status === filter));
    }
  };

  const handleLeaveAction = async (leaveId, status) => {
    setLeaveLoading(prev => ({ ...prev, [leaveId]: true }));
    const result = await staffAttendanceApi.updateLeaveStatus(leaveId, status);
    if (result.success) {
      setLeaveRequests(prev => prev.map(leave =>
        leave._id === leaveId ? { ...leave, status } : leave
      ));
      setMessage(`Leave ${status} successfully`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Failed to update leave status');
      setTimeout(() => setMessage(''), 3000);
    }
    setLeaveLoading(prev => ({ ...prev, [leaveId]: false }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'pending': return 'orange';
      default: return 'black';
    }
  };

  const getLeaveStats = () => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter(l => l.status === 'pending').length;
    const approved = leaveRequests.filter(l => l.status === 'approved').length;
    const rejected = leaveRequests.filter(l => l.status === 'rejected').length;
    return { total, pending, approved, rejected };
  };

  const stats = getLeaveStats();

  return (
    <div className="menu-content">
      <h1>Leave Management</h1>
      <p>Manage staff leave requests and view leave history.</p>

      {/* Statistics */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <strong>Total Requests:</strong> {stats.total}
        </div>
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <strong>Pending:</strong> {stats.pending}
        </div>
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <strong>Approved:</strong> {stats.approved}
        </div>
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <strong>Rejected:</strong> {stats.rejected}
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label>Filter by Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginLeft: '10px' }}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={fetchLeaveRequests} style={{ marginLeft: '20px', padding: '5px 10px' }}>
          Refresh
        </button>
      </div>

      {/* Message */}
      {message && <div style={{ marginBottom: '20px', color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}

      {/* Leave Requests Table */}
      {loading ? (
        <p>Loading leave requests...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Staff Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Designation</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Leave Type</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Start Date</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>End Date</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Days</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Reason</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(leave => (
              <tr key={leave._id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {leave.staffId && typeof leave.staffId === 'object' ? leave.staffId.name : 'N/A'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {leave.staffId && typeof leave.staffId === 'object' ? leave.staffId.designation : 'N/A'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{leave.type}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {new Date(leave.startDate).toLocaleDateString()}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {new Date(leave.endDate).toLocaleDateString()}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{leave.days}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{leave.reason}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <span style={{ color: getStatusColor(leave.status) }}>
                    {leave.status}
                  </span>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {leave.status === 'pending' && (
                    <div>
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'approved')}
                        disabled={leaveLoading[leave._id]}
                        style={{
                          backgroundColor: 'green',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          marginRight: '5px',
                          cursor: 'pointer',
                          borderRadius: '3px'
                        }}
                      >
                        {leaveLoading[leave._id] ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'rejected')}
                        disabled={leaveLoading[leave._id]}
                        style={{
                          backgroundColor: 'red',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          borderRadius: '3px'
                        }}
                      >
                        {leaveLoading[leave._id] ? '...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {filteredRequests.length === 0 && !loading && (
        <p>No leave requests found for the selected filter.</p>
      )}
    </div>
  );
};

export default LeaveDays;
