import React, { useState, useEffect } from 'react';

const ManageFees = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('structures');
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLog, setShowAuditLog] = useState(false);

  useEffect(() => {
    fetchFeeStructures();
    fetchPayments();
    fetchAuditLogs();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/fees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFeeStructures(data);
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/audit-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const deleteFeeStructure = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee structure?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/fees/structure/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Fee structure deleted successfully!');
        fetchFeeStructures();
      } else {
        setMessage('Failed to delete fee structure');
      }
    } catch (error) {
      setMessage('Error deleting fee structure: ' + error.message);
    }
  };

  const updatePaymentStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setMessage('Payment status updated successfully!');
        fetchPayments();
      } else {
        setMessage('Failed to update payment status');
      }
    } catch (error) {
      setMessage('Error updating payment status: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#28a745';
      case 'Pending': return '#ffc107';
      case 'Failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="menu-content">
      <h1>Manage Fees</h1>
      <p>Manage fee structures and monitor payments for all courses.</p>

      {message && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: message.includes('Error') || message.includes('Failed') ? '#ffebee' : '#e8f5e8',
          color: message.includes('Error') || message.includes('Failed') ? '#c62828' : '#2e7d32'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('structures')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'structures' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Fee Structures
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'payments' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Payment Records
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'audit' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Audit Logs
        </button>
      </div>

      {activeTab === 'structures' && (
        <div>
          <h3>Fee Structures</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {feeStructures.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Course</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Fee Components</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Total Amount</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feeStructures.map(structure => (
                    <tr key={structure._id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {structure.course}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {Object.entries(structure.feeComponents).map(([key, value]) => (
                          <div key={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ₹{value}
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        ₹{structure.totalFee}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <button
                          onClick={() => deleteFeeStructure(structure._id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No fee structures found.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <h3>Payment Records</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {payments.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Student ID</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Course</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Year</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Semester</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment._id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {payment.studentId}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {payment.course}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {payment.year}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {payment.semester}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {payment.paymentType}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        ₹{payment.amount}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: getStatusColor(payment.status),
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {payment.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {payment.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updatePaymentStatus(payment._id, 'Paid')}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginRight: '5px'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(payment._id, 'Failed')}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No payment records found.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div>
          <h3>Audit Logs</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {auditLogs.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Action</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Details</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log._id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {log.action}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {log.user}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No audit logs found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFees;
