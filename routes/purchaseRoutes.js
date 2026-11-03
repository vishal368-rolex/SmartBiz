
const express = require('express');
const router = express.Router();

const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// GET: Fetch all purchases
router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('supplier', 'name company')
      .sort({ createdAt: -1 });

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Create a purchase
router.post('/', async (req, res) => {
  try {
    const { supplier, items, notes } = req.body;

    if (!supplier || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Supplier and at least one purchase item are required.'
      });
    }

    let totalAmount = 0;
    const purchaseItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: 'A selected product was not found.'
        });
      }

      const quantity = Number(item.quantity);
      const purchasePrice = Number(item.purchasePrice);

      if (!Number.isInteger(quantity) || quantity < 1 ||
          !Number.isFinite(purchasePrice) || purchasePrice < 0) {
        return res.status(400).json({
          message: 'Enter a valid quantity and purchase price.'
        });
      }

      const subtotal = quantity * purchasePrice;
      totalAmount += subtotal;

      purchaseItems.push({
        product: product._id,
        productName: product.name,
        quantity,
        purchasePrice,
        subtotal
      });
    }

    const purchaseNumber =
      `PUR-${Date.now()}`;

    const purchase = new Purchase({
      purchaseNumber,
      supplier,
      items: purchaseItems,
      totalAmount,
      notes,
      status: 'Pending'
    });

    const savedPurchase = await purchase.save();

    res.status(201).json(savedPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: Update purchase status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Received', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid purchase status.'
      });
    }

    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        message: 'Purchase not found.'
      });
    }

    if (purchase.status === 'Received' || purchase.status === 'Cancelled') {
      return res.status(400).json({
        message: 'A completed or cancelled purchase cannot be changed.'
      });
    }

    if (status === 'Received') {
      const products = [];

      // Validate all products before changing stock
      for (const item of purchase.items) {
        const product = await Product.findById(item.product);

        if (!product) {
          return res.status(404).json({
            message: `Product ${item.productName} was not found.`
          });
        }

        products.push({ product, item });
      }

      // Increase stock and record each transaction
      for (const { product, item } of products) {
        const previousQuantity = product.quantity;
        product.quantity += item.quantity;

        await product.save();

        await InventoryTransaction.create({
          product: product._id,
          productName: product.name,
          type: 'IN',
          quantity: item.quantity,
          previousQuantity,
          newQuantity: product.quantity,
          reason: `Purchase ${purchase.purchaseNumber}`
        });
      }

      purchase.receivedAt = new Date();
    }

    purchase.status = status;
    await purchase.save();

    const updatedPurchase = await Purchase.findById(purchase._id)
      .populate('supplier', 'name company');

    res.status(200).json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Delete a pending purchase
router.delete('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        message: 'Purchase not found.'
      });
    }

    if (purchase.status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending purchases can be deleted.'
      });
    }

    await purchase.deleteOne();

    res.status(200).json({
      message: 'Purchase deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
