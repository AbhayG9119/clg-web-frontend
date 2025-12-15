import React, { useState, useEffect } from 'react';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [promotionData, setPromotionData] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const [formData, setFormData] = useState({
    sessionId: '',
    startDate: '',
    endDate: '',
    description: '',
    department: ''
  });
  const [promotionForm, setPromotionForm] = useState({
    sessionId: '',
    targetYear: '',
    targetSemester: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePromotionInputChange = (e) => {
    const { name, value } = e.target;
    setPromotionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Date order validation
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setMessage('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/erp/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Session created successfully with ${data.generatedBatches} batches generated!`);
        setFormData({
          sessionId: '',
          startDate: '',
          endDate: '',
          description: '',
          department: ''
        });
        fetchSessions();
      } else {
        setMessage(data.message || 'Failed to create session');
      }
    } catch (error) {
      setMessage('Error creating session: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const activateSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/erp/session/${sessionId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Session activated successfully!');
        fetchSessions();
      } else {
        setMessage(data.message || 'Failed to activate session');
      }
    } catch (error) {
      setMessage('Error activating session: ' + error.message);
    }
  };

  const fetchPromotionEligibleStudents = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/promotion/eligible/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPromotionData(data);
        setSelectedSession(sessionId);
        setActiveTab('promotion');
      } else {
        setMessage('Failed to fetch promotion data');
      }
    } catch (error) {
      setMessage('Error fetching promotion data: ' + error.message);
    }
  };

  const handlePromotion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const requestData = {
        sessionId: selectedSession,
        targetYear: parseInt(promotionForm.targetYear),
        targetSemester: parseInt(promotionForm.targetSemester)
      };
      const response = await fetch('http://localhost:5000/api/promotion/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Promotion completed! Promoted: ${data.results.promoted.length}, Graduated: ${data.results.graduated.length}`);
        setPromotionForm({
          sessionId: '',
          targetYear: '',
          targetSemester: ''
        });
        // Refresh promotion data
        if (selectedSession) {
          fetchPromotionEligibleStudents(selectedSession);
        }
      } else {
        setMessage(data.message || 'Failed to promote students');
      }
    } catch (error) {
      setMessage('Error promoting students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Tab navigation
  const tabs = [
    { id: 'sessions', label: 'Sessions', icon: '📅' },
    { id: 'promotion', label: 'Student Promotion', icon: '📈' }
  ];

  return (
    <div className="menu-content">
      <h1>Session Management</h1>
      <p>Create and manage academic sessions with batch generation and student promotion.</p>

      {message && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e8',
          color: message.includes('Error') ? '#c62828' : '#2e7d32'
        }}>
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: activeTab === tab.id ? '#007bff' : '#f8f9fa',
              color: activeTab === tab.id ? 'white' : '#333',
              border: '1px solid #ddd',
              borderBottom: activeTab === tab.id ? 'none' : '1px solid #ddd',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <>
          <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
            <h3>Create New Session</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
              Creating a session will automatically generate batches for the selected course program.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label>Session ID:</label>
                <input
                  type="text"
                  name="sessionId"
                  value={formData.sessionId}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024-25"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div>
                <label>Description:</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Academic Year 2024-25"
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div>
                <label>Department:</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Select Department</option>
                  <option value="BA">BA</option>
                  <option value="BSc">BSc</option>
                  <option value="BEd">BEd</option>
                </select>
              </div>
              <div>
                <label>Start Date:</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div>
                <label>End Date:</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating...' : 'Create Session with Batches'}
            </button>
          </form>

          <h3>Existing Sessions</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {sessions.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Session ID</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Department</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Start Date</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>End Date</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Batches</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <tr key={session._id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{session.sessionId}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{session.department}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {new Date(session.startDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {new Date(session.endDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {session.batches ? session.batches.length : 0} batches
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: session.isActive ? '#d4edda' : '#f8d7da',
                          color: session.isActive ? '#155724' : '#721c24'
                        }}>
                          {session.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {!session.isActive && (
                          <button
                            onClick={() => activateSession(session.sessionId)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '5px'
                            }}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => fetchPromotionEligibleStudents(session.sessionId)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Manage Promotion
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No sessions found.</p>
            )}
          </div>
        </>
      )}

      {/* Promotion Tab */}
      {activeTab === 'promotion' && promotionData && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h3>Student Promotion Management - {promotionData.sessionId}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                <h4>Eligible for Promotion</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{promotionData.summary.eligible}</p>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                <h4>Graduated Students</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{promotionData.summary.graduated}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePromotion} style={{ marginBottom: '30px' }}>
            <h4>Promote Students</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label>Session ID:</label>
                <input
                  type="text"
                  value={selectedSession}
                  readOnly
                  style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#f8f9fa' }}
                />
              </div>
              <div>
                <label>Target Year:</label>
                <select
                  name="targetYear"
                  value={promotionForm.targetYear}
                  onChange={handlePromotionInputChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Select Year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                </select>
              </div>
              <div>
                <label>Target Semester:</label>
                <select
                  name="targetSemester"
                  value={promotionForm.targetSemester}
                  onChange={handlePromotionInputChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Select Semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Promoting...' : 'Promote Students'}
            </button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4>Eligible Students ({promotionData.eligibleForPromotion.length})</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                {promotionData.eligibleForPromotion.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Student ID</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Department</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Current Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotionData.eligibleForPromotion.map(student => (
                        <tr key={student.studentId}>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.studentId}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.name}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.department}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.currentYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: '15px', textAlign: 'center' }}>No students eligible for promotion.</p>
                )}
              </div>
            </div>

            <div>
              <h4>Graduated Students ({promotionData.graduated.length})</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                {promotionData.graduated.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Student ID</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Department</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Final Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotionData.graduated.map(student => (
                        <tr key={student.studentId}>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.studentId}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.name}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.department}</td>
                          <td style={{ padding: '8px', border: '1px solid #ddd' }}>{student.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: '15px', textAlign: 'center' }}>No graduated students.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SessionManagement;
