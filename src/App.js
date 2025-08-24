
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import './styles.css';

// Configure axios with base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const MOCK_USER_ID = 'user123';

function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`/notifications/${MOCK_USER_ID}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      const response = await axios.delete(`/notifications/${id}`);
      if (response.status === 200) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <span className="icon-like">❤️</span>;
      case 'comment': return <span className="icon-comment">💬</span>;
      case 'follow': return <span className="icon-follow">👥</span>;
      case 'post': return <span className="icon-post">📝</span>;
      case 'message': return <span className="icon-message">✉️</span>;
      default: return <span className="icon-default">📌</span>;
    }
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="notifications-loading">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="notifications-title">
          <h2>Activity Feed</h2>
          <span className="notification-count">{notifications.length}</span>
        </div>
        <div className="notifications-filters">
          <button 
                        className={'filter-button' + (filter === 'all' ? ' active' : '')}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {['like', 'comment', 'follow', 'post', 'message'].map(type => (
            <button
              key={type}
              className={'filter-button' + (filter === type ? ' active' : '')}
              onClick={() => setFilter(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}s
            </button>
          ))}
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <div className="empty-state-icon">🔍</div>
            <h3>No notifications found</h3>
            <p>When you receive notifications, they will appear here.</p>
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div 
              key={n._id} 
              className={'notification-item' + (deleting === n._id ? ' deleting' : '')}
            >
              <div className="notification-icon">
                {getIcon(n.type)}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <div className="notification-type">
                    {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                  </div>
                  <time className="notification-time">
                    {new Date(n.timestamp).toLocaleString()}
                  </time>
                </div>
                <div className="notification-text">{n.content}</div>
              </div>
              <button 
                className="delete-button"
                onClick={() => handleDelete(n._id)}
                disabled={deleting === n._id}
                title="Delete notification"
              >
                {deleting === n._id ? (
                  <div className="delete-spinner"></div>
                ) : (
                  <svg viewBox="0 0 24 24" className="delete-icon">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EventTrigger() {
  const [type, setType] = useState('like');
  const [targetUserId, setTargetUserId] = useState('user123');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');
    
    try {
      console.log('Sending event to:', axios.defaults.baseURL + '/events');
      const response = await axios.post('/events', {
        type,
        sourceUserId: MOCK_USER_ID,
        targetUserId,
        data: { content },
        timestamp: new Date().toISOString()
      });
      
      console.log('Response:', response);
      
      if (response.status === 200 || response.status === 201) {
        setContent('');
        setStatus('Event sent successfully!');
      }
    } catch (error) {
      console.error('Error sending event:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      setStatus(error.response?.data?.message || 'Failed to send event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="event-trigger-container">
      <h2>📤 Create New Event</h2>
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label>
            Event Type:
            <select 
              value={type} 
              onChange={e => setType(e.target.value)}
              className="form-select"
            >
              <option value="like">❤️ Like</option>
              <option value="comment">💬 Comment</option>
              <option value="follow">👥 Follow</option>
              <option value="post">📝 New Post</option>
              <option value="message">✉️ Message</option>
            </select>
          </label>
        </div>
        
        <div className="form-group">
          <label>
            Target User:
            <input 
              value={targetUserId} 
              onChange={e => setTargetUserId(e.target.value)}
              className="form-input"
              placeholder="Enter user ID"
            />
          </label>
        </div>
        
        <div className="form-group">
          <label>
            Message:
            <input 
              value={content} 
              onChange={e => setContent(e.target.value)}
              className="form-input"
              placeholder="Enter your message"
            />
          </label>
        </div>
        
        <button 
          type="submit" 
          className="submit-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Event'}
        </button>
        
        {status && (
          <div className={`status-message ${status.includes('success') ? 'success' : 'error'}`}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
}

function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" className="logo-svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="logo-text">
            <h1>Insyd</h1>
            <span className="logo-dot"></span>
          </div>
        </div>
        <nav className="main-nav">
          <button className="nav-button active">Notifications</button>
          <button className="nav-button">Dashboard</button>
          <button className="nav-button">Settings</button>
        </nav>
        <div className="header-actions">
          <button className="theme-toggle">🌙</button>
          <div className="user-profile">
            <span className="user-avatar">JD</span>
            <span className="user-name">John Doe</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
        <div className="app-content">
          <div className="dashboard-header">
            <h2>Notification Center</h2>
            <p className="dashboard-subtitle">Manage your notifications and alerts</p>
          </div>
          <div className="dashboard-grid">
            <EventTrigger />
            <NotificationList />
          </div>
        </div>
      </main>
      <footer className="app-footer">
        <p>© 2025 Insyd. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
