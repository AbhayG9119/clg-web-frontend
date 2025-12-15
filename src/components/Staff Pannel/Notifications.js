import React, { useState, useEffect } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/notifications/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data.docs || data); // Handle pagination or direct array response
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the local state to mark the notification as read
      setNotifications(prevNotifications => prevNotifications.map(notification =>
        notification._id === notificationId ? { ...notification, status: 'read' } : notification
      ));
    } catch (err) {
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'urgent': return '#dc3545';
      case 'normal': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'payment_reminder': return '💳';
      case 'payment_overdue': return '⚠️';
      case 'payment_successful': return '✅';
      case 'fee_structure_updated': return '📊';
      case 'concession_approved': return '👍';
      case 'concession_rejected': return '👎';
      case 'receipt_generated': return '📄';
      case 'system_notification': return '🔧';
      case 'general': return '📢';
      case 'academic': return '📚';
      case 'exam': return '📝';
      default: return '🔔';
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notifications.map(notification => (
            <div key={notification._id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: notification.status === 'read' ? '#f8f9fa' : '#fff3cd', // Highlight unread notifications
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{getTypeIcon(notification.type)}</span>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{notification.title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: getPriorityColor(notification.priority),
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {notification.priority.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(notification.sentAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <p style={{ margin: '10px 0', lineHeight: '1.5' }}>{notification.message}</p>
              {notification.status !== 'read' && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
