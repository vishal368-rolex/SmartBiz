const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// GET all products with stock information
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching inventory',
      error: error.message
    });
  }
});

// GET stock movement history
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find()
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching stock history',
      error: error.message
    });
  }
});

// UPDATE stock
router.post('/adjust/:id', async (req, res) => {
  try {
    const { type, quantity, reason } = req.body;

    if (!['IN', 'OUT'].includes(type)) {
      return res.status(400).json({
        message: 'Type must be IN or OUT'
      });
    }

    const amount = Number(quantity);

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({
        message: 'Quantity must be a positive whole number'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const previousQuantity = product.quantity;

    const newQuantity =
      type === 'IN'
        ? previousQuantity + amount
        : previousQuantity - amount;

    if (newQuantity < 0) {
      return res.status(400).json({
        message: 'Insufficient stock available'
      });
    }

    product.quantity = newQuantity;
    await product.save();

    const transaction = await InventoryTransaction.create({
      product: product._id,
      productName: product.name,
      type,
      quantity: amount,
      previousQuantity,
      newQuantity,
      reason: reason || 'Manual stock adjustment'
    });

    res.status(200).json({
      message: 'Stock updated successfully',
      product,
      transaction
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error updating stock',
      error: error.message
    });
  }
});

module.exports = router;