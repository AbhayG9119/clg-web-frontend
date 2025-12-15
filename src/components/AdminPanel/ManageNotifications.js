import React, { useState, useEffect } from 'react';

const ManageNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [formData, setFormData] = useState({
    recipientId: '',
    recipientRole: 'student',
    type: 'general',
    title: '',
    message: '',
    priority: 'normal',
    course: '',
    academicYear: '',
    semester: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/filters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAcademicYears(data.academicYears);
        setSemesters(data.semesters);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Notification sent successfully!');
        fetchNotifications();
        setFormData({
          recipientId: '',
          recipientRole: 'student',
          type: 'general',
          title: '',
          message: '',
          priority: 'normal',
          course: '',
          academicYear: '',
          semester: ''
        });
        setActiveTab('list');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to send notification');
      }
    } catch (error) {
      setMessage('Error sending notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientRole: formData.recipientRole,
          type: formData.type,
          title: formData.title,
          message: formData.message,
          priority: formData.priority,
          course: formData.course,
          academicYear: formData.academicYear,
          semester: formData.semester
        })
      });

      if (response.ok) {
        setMessage('Bulk notification sent successfully!');
        fetchNotifications();
        setFormData({
          recipientId: '',
          recipientRole: 'student',
          type: 'general',
          title: '',
          message: '',
          priority: 'normal',
          course: '',
          academicYear: '',
          semester: ''
        });
        setActiveTab('list');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to send bulk notification');
      }
    } catch (error) {
      setMessage('Error sending bulk notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Notification marked as read!');
        fetchNotifications();
      } else {
        setMessage('Failed to mark notification as read');
      }
    } catch (error) {
      setMessage('Error marking notification as read: ' + error.message);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'normal': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="menu-content">
      <h1>Manage Notifications</h1>
      <p>Send and manage notifications for students and staff.</p>

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
          View Notifications
        </button>
        <button
          onClick={() => setActiveTab('send')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'send' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send Individual
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'bulk' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Bulk Send
        </button>
      </div>

      {(activeTab === 'send' || activeTab === 'bulk') && (
        <div>
          <h3>{activeTab === 'send' ? 'Send Individual Notification' : 'Send Bulk Notification'}</h3>
          <form onSubmit={activeTab === 'send' ? handleSendNotification : handleBulkSend} style={{ maxWidth: '600px' }}>
            {activeTab === 'send' && (
              <div style={{ marginBottom: '15px' }}>
                <label>Recipient ID:</label>
                <input
                  type="text"
                  name="recipientId"
                  value={formData.recipientId}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
            )}
            <div style={{ marginBottom: '15px' }}>
              <label>Recipient Role:</label>
              <select
                name="recipientRole"
                value={formData.recipientRole}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Type:</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="general">General</option>
                <option value="fee">Fee Related</option>
                <option value="academic">Academic</option>
                <option value="exam">Exam</option>
                <option value="payment">Payment</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Message:</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '100px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Priority:</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Course (Optional):</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">All Courses</option>
                <option value="B.A">B.A</option>
                <option value="B.Sc">B.Sc</option>
                <option value="B.Ed">B.Ed</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Academic Year (Optional):</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">All Years</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Semester (Optional):</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">All Semesters</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
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
              {loading ? 'Sending...' : (activeTab === 'send' ? 'Send Notification' : 'Send Bulk Notification')}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          <h3>Notifications List</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Title</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Recipient</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Priority</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(notification => (
                    <tr key={notification._id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {notification.title}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {notification.type}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {notification.recipientId || `${notification.recipientRole}s`}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: getPriorityColor(notification.priority),
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {notification.priority}
                        </span>
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: notification.status === 'read' ? '#28a745' : '#ffc107',
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {notification.status === 'read' ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Mark Read
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No notifications found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNotifications;
