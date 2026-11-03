
import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '▦' },
    { name: 'Products', path: '/products', icon: '▣' },
    { name: 'Inventory', path: '/inventory', icon: '▤' },
    { name: 'Suppliers', path: '/suppliers', icon: '♙' },
    { name: 'Customers', path: '/customers', icon: '♧' },
    { name: 'Purchases', path: '/purchases', icon: '🛒' },
    { name: 'Sales & Orders', path: '/orders', icon: '▥' },
    { name: 'Production', path: '/production', icon: '⚙' },
    { name: 'Reports', path: '/reports', icon: '▧' }
  ];

  return (
    <aside className="sidebar">

      {/* Brand - no separate S logo */}
      <div className="brand">
        <div className="brand-info">
          <h2>SmartBiz</h2>
          <span>SMART BUSINESS MANAGEMENT</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin Profile */}
      <div className="sidebar-footer">
        <div className="profile-avatar">A</div>

        <div className="profile-info">
          <strong>Admin User</strong>
          <span>Administrator</span>
          <small>Owner Account</small>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;
