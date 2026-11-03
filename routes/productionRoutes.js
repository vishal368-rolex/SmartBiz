
const express = require('express');
const router = express.Router();

const Production = require('../models/Production');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// GET: Fetch all production orders
router.get('/', async (req, res) => {
  try {
    const productions = await Production.find()
      .populate('product', 'name category quantity')
      .sort({ createdAt: -1 });

    res.json(productions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Create production order
router.post('/', async (req, res) => {
  try {
    const { product, quantity, materials, notes } = req.body;

    if (!product || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({
        message: 'Select a product and enter a valid production quantity.'
      });
    }

    const productExists = await Product.findById(product);

    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (materials !== undefined && !Array.isArray(materials)) {
      return res.status(400).json({ message: 'Materials must be a list.' });
    }

    const production = new Production({
      productionNumber: `PRD-${Date.now()}`,
      product,
      productName: productExists.name,
      quantity: Number(quantity),
      materials: materials || [],
      notes,
      status: 'Planned'
    });

    await production.save();

    res.status(201).json(production);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: Update production status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      'Planned',
      'In Progress',
      'Completed',
      'Cancelled'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid production status.' });
    }

    const production = await Production.findById(req.params.id);

    if (!production) {
      return res.status(404).json({ message: 'Production order not found.' });
    }

    if (['Completed', 'Cancelled'].includes(production.status)) {
      return res.status(400).json({
        message: 'Completed or cancelled production cannot be changed.'
      });
    }

    // Add finished goods to inventory only on completion
    if (status === 'Completed') {
      const product = await Product.findById(production.product);

      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      const previousQuantity = product.quantity;
      product.quantity += production.quantity;

      await product.save();

      await InventoryTransaction.create({
        product: product._id,
        productName: product.name,
        type: 'IN',
        quantity: production.quantity,
        previousQuantity,
        newQuantity: product.quantity,
        reason: `Production ${production.productionNumber}`
      });

      production.completedAt = new Date();
    }

    production.status = status;
    await production.save();

    res.json({
      message: 'Production status updated successfully.',
      production
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Delete planned production orders only
router.delete('/:id', async (req, res) => {
  try {
    const production = await Production.findById(req.params.id);

    if (!production) {
      return res.status(404).json({ message: 'Production order not found.' });
    }

    if (production.status !== 'Planned') {
      return res.status(400).json({
        message: 'Only planned production orders can be deleted.'
      });
    }

    await Production.findByIdAndDelete(req.params.id);

    res.json({ message: 'Production order deleted successfully.' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
