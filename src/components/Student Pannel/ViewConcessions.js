import React, { useState, useEffect } from 'react';

const ViewConcessions = () => {
  const [concessions, setConcessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyConcessions();
  }, []);

  const fetchMyConcessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/concessions/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConcessions(data);
      } else {
        setMessage('Failed to fetch concessions');
      }
    } catch (error) {
      console.error('Error fetching concessions:', error);
      setMessage('Error fetching concessions: ' + error.message);
    }
  };

  return (
    <div className="menu-content">
      <h1>My Concessions</h1>
      <p>View your approved concessions and scholarships.</p>

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

      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {concessions.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Reason</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Academic Year</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Semester</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {concessions.map(concession => (
                <tr key={concession._id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {concession.concessionType}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    ₹{concession.amount}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {concession.reason}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {concession.academicYear}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {concession.semester}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: concession.status === 'Approved' ? '#28a745' : concession.status === 'Pending' ? '#ffc107' : '#dc3545',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {concession.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {new Date(concession.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No concessions found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewConcessions;
