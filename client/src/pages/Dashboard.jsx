
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get('/api/reports/summary');
      setSummary(response.data);
    } catch (err) {
      console.error('Dashboard data error:', err);
      setError('Unable to load dashboard data. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const lowStockProducts = Array.isArray(summary?.lowStockProducts)
    ? summary.lowStockProducts
    : [];

  const recentOrders = Array.isArray(summary?.recentOrders)
    ? summary.recentOrders
    : [];

  // Actual monthly sales returned by the backend
  const monthlySales = Array.isArray(summary?.monthlySales)
    ? summary.monthlySales
    : [];

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const chartData = monthNames.map((month, index) => {
    const sales = monthlySales.find(
      item => Number(item.month) === index + 1
    );

    return {
      month,
      total: Number(sales?.total || 0)
    };
  });

  const maxSales = Math.max(
    ...chartData.map(item => item.total),
    1
  );

  const stats = [
    {
      title: 'Total Sales',
      value: formatCurrency(summary?.totalSales),
      change: 'Completed orders',
      icon: '₹',
      color: 'blue'
    },
    {
      title: 'Total Products',
      value: summary?.totalProducts ?? 0,
      change: `${summary?.totalStock ?? 0} units in stock`,
      icon: '▣',
      color: 'purple'
    },
    {
      title: 'Pending Orders',
      value: summary?.pendingOrders ?? 0,
      change: 'Awaiting completion',
      icon: '▤',
      color: 'orange'
    },
    {
      title: 'Low Stock Items',
      value: summary?.lowStockCount ?? lowStockProducts.length,
      change: 'Needs attention',
      icon: '⚠',
      color: 'red'
    }
  ];

  const getProductName = (order) => {
    if (order.items?.length > 0) {
      return order.items
        .map(item => item.productName)
        .filter(Boolean)
        .join(', ');
    }

    return 'No product details';
  };

  // Customer name from populated customer object
  const getCustomerName = (order) => {
    if (order.customer && typeof order.customer === 'object') {
      return order.customer.name || order.customer.company || 'Unknown Customer';
    }

    return 'Unknown Customer';
  };

  const getOrderId = (order) => {
    return order.orderNumber || order._id || 'N/A';
  };

  const getStatus = (status) => {
    if (!status) return 'Pending';

    return status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Business Overview</h2>
        <p style={{ color: '#bdbdbd' }}>
          Loading your business data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h2>Business Overview</h2>
        <p style={{ color: '#ff6b6b' }}>{error}</p>
        <button className="view-all-btn" onClick={fetchDashboardData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Dashboard Heading */}

      <div className="dashboard-heading">
        <div>
          <h2>Business Overview</h2>
          <p>Monitor your actual business performance at a glance.</p>
        </div>

        <button className="date-button">
          ◷ {new Date().getFullYear()}
        </button>
      </div>

      {/* Statistics Cards */}

      <div className="stats-grid">
        {stats.map((item) => (
          <div className="stat-card" key={item.title}>
            <div className="stat-top">
              <span>{item.title}</span>

              <div className={`stat-icon ${item.color}`}>
                {item.icon}
              </div>
            </div>

            <h2>{item.value}</h2>

            <div className="stat-change">
              {item.change}
            </div>
          </div>
        ))}
      </div>

      {/* Sales and Inventory */}

      <div className="dashboard-grid">

        {/* Sales Overview */}

        <div className="panel">

          <div className="panel-heading">
            <div>
              <h3>Sales Overview</h3>
              <p>Monthly sales performance</p>
            </div>

            <span className="panel-badge">
              {new Date().getFullYear()}
            </span>
          </div>

          <div className="sales-summary">
            <h2>{formatCurrency(summary?.totalSales)}</h2>
            <span>Based on completed sales orders</span>
          </div>

          {/* Actual Monthly Sales Bar Graph */}

          <div className="chart">

            {chartData.map((item) => {
              const barHeight = item.total > 0
                ? Math.max((item.total / maxSales) * 100, 3)
                : 0;

              return (
                <div
                  className="chart-column"
                  key={item.month}
                >
                  <div
                    className="chart-bar"
                    style={{
                      height: `${barHeight}%`
                    }}
                    title={`${item.month}: ${formatCurrency(item.total)}`}
                  />

                  <small>{item.month}</small>
                </div>
              );
            })}

          </div>

        </div>

        {/* Inventory Alerts */}

        <div className="panel">

          <div className="panel-heading">
            <div>
              <h3>Inventory Alerts</h3>
              <p>Products requiring attention</p>
            </div>

            <span className="alert-count">
              {lowStockProducts.length} Alerts
            </span>
          </div>

          {lowStockProducts.length > 0 ? (
            lowStockProducts.slice(0, 5).map((product) => (
              <div className="inventory-alert" key={product._id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>
                    Current stock: {product.quantity} units
                  </span>
                </div>

                <span className="stock-danger">
                  Low
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: '#bdbdbd', padding: '15px 0' }}>
              No low-stock products found.
            </p>
          )}

          <button
            className="view-all-btn"
            onClick={() => navigate('/inventory')}
          >
            View all inventory →
          </button>

        </div>

      </div>

      {/* Recent Orders */}

      <div className="panel orders-panel">

        <div className="panel-heading">
          <div>
            <h3>Recent Orders</h3>
            <p>Latest customer orders from your database</p>
          </div>

          <button
            className="view-orders-btn"
            onClick={() => navigate('/orders')}
          >
            View All
          </button>
        </div>

        <div className="table-responsive">

          <table className="orders-table">

            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id || order.orderNumber}>
                    <td>#{getOrderId(order)}</td>
                    <td>{getCustomerName(order)}</td>
                    <td>{getProductName(order)}</td>
                    <td>{formatCurrency(order.totalAmount)}</td>

                    <td>
                      <span
                        className={`status ${getStatus(order.status).toLowerCase()}`}
                      >
                        {getStatus(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: 'center',
                      color: '#bdbdbd',
                      padding: '25px'
                    }}
                  >
                    No orders available yet.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
