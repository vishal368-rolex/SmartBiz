const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// GET: Fetch all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name company')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Create a new order
router.post('/', async (req, res) => {
  try {
    const { customer, items, notes } = req.body;

    if (!customer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Customer and at least one product are required.'
      });
    }

    const customerExists = await Customer.findById(customer);

    if (!customerExists) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product}`
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: 'Quantity must be a positive whole number.'
        });
      }

      const sellingPrice = product.sellingPrice;
      const subtotal = quantity * sellingPrice;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity,
        sellingPrice,
        subtotal
      });

      totalAmount += subtotal;
    }

    const order = new Order({
      orderNumber: `ORD-${Date.now()}`,
      customer,
      items: orderItems,
      totalAmount,
      notes,
      status: 'Pending'
    });

    await order.save();

    const savedOrder = await Order.findById(order._id)
      .populate('customer', 'name company');

    res.status(201).json(savedOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      'Pending',
      'Processing',
      'Completed',
      'Cancelled'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status === 'Completed' || order.status === 'Cancelled') {
      return res.status(400).json({
        message: 'Completed or cancelled orders cannot be changed.'
      });
    }

    // Reduce stock only when an order is completed
    if (status === 'Completed') {
      const productUpdates = [];

      // Check all stock quantities before updating anything
      for (const item of order.items) {
        const product = await Product.findById(item.product);

        if (!product) {
          return res.status(404).json({
            message: `Product not found: ${item.productName}`
          });
        }

        if (product.quantity < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`
          });
        }

        productUpdates.push({
          product,
          item
        });
      }

      // Update stock and record transactions
      for (const { product, item } of productUpdates) {
        const previousQuantity = product.quantity;
        product.quantity -= item.quantity;

        await product.save();

        await InventoryTransaction.create({
          product: product._id,
          productName: product.name,
          type: 'OUT',
          quantity: item.quantity,
          previousQuantity,
          newQuantity: product.quantity,
          reason: `Sales Order ${order.orderNumber}`
        });
      }

      order.completedAt = new Date();
    }

    order.status = status;
    await order.save();

    res.json({
      message: 'Order status updated successfully.',
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Delete pending orders only
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending orders can be deleted.'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: 'Order deleted successfully.' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;