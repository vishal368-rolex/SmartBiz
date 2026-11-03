
const express = require('express');
const router = express.Router();

const Product = require('../models/Product');

// GET - Fetch all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// POST - Add a new product
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);

        const savedProduct = await product.save();

        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({
            message: 'Error adding product',
            error: error.message
        });
    }
});

// PUT - Update a product
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating product',
            error: error.message
        });
    }
});

// DELETE - Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!deletedProduct) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            message: 'Product deleted successfully',
            product: deletedProduct
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error deleting product',
            error: error.message
        });
    }
});

module.exports = router;
