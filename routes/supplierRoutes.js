
const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// GET: Fetch all suppliers
router.get('/', async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching suppliers',
            error: error.message
        });
    }
});

// POST: Add new supplier
router.post('/', async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        const savedSupplier = await supplier.save();

        res.status(201).json(savedSupplier);
    } catch (error) {
        res.status(400).json({
            message: 'Error adding supplier',
            error: error.message
        });
    }
});

// PUT: Update supplier
router.put('/:id', async (req, res) => {
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSupplier) {
            return res.status(404).json({
                message: 'Supplier not found'
            });
        }

        res.status(200).json(updatedSupplier);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating supplier',
            error: error.message
        });
    }
});

// DELETE: Remove supplier
router.delete('/:id', async (req, res) => {
    try {
        const deletedSupplier = await Supplier.findByIdAndDelete(
            req.params.id
        );

        if (!deletedSupplier) {
            return res.status(404).json({
                message: 'Supplier not found'
            });
        }

        res.status(200).json({
            message: 'Supplier deleted successfully',
            supplier: deletedSupplier
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting supplier',
            error: error.message
        });
    }
});

module.exports = router;
