
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get('/api/reports/summary');
      setReport(response.data);
    } catch (err) {
      console.error('Reports error:', err);
      setError(err.response?.data?.message || 'Unable to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = amount =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  const formatDateTime = (date) => {
    if (!date) return 'N/A';

    const dateValue = new Date(date);

    if (Number.isNaN(dateValue.getTime())) return 'N/A';

    return dateValue.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const lowStockProducts = report?.lowStockProducts || [];
  const recentOrders = report?.recentOrders || [];
  const recentPurchases = report?.recentPurchases || [];
  const monthlySales = report?.monthlySales || [];

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthlyData = monthNames.map((month, index) => {
    const data = monthlySales.find(
      item => Number(item.month) === index + 1
    );

    return {
      month,
      total: Number(data?.total || 0)
    };
  });

  const maxMonthlySales = Math.max(
    ...monthlyData.map(item => item.total),
    1
  );

  // Compare actual completed sales and received purchases
  const comparisonMax = Math.max(
    Number(report?.totalSales || 0),
    Number(report?.totalPurchases || 0),
    1
  );

  // Product breakdown from the recent orders returned by the API.
  // This is not a complete all-time product sales report.
  const productSales = {};

  recentOrders.forEach(order => {
    if (order.status === 'Completed') {
      (order.items || []).forEach(item => {
        const name = item.productName || 'Unknown Product';

        productSales[name] =
          (productSales[name] || 0) + Number(item.quantity || 0);
      });
    }
  });

  const topProducts = Object.entries(productSales)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const productionRate = report?.totalProductions
    ? Math.round(
        (report.completedProductions / report.totalProductions) * 100
      )
    : 0;

  if (loading) {
    return (
      <div className="reports-page">
        <h2>Loading Reports...</h2>
        <p style={{ color: '#bdbdbd' }}>
          Fetching your business analytics.
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="reports-page">
        <div className="panel">
          <h2>Reports unavailable</h2>
          <p style={{ color: '#ff7777' }}>
            {error || 'Unable to load reports.'}
          </p>
          <button className="btn btn-primary" onClick={fetchReports}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* Page Heading */}

      <div className="page-heading">
        <div>
          <h2>Reports & Analytics</h2>
          <p style={{ color: '#bdbdbd' }}>
            Monitor your business performance and statistics.
          </p>
        </div>

        <button className="btn btn-primary" onClick={fetchReports}>
          ↻ Refresh Reports
        </button>
      </div>

      {/* Business Summary */}

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Products</h3>
          <h2>{report.totalProducts}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Stock</h3>
          <h2>{report.totalStock}</h2>
          <small>Units available</small>
        </div>

        <div className="stat-card">
          <h3>Total Customers</h3>
          <h2>{report.totalCustomers}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Suppliers</h3>
          <h2>{report.totalSuppliers}</h2>
        </div>

      </div>

      {/* Sales and Purchase Summary */}

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Completed Sales</h3>
          <h2>{formatCurrency(report.totalSales)}</h2>
        </div>

        <div className="stat-card">
          <h3>Received Purchases</h3>
          <h2>{formatCurrency(report.totalPurchases)}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <h2>{report.totalOrders}</h2>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <h2>{report.pendingOrders}</h2>
        </div>

      </div>

      {/* Production Summary */}

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Production Orders</h3>
          <h2>{report.totalProductions}</h2>
        </div>

        <div className="stat-card">
          <h3>Completed Production</h3>
          <h2>{report.completedProductions}</h2>
        </div>

        <div className="stat-card">
          <h3>Completed Sales Orders</h3>
          <h2>{report.completedOrders}</h2>
        </div>

        <div className="stat-card">
          <h3>Low Stock Products</h3>
          <h2>{report.lowStockCount}</h2>
        </div>

      </div>

      {/* Sales and Purchase Comparison */}

      <div className="panel" style={{ marginBottom: '22px' }}>

        <div className="panel-header">
          <h3>Sales vs Purchases</h3>
        </div>

        <p style={{ color: '#bdbdbd' }}>
          Comparison of completed sales and received purchases.
        </p>

        <div style={{ marginTop: '25px' }}>

          <div style={{ marginBottom: '25px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <strong>Completed Sales</strong>
              <strong style={{ color: '#ffe600' }}>
                {formatCurrency(report.totalSales)}
              </strong>
            </div>

            <div style={{
              height: '16px',
              background: '#333',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(report.totalSales / comparisonMax) * 100}%`,
                background: 'linear-gradient(90deg, #ffe600, #ff5722)',
                borderRadius: '10px'
              }} />
            </div>
          </div>

          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <strong>Received Purchases</strong>
              <strong style={{ color: '#08d9a0' }}>
                {formatCurrency(report.totalPurchases)}
              </strong>
            </div>

            <div style={{
              height: '16px',
              background: '#333',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(report.totalPurchases / comparisonMax) * 100}%`,
                background: 'linear-gradient(90deg, #08d9a0, #087f83)',
                borderRadius: '10px'
              }} />
            </div>
          </div>

        </div>
      </div>

      {/* Monthly Sales Graph */}

      <div className="panel" style={{ marginBottom: '22px' }}>

        <div className="panel-header">
          <h3>Monthly Sales Analysis</h3>
          <span className="panel-badge">
            {new Date().getFullYear()}
          </span>
        </div>

        <p style={{ color: '#bdbdbd' }}>
          Actual sales from completed orders, month by month.
        </p>

        <div
          className="chart"
          style={{
            height: '260px',
            marginTop: '25px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            gap: '10px',
            padding: '15px 5px 0'
          }}
        >
          {monthlyData.map(item => {
            const height = item.total > 0
              ? Math.max((item.total / maxMonthlySales) * 100, 3)
              : 0;

            return (
              <div
                className="chart-column"
                key={item.month}
                style={{
                  flex: 1,
                  height: '100%',
                  minWidth: 0
                }}
              >
                <div
                  className="chart-bar"
                  title={`${item.month}: ${formatCurrency(item.total)}`}
                  style={{
                    height: `${height}%`,
                    width: '75%',
                    margin: '0 auto',
                    minHeight: item.total > 0 ? '5px' : '0',
                    borderRadius: '7px 7px 0 0',
                    background: 'linear-gradient(to top, #ed3025, #ff8c00, #ffe600)'
                  }}
                />

                <small>{item.month}</small>
              </div>
            );
          })}
        </div>

        <p style={{
          color: '#bdbdbd',
          fontSize: '13px',
          marginTop: '15px'
        }}>
          Hover over a bar to see its monthly sales amount.
        </p>

      </div>

      {/* Production Performance */}

      <div className="panel" style={{ marginBottom: '22px' }}>

        <div className="panel-header">
          <h3>Production Performance</h3>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '15px'
        }}>
          <div>
            <p style={{ color: '#bdbdbd' }}>Completed Production</p>
            <h2 style={{ color: '#ffe600' }}>
              {report.completedProductions}
            </h2>
          </div>

          <div>
            <p style={{ color: '#bdbdbd' }}>Total Production Orders</p>
            <h2>{report.totalProductions}</h2>
          </div>

          <div>
            <p style={{ color: '#bdbdbd' }}>Completion Rate</p>
            <h2 style={{ color: '#08d9a0' }}>
              {productionRate}%
            </h2>
          </div>
        </div>

        <div style={{
          height: '16px',
          background: '#333',
          borderRadius: '10px',
          overflow: 'hidden',
          marginTop: '20px'
        }}>
          <div style={{
            height: '100%',
            width: `${productionRate}%`,
            background: 'linear-gradient(90deg, #08d9a0, #ffe600)',
            borderRadius: '10px'
          }} />
        </div>

      </div>

      {/* Product Breakdown */}

      <div className="panel" style={{ marginBottom: '22px' }}>

        <div className="panel-header">
          <h3>Products in Recent Completed Orders</h3>
        </div>

        <p style={{ color: '#bdbdbd' }}>
          Quantity sold in the recent completed orders returned by the API.
        </p>

        {topProducts.length > 0 ? (
          topProducts.map(product => (
            <div
              key={product.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: '1px solid #444'
              }}
            >
              <strong>{product.name}</strong>
              <span style={{ color: '#ffe600' }}>
                {product.quantity} units
              </span>
            </div>
          ))
        ) : (
          <p style={{ color: '#bdbdbd', padding: '15px 0' }}>
            No completed order product details available.
          </p>
        )}

      </div>

      {/* Low Stock Report */}

      <div className="panel" style={{ marginBottom: '22px' }}>

        <div className="panel-header">
          <h3>Low Stock Products</h3>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Available Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    All products have sufficient stock.
                  </td>
                </tr>
              ) : (
                lowStockProducts.map(product => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.quantity}</td>
                    <td>{product.reorderLevel}</td>
                    <td>
                      <span className="status-badge pending">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Sales Orders */}

      <div className="panel" style={{ marginBottom: '22px' }}>

        <div className="panel-header">
          <h3>Recent Sales Orders</h3>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No sales orders available.
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>
                      {order.customer && typeof order.customer === 'object'
                        ? order.customer.name || 'Unknown'
                        : 'Unknown'}
                    </td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Purchases */}

      <div className="panel">

        <div className="panel-header">
          <h3>Recent Purchases</h3>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Purchase ID</th>
                <th>Supplier</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Purchase Date &amp; Time</th>
                <th>Received Date &amp; Time</th>
              </tr>
            </thead>

            <tbody>
              {recentPurchases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No purchase records available.
                  </td>
                </tr>
              ) : (
                recentPurchases.map(purchase => (
                  <tr key={purchase._id}>
                    <td>{purchase.purchaseNumber}</td>
                    <td>
                      {purchase.supplier && typeof purchase.supplier === 'object'
                        ? purchase.supplier.name || 'Unknown'
                        : 'Unknown'}
                    </td>
                    <td>{formatCurrency(purchase.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${purchase.status.toLowerCase()}`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td>{formatDateTime(purchase.createdAt)}</td>
                    <td>
                      {purchase.receivedAt
                        ? formatDateTime(purchase.receivedAt)
                        : 'Not received'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

export default Reports;
