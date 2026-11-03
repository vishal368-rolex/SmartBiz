
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const initialForm = {
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        suppliedMaterials: '',
        status: 'Active'
    };

    const [form, setForm] = useState(initialForm);

    // Fetch suppliers
    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            alert('Unable to fetch suppliers');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Add or update supplier
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await axios.put(
                    `/api/suppliers/${editingId}`,
                    form
                );
                alert('Supplier updated successfully');
            } else {
                await axios.post('/api/suppliers', form);
                alert('Supplier added successfully');
            }

            setForm(initialForm);
            setShowForm(false);
            setEditingId(null);
            fetchSuppliers();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                'Error saving supplier'
            );
            console.error(error);
        }
    };

    // Edit supplier
    const handleEdit = (supplier) => {
        setForm({
            name: supplier.name || '',
            company: supplier.company || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            suppliedMaterials: supplier.suppliedMaterials || '',
            status: supplier.status || 'Active'
        });

        setEditingId(supplier._id);
        setShowForm(true);
    };

    // Delete supplier
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) {
            return;
        }

        try {
            await axios.delete(`/api/suppliers/${id}`);
            alert('Supplier deleted successfully');
            fetchSuppliers();
        } catch (error) {
            alert('Error deleting supplier');
            console.error(error);
        }
    };

    // Search suppliers
    const filteredSuppliers = suppliers.filter((supplier) =>
        [
            supplier.name,
            supplier.company,
            supplier.email,
            supplier.phone
        ].some(value =>
            value?.toLowerCase().includes(search.toLowerCase())
        )
    );

    const activeSuppliers = suppliers.filter(
        supplier => supplier.status === 'Active'
    ).length;

    return (
        <div className="suppliers-page">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h2>Supplier Management</h2>

                    {/* Updated subtitle styling */}
                    <p style={{
                        color: '#bdbdbd',
                        opacity: 1,
                        fontSize: '16px',
                        marginTop: '8px'
                    }}>
                        Manage suppliers and their contact information.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setForm(initialForm);
                        setEditingId(null);
                        setShowForm(true);
                    }}
                >
                    + Add Supplier
                </button>
            </div>

            {/* Statistics */}
            <div className="row g-3 mb-4">

                <div className="col-md-4">
                    <div className="card p-4 shadow-sm">
                        <p className="text-muted mb-2">Total Suppliers</p>
                        <h3>{suppliers.length}</h3>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card p-4 shadow-sm">
                        <p className="text-muted mb-2">Active Suppliers</p>
                        <h3 className="text-success">
                            {activeSuppliers}
                        </h3>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card p-4 shadow-sm">
                        <p className="text-muted mb-2">Inactive Suppliers</p>
                        <h3 className="text-danger">
                            {suppliers.length - activeSuppliers}
                        </h3>
                    </div>
                </div>

            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <div className="card p-4 shadow-sm mb-4">

                    <h4 className="mb-3">
                        {editingId ? 'Edit Supplier' : 'Add New Supplier'}
                    </h4>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">

                            <div className="col-md-6">
                                <label className="form-label">Supplier Name *</label>
                                <input
                                    className="form-control"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter supplier name"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Company Name</label>
                                <input
                                    className="form-control"
                                    name="company"
                                    value={form.company}
                                    onChange={handleChange}
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Phone *</label>
                                <input
                                    className="form-control"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-control"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Enter address"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Supplied Materials</label>
                                <input
                                    className="form-control"
                                    name="suppliedMaterials"
                                    value={form.suppliedMaterials}
                                    onChange={handleChange}
                                    placeholder="e.g. Steel, Wood, Plastic"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                        </div>

                        <div className="mt-4 d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                {editingId ? 'Update Supplier' : 'Save Supplier'}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                    setForm(initialForm);
                                }}
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* Supplier Table */}
            <div className="card p-4 shadow-sm">

                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div>
                        <h4>All Suppliers</h4>
                        <p className="text-muted mb-0">
                            View and manage your supplier list.
                        </p>
                    </div>

                    <input
                        type="text"
                        className="form-control"
                        style={{ maxWidth: '300px' }}
                        placeholder="Search suppliers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="table-responsive">

                    <table className="table table-hover align-middle">

                        <thead className="table-light">
                            <tr>
                                <th>Supplier Name</th>
                                <th>Company</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Materials</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        Loading suppliers...
                                    </td>
                                </tr>
                            ) : filteredSuppliers.length > 0 ? (
                                filteredSuppliers.map((supplier) => (
                                    <tr key={supplier._id}>
                                        <td className="fw-bold">
                                            {supplier.name}
                                        </td>
                                        <td>{supplier.company || '-'}</td>
                                        <td>{supplier.email || '-'}</td>
                                        <td>{supplier.phone}</td>
                                        <td>{supplier.suppliedMaterials || '-'}</td>
                                        <td>
                                            <span className={`badge ${
                                                supplier.status === 'Active'
                                                    ? 'bg-success'
                                                    : 'bg-danger'
                                            }`}>
                                                {supplier.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(supplier)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(supplier._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        No suppliers found.
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

export default Suppliers;
