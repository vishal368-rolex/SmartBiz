
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = '/api/customers';

const emptyForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  customerType: 'Individual',
  status: 'Active'
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_URL);
      setCustomers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (customer) => {
    setForm({
      name: customer.name || '',
      company: customer.company || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      customerType: customer.customerType || 'Individual',
      status: customer.status || 'Active'
    });

    setEditingId(customer._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        alert('Customer updated successfully!');
      } else {
        await axios.post(API_URL, form);
        alert('Customer added successfully!');
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save customer.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert('Customer deleted successfully!');
      await fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete customer.');
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    [
      customer.name,
      customer.company,
      customer.email,
      customer.phone
    ].some((value) =>
      String(value || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const activeCount = customers.filter(
    (customer) => customer.status === 'Active'
  ).length;

  const inactiveCount = customers.filter(
    (customer) => customer.status === 'Inactive'
  ).length;

  return (
    <div className="container-fluid py-3">

      {/* Page heading */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold">Customer Management</h2>
          <p style={{
            color: '#bdbdbd',
            opacity: 1,
            fontSize: '16px',
            marginTop: '8px'
          }}>
            Manage customers and their contact information.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Customer
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => setError('')}
          >
            Close
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Total Customers</p>
              <h3 className="fw-bold">{customers.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Active Customers</p>
              <h3 className="fw-bold text-success">{activeCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-muted mb-2">Inactive Customers</p>
              <h3 className="fw-bold text-danger">{inactiveCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Customer table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <div>
              <h4 className="fw-bold mb-1">All Customers</h4>
              <p style={{
                color: '#bdbdbd',
                opacity: 1,
                fontSize: '15px',
                marginBottom: 0
              }}>
                View and manage your customer list.
              </p>
            </div>

            <input
              type="text"
              className="form-control"
              style={{ maxWidth: '300px' }}
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-center py-4">Loading customers...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Customer Name</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr key={customer._id}>
                        <td className="fw-semibold">{customer.name}</td>
                        <td>{customer.company || '-'}</td>
                        <td>{customer.email || '-'}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.customerType}</td>
                        <td>
                          <span
                            className={`badge ${
                              customer.status === 'Active'
                                ? 'bg-success'
                                : 'bg-danger'
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2 mb-1"
                            onClick={() => handleEdit(customer)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger mb-1"
                            onClick={() => handleDelete(customer._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Customer Form */}
      {showForm && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Edit Customer' : 'Add New Customer'}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Customer Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Company</label>
                      <input
                        type="text"
                        name="company"
                        className="form-control"
                        value={form.company}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        name="address"
                        className="form-control"
                        rows="2"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Customer Type</label>
                      <select
                        name="customerType"
                        className="form-select"
                        value={form.customerType}
                        onChange={handleChange}
                      >
                        <option value="Individual">Individual</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        className="form-select"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Customer' : 'Save Customer'}
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

export default Customers;
