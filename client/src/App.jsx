
import './App.css';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Purchases from './pages/Purchases';
import Orders from './pages/Orders';
import Production from './pages/Production';
import Reports from './pages/Reports';

import ModulePage from './pages/ModulePage';

import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="app-container">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <div className="page-content">

          <Routes>

            {/* Dashboard */}
            <Route
              path="/"
              element={<Dashboard />}
            />

            {/* Product Management */}
            <Route
              path="/products"
              element={<Products />}
            />

            {/* Inventory Management */}
            <Route
              path="/inventory"
              element={<Inventory />}
            />

            {/* Supplier Management */}
            <Route
              path="/suppliers"
              element={<Suppliers />}
            />

            {/* Customer Management */}
            <Route
              path="/customers"
              element={<Customers />}
            />

            {/* Purchase Management */}
            <Route
              path="/purchases"
              element={<Purchases />}
            />

            {/* Sales & Orders Management */}
            <Route
              path="/orders"
              element={<Orders />}
            />

            {/* Production Management */}
            <Route
              path="/production"
              element={<Production />}
            />

            {/* Reports & Analytics */}
            <Route
              path="/reports"
              element={<Reports />}
            />

            {/* Page Not Found */}
            <Route
              path="*"
              element={
                <ModulePage
                  title="Page Not Found"
                  description="The requested page does not exist."
                />
              }
            />

          </Routes>

        </div>

      </main>

    </div>
  );
}

export default App;
