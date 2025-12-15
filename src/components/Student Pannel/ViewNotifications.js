import React, { useState, useEffect } from 'react';

const ViewNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyNotifications();
  }, []);

  const fetchMyNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        setMessage('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setMessage('Error fetching notifications: ' + error.message);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Notification marked as read!');
        fetchMyNotifications();
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
      <h1>My Notifications</h1>
      <p>View your notifications and updates.</p>

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
        {notifications.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Message</th>
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
                    {notification.message}
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
                      backgroundColor: notification.isRead ? '#28a745' : '#ffc107',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {notification.isRead ? 'Read' : 'Unread'}
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
  );
};

export default ViewNotifications;
