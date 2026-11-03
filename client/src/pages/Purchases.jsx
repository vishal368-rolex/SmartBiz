
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PURCHASE_API = '/api/purchases';
const SUPPLIER_API = '/api/suppliers';
const PRODUCT_API = '/api/products';

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    supplier: '',
    notes: '',
    items: [
      { product: '', quantity: 1, purchasePrice: 0 }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [purchaseRes, supplierRes, productRes] = await Promise.all([
        axios.get(PURCHASE_API),
        axios.get(SUPPLIER_API),
        axios.get(PRODUCT_API)
      ]);

      setPurchases(purchaseRes.data);
      setSuppliers(supplierRes.data);
      setProducts(productRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load purchase information.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const updatedItems = [...prev.items];

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };

      if (field === 'product') {
        const selectedProduct = products.find(
          (product) => product._id === value
        );

        updatedItems[index].purchasePrice =
          selectedProduct?.purchasePrice ?? 0;
      }

      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product: '', quantity: 1, purchasePrice: 0 }
      ]
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const totalAmount = form.items.reduce(
    (total, item) =>
      total + Number(item.quantity) * Number(item.purchasePrice),
    0
  );

  const resetForm = () => {
    setForm({
      supplier: '',
      notes: '',
      items: [
        { product: '', quantity: 1, purchasePrice: 0 }
      ]
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.supplier) {
      setError('Please select a supplier.');
      return;
    }

    if (
      form.items.some(
        (item) =>
          !item.product ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1 ||
          !Number.isFinite(Number(item.purchasePrice)) ||
          Number(item.purchasePrice) < 0
      )
    ) {
      setError('Please enter valid products, quantities and prices.');
      return;
    }

    try {
      setError('');

      await axios.post(PURCHASE_API, {
        supplier: form.supplier,
        notes: form.notes,
        items: form.items
      });

      alert('Purchase order created successfully!');
      resetForm();
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to create purchase order.'
      );
    }
  };

  const updateStatus = async (id, status) => {
    const message =
      status === 'Received'
        ? 'Receive this purchase? Product stock will increase.'
        : 'Cancel this purchase?';

    if (!window.confirm(message)) return;

    try {
      setError('');

      await axios.put(`${PURCHASE_API}/${id}/status`, { status });

      alert(
        status === 'Received'
          ? 'Purchase received and inventory updated!'
          : 'Purchase cancelled.'
      );

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update purchase status.'
      );
    }
  };

  const deletePurchase = async (id) => {
    if (!window.confirm('Delete this pending purchase?')) return;

    try {
      await axios.delete(`${PURCHASE_API}/${id}`);
      alert('Purchase deleted successfully!');
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to delete purchase.'
      );
    }
  };

  const pendingCount = purchases.filter(
    (p) => p.status === 'Pending'
  ).length;

  const receivedCount = purchases.filter(
    (p) => p.status === 'Received'
  ).length;

  const totalPurchaseValue = purchases
    .filter((p) => p.status !== 'Cancelled')
    .reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2
    })}`;

  return (
    <div className="container-fluid py-3">

      {/* Heading */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold">Purchase Management</h2>
          <p style={{
            color: '#bdbdbd',
            opacity: 1,
            fontSize: '16px',
            marginTop: '8px'
          }}>
            Manage supplier purchases and purchase orders.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setError('');
            setShowForm(true);
          }}
        >
          + Create Purchase
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => setError('')}
          >
            Close
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Total Purchases</p>
              <h3 className="fw-bold">{purchases.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Pending Purchases</p>
              <h3 className="fw-bold text-warning">{pendingCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Received Purchases</p>
              <h3 className="fw-bold text-success">{receivedCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Purchase Value</p>
              <h3 className="fw-bold">
                {formatAmount(totalPurchaseValue)}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Purchase Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <h4 className="fw-bold mb-3">Purchase Orders</h4>

          {loading ? (
            <p className="text-center py-4">Loading purchases...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">

                <thead>
                  <tr>
                    <th>Purchase ID</th>
                    <th>Supplier</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {purchases.length > 0 ? (
                    purchases.map((purchase) => (
                      <tr key={purchase._id}>
                        <td className="fw-semibold">
                          {purchase.purchaseNumber}
                        </td>

                        <td>
                          {purchase.supplier?.name || 'Unknown'}
                        </td>

                        <td>{purchase.items?.length || 0}</td>

                        <td>{formatAmount(purchase.totalAmount)}</td>

                        <td style={{ whiteSpace: 'nowrap' }}>
                          {formatDateTime(purchase.createdAt)}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              purchase.status === 'Received'
                                ? 'bg-success'
                                : purchase.status === 'Cancelled'
                                ? 'bg-danger'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {purchase.status}
                          </span>
                        </td>

                        <td>
                          {purchase.status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-success me-2 mb-1"
                                onClick={() =>
                                  updateStatus(purchase._id, 'Received')
                                }
                              >
                                Receive
                              </button>

                              <button
                                className="btn btn-sm btn-outline-danger me-2 mb-1"
                                onClick={() =>
                                  updateStatus(purchase._id, 'Cancelled')
                                }
                              >
                                Cancel
                              </button>

                              <button
                                className="btn btn-sm btn-danger mb-1"
                                onClick={() => deletePurchase(purchase._id)}
                              >
                                Delete
                              </button>
                            </>
                          )}

                          {purchase.status !== 'Pending' && (
                            <span className="text-muted">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No purchase orders found. Create your first purchase!
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

      {/* Create Purchase Modal */}
      {showForm && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Create Purchase Order
                </h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={resetForm}
                />
              </div>

              <form onSubmit={handleSubmit}>

                <div className="modal-body">

                  <div className="mb-4">
                    <label className="form-label">Select Supplier *</label>

                    <select
                      className="form-select"
                      value={form.supplier}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          supplier: e.target.value
                        }))
                      }
                      required
                    >
                      <option value="">Choose Supplier</option>

                      {suppliers.map((supplier) => (
                        <option
                          key={supplier._id}
                          value={supplier._id}
                        >
                          {supplier.name}
                          {supplier.company
                            ? ` - ${supplier.company}`
                            : ''}
                        </option>
                      ))}
                    </select>

                    {suppliers.length === 0 && (
                      <small className="text-warning">
                        Add a supplier before creating a purchase.
                      </small>
                    )}
                  </div>

                  <h6 className="fw-bold mb-3">Purchase Items</h6>

                  {form.items.map((item, index) => (
                    <div
                      className="row g-3 align-items-end mb-3 p-3 border rounded"
                      key={index}
                    >

                      <div className="col-md-5">
                        <label className="form-label">Product *</label>

                        <select
                          className="form-select"
                          value={item.product}
                          onChange={(e) =>
                            handleItemChange(index, 'product', e.target.value)
                          }
                          required
                        >
                          <option value="">Select Product</option>

                          {products.map((product) => (
                            <option
                              key={product._id}
                              value={product._id}
                            >
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Quantity</label>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Unit Price (₹)</label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          value={item.purchasePrice}
                          onChange={(e) =>
                            handleItemChange(index, 'purchasePrice', e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Subtotal</label>

                        <div className="fw-bold text-success pt-2">
                          {formatAmount(
                            Number(item.quantity) * Number(item.purchasePrice)
                          )}
                        </div>
                      </div>

                      <div className="col-md-1">
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeItem(index)}
                          >
                            X
                          </button>
                        )}
                      </div>

                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline-primary mb-4"
                    onClick={addItem}
                  >
                    + Add Another Product
                  </button>

                  <div className="mb-3">
                    <label className="form-label">Notes</label>

                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Enter additional purchase details..."
                      value={form.notes}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          notes: e.target.value
                        }))
                      }
                    />
                  </div>

                  <div className="text-end border-top pt-3">
                    <h4 className="fw-bold">
                      Total Amount: {formatAmount(totalAmount)}
                    </h4>
                    <small style={{ color: '#bdbdbd' }}>
                      Stock will update only after receiving the purchase.
                    </small>
                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={suppliers.length === 0 || products.length === 0}
                  >
                    Create Purchase Order
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

export default Purchases;
