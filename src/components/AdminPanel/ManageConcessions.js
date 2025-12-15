import React, { useState, useEffect } from 'react';

const ManageConcessions = () => {
  const [concessions, setConcessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [formData, setFormData] = useState({
    studentId: '',
    course: '',
    concessionType: 'Scholarship',
    amount: '',
    reason: '',
    academicYear: '',
    semester: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchConcessions();
  }, []);

  const fetchConcessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/concessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConcessions(data);
      }
    } catch (error) {
      console.error('Error fetching concessions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `http://localhost:5000/api/concessions/${editingId}`
        : 'http://localhost:5000/api/concessions';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage(editingId ? 'Concession updated successfully!' : 'Concession created successfully!');
        fetchConcessions();
        resetForm();
        setActiveTab('list');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to save concession');
      }
    } catch (error) {
      setMessage('Error saving concession: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (concession) => {
    setFormData({
      studentId: concession.studentId,
      course: concession.course,
      concessionType: concession.concessionType,
      amount: concession.amount,
      reason: concession.reason,
      academicYear: concession.academicYear,
      semester: concession.semester
    });
    setEditingId(concession._id);
    setActiveTab('create');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this concession?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/concessions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Concession deleted successfully!');
        fetchConcessions();
      } else {
        setMessage('Failed to delete concession');
      }
    } catch (error) {
      setMessage('Error deleting concession: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      course: '',
      concessionType: 'Scholarship',
      amount: '',
      reason: '',
      academicYear: '',
      semester: ''
    });
    setEditingId(null);
  };

  return (
    <div className="menu-content">
      <h1>Manage Concessions</h1>
      <p>Manage student concessions and scholarships.</p>

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
          onClick={() => setActiveTab('list')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'list' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          View Concessions
        </button>
        <button
          onClick={() => {
            setActiveTab('create');
            resetForm();
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'create' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {editingId ? 'Edit Concession' : 'Create Concession'}
        </button>
      </div>

      {activeTab === 'create' && (
        <div>
          <h3>{editingId ? 'Edit Concession' : 'Create New Concession'}</h3>
          <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label>Student ID:</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Course:</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Select Course</option>
                <option value="B.A">B.A</option>
                <option value="B.Sc">B.Sc</option>
                <option value="B.Ed">B.Ed</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Concession Type:</label>
              <select
                name="concessionType"
                value={formData.concessionType}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="Scholarship">Scholarship</option>
                <option value="Fee Waiver">Fee Waiver</option>
                <option value="Discount">Discount</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Amount:</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Reason:</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Academic Year:</label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Semester:</label>
              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
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
              {loading ? 'Saving...' : (editingId ? 'Update Concession' : 'Create Concession')}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          <h3>Concessions List</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {concessions.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Student ID</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Course</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {concessions.map(concession => (
                    <tr key={concession._id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {concession.studentId}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {concession.course}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {concession.concessionType}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        ₹{concession.amount}
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
                        <button
                          onClick={() => handleEdit(concession)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(concession._id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
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
              <p>No concessions found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageConcessions;
