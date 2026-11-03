
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [customer, setCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, customerRes, productRes] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/customers'),
        axios.get('/api/products')
      ]);

      setOrders(orderRes.data);
      setCustomers(customerRes.data);
      setProducts(productRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to load order data.');
    } finally {
      setLoading(false);
    }
  };

  // Format date and time
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

  const addItem = () => {
    const product = products.find(p => p._id === selectedProduct);
    const qty = Number(quantity);

    if (!product || !Number.isInteger(qty) || qty < 1) {
      alert('Select a product and enter a valid quantity.');
      return;
    }

    if (qty > product.quantity) {
      alert(`Only ${product.quantity} units are currently available.`);
      return;
    }

    const existing = items.find(item => item.product === product._id);

    if (existing) {
      if (existing.quantity + qty > product.quantity) {
        alert(`Only ${product.quantity} units are available.`);
        return;
      }

      setItems(items.map(item =>
        item.product === product._id
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      setItems([...items, {
        product: product._id,
        productName: product.name,
        quantity: qty,
        sellingPrice: product.sellingPrice
      }]);
    }

    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (productId) => {
    setItems(items.filter(item => item.product !== productId));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );

  const createOrder = async (e) => {
    e.preventDefault();

    if (!customer || items.length === 0) {
      alert('Select a customer and add at least one product.');
      return;
    }

    try {
      await axios.post('/api/orders', {
        customer,
        items,
        notes
      });

      alert('Sales order created successfully!');
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to create order.');
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCustomer('');
    setSelectedProduct('');
    setQuantity(1);
    setItems([]);
    setNotes('');
  };

  const updateStatus = async (id, status) => {
    if (status === 'Completed' &&
        !window.confirm('Complete this order and reduce inventory stock?')) {
      return;
    }

    try {
      await axios.put(`/api/orders/${id}/status`, { status });
      alert('Order status updated!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update order.');
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this pending order?')) return;

    try {
      await axios.delete(`/api/orders/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to delete order.');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const processingCount = orders.filter(o => o.status === 'Processing').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;

  const salesTotal = orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const formatCurrency = amount =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  return (
    <div className="orders-page">

      <div className="page-heading">
        <div>
          <h2>Sales & Orders Management</h2>
          <p style={{ color: '#bdbdbd' }}>
            Manage customer orders, sales and order status.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create Order
        </button>
      </div>

      {/* Statistics */}

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Orders</h3>
          <h2>{orders.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <h2>{pendingCount}</h2>
        </div>

        <div className="stat-card">
          <h3>Processing</h3>
          <h2>{processingCount}</h2>
        </div>

        <div className="stat-card">
          <h3>Completed Sales</h3>
          <h2>{formatCurrency(salesTotal)}</h2>
          <small>{completedCount} completed orders</small>
        </div>

      </div>

      {/* Customer Orders */}

      <div className="panel">

        <div className="panel-header">
          <h3>Customer Orders</h3>

          <input
            type="text"
            placeholder="Search order or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <div className="table-responsive">

            <table className="table">

              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Order Date & Time</th>
                  <th>Completion Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No orders found.
                    </td>
                  </tr>
                ) : filteredOrders.map(order => (
                  <tr key={order._id}>

                    <td>{order.orderNumber}</td>

                    <td>{order.customer?.name || 'Unknown'}</td>

                    <td>{order.items.length}</td>

                    <td>{formatCurrency(order.totalAmount)}</td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatDateTime(order.createdAt)}
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      {order.completedAt
                        ? formatDateTime(order.completedAt)
                        : 'Not completed'}
                    </td>

                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>

                    <td>
                      {order.status === 'Pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => updateStatus(order._id, 'Processing')}
                          >
                            Process
                          </button>{' '}

                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => updateStatus(order._id, 'Completed')}
                          >
                            Complete
                          </button>{' '}

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteOrder(order._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {order.status === 'Processing' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => updateStatus(order._id, 'Completed')}
                        >
                          Complete
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* Create Sales Order Modal */}

      {showModal && (
        <div className="modal-overlay">

          <div className="modal-content">

            <div className="modal-header">
              <h3>Create Sales Order</h3>
              <button onClick={resetForm}>×</button>
            </div>

            <form onSubmit={createOrder}>

              <div className="form-group">
                <label>Customer *</label>

                <select
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                  required
                >
                  <option value="">Select Customer</option>

                  {customers.filter(c => c.status === 'Active').map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name}{c.company ? ` - ${c.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Product</label>

                <select
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                >
                  <option value="">Select Product</option>

                  {products.filter(p => p.quantity > 0).map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} — Stock: {p.quantity} — {formatCurrency(p.sellingPrice)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                />
              </div>

              <button type="button" className="btn btn-info" onClick={addItem}>
                Add Product
              </button>

              <h4>Order Items</h4>

              <div className="table-responsive">
                <table className="table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map(item => (
                      <tr key={item.product}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.sellingPrice)}</td>
                        <td>
                          {formatCurrency(item.quantity * item.sellingPrice)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => removeItem(item.product)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}

                    {items.length === 0 && (
                      <tr>
                        <td colSpan="5">No products added.</td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>

              <h3>Total: {formatCurrency(totalAmount)}</h3>

              <div className="form-group">
                <label>Notes</label>

                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional order notes"
                />
              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary">
                  Create Order
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Orders;
