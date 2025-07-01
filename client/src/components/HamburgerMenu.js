import React from 'react';
import { Link } from 'react-router-dom';
import './HamburgerMenu.css';

const HamburgerMenu = ({ user, onLogout, onManageUsersClick }) => {
  return (
    <div className="hamburger-menu">
      <div className="menu-content">
        {user && (
          <div className="user-info">
            <p>Welcome, {user.email}</p>
          </div>
        )}
        <nav>
          <ul>
            <li>
              <Link to="/">Calendar</Link>
            </li>
            <li>
              <Link to="/day">Day View</Link>
            </li>
            <li>
              <Link to="/week">Week View</Link>
            </li>
            <li>
              <Link to="/year">Year View</Link>
            </li>
            {user && user.isAdmin && (
              <li>
                <button onClick={onManageUsersClick}>Manage Users</button>
              </li>
            )}
            <li>
              <button onClick={onLogout}>Logout</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default HamburgerMenu;
