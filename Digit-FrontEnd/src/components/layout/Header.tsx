import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/images/logo.svg';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="left-section">
          <div className="logo-container">
            <Link to="/" className="logo">
              <img src={logo} alt="City of Mayorville Logo" className="logo-image" />
        
            </Link>
          </div>
          <nav className="main-nav">
            <ul className="nav-list">
              <li className="nav-item"><Link to="/">Your Government <span className="dropdown-arrow">▾</span></Link></li>
              <li className="nav-item"><Link to="/">Online Services <span className="dropdown-arrow">▾</span></Link></li>
              <li className="nav-item"><Link to="/">Our Community <span className="dropdown-arrow">▾</span></Link></li>
              <li className="nav-item"><Link to="/">Business <span className="dropdown-arrow">▾</span></Link></li>
              <li className="nav-item"><Link to="/">Policies and Procedures <span className="dropdown-arrow">▾</span></Link></li>
            </ul>
          </nav>
        </div>
        <div className="search-container">
          <input type="text" placeholder="Search" className="search-input" />
        </div>
      </div>
    </header>
  );
};

export default Header;
