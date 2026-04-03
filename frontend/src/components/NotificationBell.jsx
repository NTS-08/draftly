import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import '../css/NotificationBell.css';

export default function NotificationBell({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications for:', userEmail);
      const response = await fetch(`http://localhost:3001/api/notifications/${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Received notifications:', data);
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleAccept = async (notificationId) => {
    setLoading(true);
    try {
      console.log('Accepting notification:', notificationId);
      const response = await fetch(`http://localhost:3001/api/notifications/${notificationId}/accept`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Remove from list
        setNotifications(notifications.filter(n => n.id !== notificationId));
        alert('Invitation accepted! The document is now in your list.');
        // Refresh the page to show the new document
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation');
    }
    setLoading(false);
  };

  const handleReject = async (notificationId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/${notificationId}/reject`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Remove from list
        setNotifications(notifications.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      alert('Failed to reject invitation');
    }
    setLoading(false);
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell style={{ width: '20px', height: '20px' }} />
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button onClick={() => setShowDropdown(false)} className="close-notif-button">
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="notification-item">
                  <div className="notification-content">
                    <p className="notification-title">
                      <strong>{notif.fromEmail}</strong> invited you to edit
                    </p>
                    <p className="notification-doc-title">"{notif.documentTitle}"</p>
                  </div>
                  <div className="notification-actions">
                    <button 
                      className="accept-button"
                      onClick={() => handleAccept(notif.id)}
                      disabled={loading}
                    >
                      <Check style={{ width: '16px', height: '16px' }} />
                      Accept
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleReject(notif.id)}
                      disabled={loading}
                    >
                      <X style={{ width: '16px', height: '16px' }} />
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
