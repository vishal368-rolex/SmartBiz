
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Production() {
  const [productions, setProductions] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [materials, setMaterials] = useState([]);
  const [materialName, setMaterialName] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [productionRes, productRes] = await Promise.all([
        axios.get('/api/production'),
        axios.get('/api/products')
      ]);

      setProductions(productionRes.data);
      setProducts(productRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to load production data.');
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = () => {
    if (!materialName.trim() || !materialQuantity ||
        Number(materialQuantity) <= 0) {
      alert('Enter a material name and valid quantity.');
      return;
    }

    setMaterials([
      ...materials,
      {
        materialName: materialName.trim(),
        quantity: Number(materialQuantity)
      }
    ]);

    setMaterialName('');
    setMaterialQuantity('');
  };

  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setShowModal(false);
    setProduct('');
    setQuantity(1);
    setMaterials([]);
    setMaterialName('');
    setMaterialQuantity('');
    setNotes('');
  };

  const createProduction = async (e) => {
    e.preventDefault();

    if (!product || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      alert('Select a product and enter a valid quantity.');
      return;
    }

    try {
      await axios.post('/api/production', {
        product,
        quantity: Number(quantity),
        materials,
        notes
      });

      alert('Production order created successfully!');
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to create production order.');
    }
  };

  const updateStatus = async (id, status) => {
    if (status === 'Completed' &&
        !window.confirm('Complete production and add finished goods to inventory?')) {
      return;
    }

    try {
      await axios.put(`/api/production/${id}/status`, { status });

      alert('Production status updated successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update production status.');
    }
  };

  const deleteProduction = async (id) => {
    if (!window.confirm('Delete this planned production order?')) return;

    try {
      await axios.delete(`/api/production/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to delete production order.');
    }
  };

  const filteredProductions = productions.filter(item =>
    item.productionNumber?.toLowerCase().includes(search.toLowerCase()) ||
    item.productName?.toLowerCase().includes(search.toLowerCase())
  );

  const plannedCount = productions.filter(p => p.status === 'Planned').length;
  const progressCount = productions.filter(p => p.status === 'In Progress').length;
  const completedCount = productions.filter(p => p.status === 'Completed').length;

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

  return (
    <div className="production-page">

      <div className="page-heading">
        <div>
          <h2>Production Management</h2>
          <p style={{ color: '#bdbdbd' }}>
            Manage manufacturing and production orders.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Create Production
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Production</h3>
          <h2>{productions.length}</h2>
        </div>

        <div className="stat-card">
          <h3>Planned</h3>
          <h2>{plannedCount}</h2>
        </div>

        <div className="stat-card">
          <h3>In Progress</h3>
          <h2>{progressCount}</h2>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <h2>{completedCount}</h2>
        </div>
      </div>

      {/* Production Table */}
      <div className="panel">
        <div className="panel-header">
          <h3>Production Orders</h3>

          <input
            type="text"
            placeholder="Search production..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading production orders...</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Production ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Materials</th>
                  <th>Start Date &amp; Time</th>
                  <th>Completion Date &amp; Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProductions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No production orders found.
                    </td>
                  </tr>
                ) : (
                  filteredProductions.map(item => (
                    <tr key={item._id}>
                      <td>{item.productionNumber}</td>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>{item.materials?.length || 0}</td>
                      <td>
                        {formatDateTime(item.startDate || item.createdAt)}
                      </td>
                      <td>
                        {item.completedAt
                          ? formatDateTime(item.completedAt)
                          : 'Not completed'}
                      </td>
                      <td>
                        <span className={`status-badge ${
                          item.status.toLowerCase().replace(' ', '-')
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td>
                        {item.status === 'Planned' && (
                          <>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => updateStatus(item._id, 'In Progress')}
                            >
                              Start
                            </button>{' '}

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteProduction(item._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {item.status === 'In Progress' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => updateStatus(item._id, 'Completed')}
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Production Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">

            <div className="modal-header">
              <h3>Create Production Order</h3>
              <button type="button" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={createProduction}>

              <div className="form-group">
                <label>Finished Product *</label>

                <select
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  required
                >
                  <option value="">Select Product</option>

                  {products.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} — Current Stock: {p.quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Production Quantity *</label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                />
              </div>

              <h4>Raw Materials (Optional)</h4>

              <div className="form-group">
                <label>Material Name</label>

                <input
                  type="text"
                  placeholder="Enter material name"
                  value={materialName}
                  onChange={e => setMaterialName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Material Quantity</label>

                <input
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="Enter quantity"
                  value={materialQuantity}
                  onChange={e => setMaterialQuantity(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn btn-info"
                onClick={addMaterial}
              >
                Add Material
              </button>

              {materials.length > 0 && (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Quantity</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {materials.map((material, index) => (
                        <tr key={index}>
                          <td>{material.materialName}</td>
                          <td>{material.quantity}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => removeMaterial(index)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="form-group">
                <label>Production Notes</label>

                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional production notes"
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
                  Create Production
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Production;
