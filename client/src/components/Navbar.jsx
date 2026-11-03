
import React from 'react';
import { useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const pageNames = {
    '/': 'Dashboard',
    '/products': 'Products',
    '/inventory': 'Inventory',
    '/suppliers': 'Suppliers',
    '/customers': 'Customers',
    '/purchases': 'Purchases',
    '/orders': 'Sales & Orders',
    '/production': 'Production',
    '/reports': 'Reports'
  };

  const currentPage =
    pageNames[location.pathname] || 'SmartBiz ERP';

  return (
    <header className="top-navbar">
      <div className="navbar-heading">
        <h3>{currentPage}</h3>
        <p>Welcome to SmartBiz ERP Management System.</p>
      </div>
    </header>
  );
}

export default Navbar;
