import React from 'react';
import { Link } from 'react-router-dom';

const Custom404Page: React.FC = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  const suggestions = [
    { path: '/', label: 'Return to Home', icon: '🏠' },
    { path: '/wellness', label: 'Wellness Resources', icon: '🌱' },
    { path: '/chat', label: 'Chat Support', icon: '💬' },
    { path: '/community', label: 'Community', icon: '👥' }
  ];

  return (
    <main className="error-page-container">
      <div className="error-page-content">
        {/* Decorative Element */}
        <div className="error-illustration" aria-hidden="true">
          <div className="error-number">404</div>
          <div className="error-icon">🧭</div>
        </div>

        {/* Main Content */}
        <div className="error-content">
          <h1 className="error-title">
            Page Not Found
          </h1>
          
          <p className="error-description">
            We couldn&apos;t find the page you&apos;re looking for. It might have been moved, 
            deleted, or you may have typed the URL incorrectly.
          </p>

          {/* Action Buttons */}
          <div className="error-actions">
            <button 
              onClick={handleGoBack}
              className="btn btn-primary"
              type="button"
            >
              <span aria-hidden="true">←</span>{' '}
              Go Back
            </button>
            
            <Link 
              to="/" 
              className="btn btn-secondary"
            >
              <span aria-hidden="true">🏠</span>{' '}
              Home Page
            </Link>
          </div>

          {/* Helpful Suggestions */}
          <div className="error-suggestions">
            <h2 className="suggestions-title">
              Where would you like to go?
            </h2>
            
            <nav className="suggestions-nav" aria-label="Helpful navigation links">
              <ul className="suggestions-list">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.path}>
                    <Link 
                      to={suggestion.path} 
                      className="suggestion-link"
                      aria-label={`Go to ${suggestion.label}`}
                    >
                      <span className="suggestion-icon" aria-hidden="true">
                        {suggestion.icon}
                      </span>
                      <span className="suggestion-label">
                        {suggestion.label}
                      </span>
                      <span className="suggestion-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Search Box */}
          <div className="error-search">
            <h3 className="search-title">
              Or search for what you need:
            </h3>
            
            <form 
              className="search-form" 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('search') as string;
                if (query.trim()) {
                  // Navigate to search results or homepage with query
                  window.location.href = `/?search=${encodeURIComponent(query)}`;
                }
              }}
            >
              <div className="search-input-group">
                <label htmlFor="error-search-input" className="sr-only">
                  Search for content
                </label>
                <input
                  id="error-search-input"
                  type="text"
                  name="search"
                  placeholder="Search for wellness resources, chat support..."
                  className="search-input"
                  aria-describedby="search-help"
                />
                <button 
                  type="submit" 
                  className="search-btn"
                  aria-label="Search"
                >
                  <span aria-hidden="true">🔍</span>
                </button>
              </div>
              <small id="search-help" className="search-help">
                Try searching for wellness, chat, community, or resources
              </small>
            </form>
          </div>

          {/* Contact Information */}
          <div className="error-contact">
            <p className="contact-text">
              Still need help? Our support team is here for you.
            </p>
            
            <div className="contact-options">
              <Link 
                to="/contact" 
                className="contact-link"
                aria-label="Contact our support team"
              >
                <span aria-hidden="true">📧</span>{' '}
                Contact Support
              </Link>
              
              <Link 
                to="/chat" 
                className="contact-link"
                aria-label="Start a chat conversation"
              >
                <span aria-hidden="true">💬</span>{' '}
                Live Chat
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb for Context */}
      <nav aria-label="Breadcrumb" className="error-breadcrumb">
        <ol className="breadcrumb-list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li aria-current="page">
            404 Error
          </li>
        </ol>
      </nav>

      {/* Screen Reader Announcement */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        Page not found. You are now on the 404 error page. Use the navigation links or search to find what you&apos;re looking for.
      </div>
    </main>
  );
};

export default Custom404Page;
