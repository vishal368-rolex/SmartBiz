
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = '/api/products';

function Products() {
  const emptyForm = {
    name: '',
    category: 'Furniture',
    quantity: '',
    purchasePrice: '',
    sellingPrice: '',
    reorderLevel: ''
  };

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch products from MongoDB
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(API_URL);
      const data = response.data;

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }

    } catch (err) {
      console.error('Product API Error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to load products. Check your backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Open Add Product form
  const openAddForm = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setError('');
  };

  // Open Edit Product form
  const openEditForm = (product) => {
    setEditId(product._id);

    setForm({
      name: product.name || '',
      category: product.category || 'Furniture',
      quantity: String(product.quantity ?? ''),
      purchasePrice: String(product.purchasePrice ?? ''),
      sellingPrice: String(product.sellingPrice ?? ''),
      reorderLevel: String(product.reorderLevel ?? '')
    });

    setShowForm(true);
    setError('');
  };

  // Add or Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name: form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      reorderLevel: Number(form.reorderLevel)
    };

    if (
      !productData.name ||
      form.quantity.trim() === '' ||
      form.purchasePrice.trim() === '' ||
      form.sellingPrice.trim() === '' ||
      form.reorderLevel.trim() === ''
    ) {
      alert('Please fill in all fields.');
      return;
    }

    const numbers = [
      productData.quantity,
      productData.purchasePrice,
      productData.sellingPrice,
      productData.reorderLevel
    ];

    if (
      numbers.some(
        (value) => !Number.isFinite(value) || value < 0
      )
    ) {
      alert('Please enter valid non-negative numbers.');
      return;
    }

    try {
      setSaving(true);

      if (editId) {
        await axios.put(`${API_URL}/${editId}`, productData);
        alert('Product updated successfully!');
      } else {
        await axios.post(API_URL, productData);
        alert('Product added successfully!');
      }

      setForm({ ...emptyForm });
      setShowForm(false);
      setEditId(null);

      await fetchProducts();

    } catch (err) {
      console.error('Save Product Error:', err);

      alert(
        err.response?.data?.message ||
        'Unable to save product. Please check your backend.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);

      alert('Product deleted successfully!');

      await fetchProducts();

    } catch (err) {
      console.error('Delete Product Error:', err);

      alert(
        err.response?.data?.message ||
        'Unable to delete product.'
      );
    }
  };

  // Search Products
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Calculate Statistics
  const lowStockCount = products.filter(
    (product) =>
      Number(product.quantity) <= Number(product.reorderLevel)
  ).length;

  const totalUnits = products.reduce(
    (total, product) =>
      total + Number(product.quantity || 0),
    0
  );

  return (
    <div className="dashboard products-page">

      {/* Page Heading */}

      <div className="dashboard-heading">
        <div>
          <h2>Product Management</h2>
          <p>Manage products, prices and stock levels.</p>
        </div>

        <button
          type="button"
          className="add-button"
          onClick={openAddForm}
        >
          + Add Product
        </button>
      </div>

      {/* Statistics */}

      <div className="product-summary">

        <div className="product-summary-card">
          <span>Total Products</span>
          <h2>{products.length}</h2>
        </div>

        <div className="product-summary-card">
          <span>Low Stock Products</span>
          <h2 className="low-stock-number">
            {lowStockCount}
          </h2>
        </div>

        <div className="product-summary-card">
          <span>Total Units in Stock</span>
          <h2>{totalUnits}</h2>
        </div>

      </div>

      {/* Error Message */}

      {error && (
        <div className="alert alert-danger">
          {error}

          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchProducts}
          >
            Retry
          </button>
        </div>
      )}

      {/* Add / Edit Form */}

      {showForm && (
        <div className="panel product-form-panel">

          <div className="panel-heading">
            <h3>
              {editId ? 'Edit Product' : 'Add New Product'}
            </h3>

            <button
              type="button"
              className="close-button"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="product-form-grid">

              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>Furniture</option>
                  <option>Raw Material</option>
                  <option>Electronics</option>
                  <option>Accessories</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  step="1"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Purchase Price (₹)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  min="0"
                  step="0.01"
                  placeholder="Enter purchase price"
                  value={form.purchasePrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Selling Price (₹)</label>
                <input
                  type="number"
                  name="sellingPrice"
                  min="0"
                  step="0.01"
                  placeholder="Enter selling price"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reorder Level</label>
                <input
                  type="number"
                  name="reorderLevel"
                  min="0"
                  step="1"
                  placeholder="Enter reorder level"
                  value={form.reorderLevel}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="add-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editId
                    ? 'Update Product'
                    : 'Save Product'}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* Products Table */}

      <div className="panel products-table-panel">

        <div className="products-toolbar">

          <div>
            <h3>All Products</h3>
            <p>View and manage your product list.</p>
          </div>

          <input
            className="product-search"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="table-responsive">

          <table className="orders-table products-table">

            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="7" className="empty-products">
                    Loading products...
                  </td>
                </tr>

              ) : filteredProducts.length > 0 ? (

                filteredProducts.map((product) => (

                  <tr key={product._id}>

                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>{product.category}</td>

                    <td>{product.quantity}</td>

                    <td>₹{product.purchasePrice}</td>

                    <td>₹{product.sellingPrice}</td>

                    <td>
                      <span
                        className={
                          Number(product.quantity) <=
                          Number(product.reorderLevel)
                            ? 'status pending'
                            : 'status delivered'
                        }
                      >
                        {Number(product.quantity) <=
                        Number(product.reorderLevel)
                          ? 'Low Stock'
                          : 'In Stock'}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => openEditForm(product)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteProduct(product._id)}
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="7" className="empty-products">
                    No products found. Click Add Product to create one.
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

export default Products;
