import React from 'react';
import { Link } from 'react-router-dom';
import './HamburgerMenu.css';

const HamburgerMenu = ({ user, onLogout, onManageUsersClick, onClose }) => {
  return (
    <div className="hamburger-menu-overlay" onClick={onClose}>
      <div className="hamburger-menu" onClick={(e) => e.stopPropagation()}> {/* Prevent clicks on menu from closing it */}
        <div className="menu-content">
          {user && (
            <div className="user-info">
              <p>Welcome, {user.email}</p>
            </div>
          )}
          <nav>
            <ul>
              <li>
                <Link to="/" onClick={onClose}>Calendar</Link>
              </li>
              <li>
                <Link to="/day" onClick={onClose}>Day View</Link>
              </li>
              <li>
                <Link to="/week" onClick={onClose}>Week View</Link>
              </li>
              <li>
                <Link to="/year" onClick={onClose}>Year View</Link>
              </li>
              {user && user.isAdmin && (
                <li>
                  <button onClick={() => { onManageUsersClick(); onClose(); }}>Manage Users</button>
                </li>
              )}
              <li>
                <button onClick={() => { onLogout(); onClose(); }}>Logout</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
