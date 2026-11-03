
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [form, setForm] = useState({
    type: 'IN',
    quantity: '',
    reason: ''
  });

  const fetchInventory = async () => {
    try {
      setError('');

      const [productResponse, transactionResponse] =
        await Promise.all([
          axios.get('/api/inventory/products'),
          axios.get('/api/inventory/transactions')
        ]);

      setProducts(productResponse.data);
      setTransactions(transactionResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load inventory. Check your backend server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

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

  const totalProducts = products.length;

  const totalUnits = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    product =>
      Number(product.quantity) <= Number(product.reorderLevel)
  );

  const openModal = (product) => {
    setSelectedProduct(product);
    setForm({
      type: 'IN',
      quantity: '',
      reason: ''
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const updateStock = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `/api/inventory/adjust/${selectedProduct._id}`,
        {
          type: form.type,
          quantity: Number(form.quantity),
          reason: form.reason
        }
      );

      alert('Stock updated successfully!');

      setShowModal(false);
      setSelectedProduct(null);

      await fetchInventory();

    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Unable to update stock.'
      );
    }
  };

  const getStockStatus = (product) => {
    if (Number(product.quantity) <= Number(product.reorderLevel)) {
      return 'Low Stock';
    }

    return 'In Stock';
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <h4>Loading inventory...</h4>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">

      {/* PAGE HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold">Inventory Management</h2>

          <p style={{
            color: '#bdbdbd',
            opacity: 1,
            fontSize: '16px',
            marginTop: '8px'
          }}>
            Monitor stock levels and stock movements.
          </p>
        </div>

        <button
          className="btn btn-primary px-4"
          onClick={() => {
            if (products.length > 0) {
              openModal(products[0]);
            } else {
              alert('Add a product before updating inventory.');
            }
          }}
        >
          + Update Stock
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchInventory}
          >
            Retry
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="row g-4 mb-4">

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <p className="text-muted mb-2">Total Products</p>
            <h2 className="fw-bold">{totalProducts}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <p className="text-muted mb-2">Low Stock Products</p>
            <h2 className="fw-bold text-danger">
              {lowStockProducts.length}
            </h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <p className="text-muted mb-2">Total Units in Stock</p>
            <h2 className="fw-bold">{totalUnits}</h2>
          </div>
        </div>

      </div>

      {/* LOW STOCK ALERTS */}

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h5 className="fw-bold mb-3">
          ⚠️ Low Stock Alerts
        </h5>

        {lowStockProducts.length === 0 ? (
          <p className="text-success mb-0">
            All products have sufficient stock.
          </p>
        ) : (
          lowStockProducts.map(product => (
            <div
              key={product._id}
              className="d-flex justify-content-between align-items-center border-bottom py-3"
            >
              <div>
                <strong>{product.name}</strong>
                <div className="text-muted small">
                  Current stock: {product.quantity} units
                </div>
              </div>

              <span className="badge bg-danger">
                Low Stock
              </span>
            </div>
          ))
        )}
      </div>

      {/* INVENTORY TABLE */}

      <div className="card border-0 shadow-sm p-4 mb-4">

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Current Inventory</h5>

          <button
            className="btn btn-outline-primary btn-sm"
            onClick={fetchInventory}
          >
            Refresh
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">

            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No products available.
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id}>
                    <td className="fw-semibold">
                      {product.name}
                    </td>

                    <td>{product.category}</td>

                    <td>{product.quantity}</td>

                    <td>{product.reorderLevel}</td>

                    <td>
                      <span
                        className={`badge ${
                          getStockStatus(product) === 'Low Stock'
                            ? 'bg-danger'
                            : 'bg-success'
                        }`}
                      >
                        {getStockStatus(product)}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openModal(product)}
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* STOCK MOVEMENT HISTORY */}

      <div className="card border-0 shadow-sm p-4">

        <h5 className="fw-bold mb-3">
          Stock Movement History
        </h5>

        <div className="table-responsive">
          <table className="table table-hover align-middle">

            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Previous Stock</th>
                <th>New Stock</th>
                <th>Reason</th>
                <th>Date & Time</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map(transaction => (
                  <tr key={transaction._id}>
                    <td>{transaction.productName}</td>

                    <td>
                      <span
                        className={`badge ${
                          transaction.type === 'IN'
                            ? 'bg-success'
                            : 'bg-danger'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>

                    <td>{transaction.quantity}</td>

                    <td>{transaction.previousQuantity}</td>

                    <td>{transaction.newQuantity}</td>

                    <td>{transaction.reason}</td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatDateTime(transaction.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* STOCK ADJUSTMENT MODAL */}

      {showModal && selectedProduct && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <form onSubmit={updateStock}>

                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    Adjust Stock
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <div className="modal-body">

                  <p>
                    Product: <strong>{selectedProduct.name}</strong>
                  </p>

                  <p>
                    Current Stock: <strong>{selectedProduct.quantity}</strong>
                  </p>

                  <div className="mb-3">
                    <label className="form-label">
                      Transaction Type
                    </label>

                    <select
                      name="type"
                      className="form-select"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="IN">Stock In (+)</option>
                      <option value="OUT">Stock Out (-)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Quantity
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      className="form-control"
                      min="1"
                      step="1"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="Enter quantity"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Reason
                    </label>

                    <input
                      type="text"
                      name="reason"
                      className="form-control"
                      value={form.reason}
                      onChange={handleChange}
                      placeholder="Purchase, damaged goods, etc."
                    />
                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>

                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Inventory;
