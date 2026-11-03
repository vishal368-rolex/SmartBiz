
const express = require('express');
const router = express.Router();

const Todo = require('../models/todo');
const inventoryRoutes = require('./inventoryRoutes');

// ===============================
// TODO ROUTES (Existing)
// ===============================

// GET all todos
router.get('/todos', async (req, res) => {
  try {
    const data = await Todo.find({}, 'action');
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching todos',
      error: error.message
    });
  }
});

// ADD todo
router.post('/todos', async (req, res) => {
  try {
    if (!req.body.action) {
      return res.status(400).json({
        error: 'The input field is empty'
      });
    }

    const data = await Todo.create(req.body);
    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: 'Error creating todo',
      error: error.message
    });
  }
});

// DELETE todo
router.delete('/todos/:id', async (req, res) => {
  try {
    const data = await Todo.findOneAndDelete({
      _id: req.params.id
    });

    if (!data) {
      return res.status(404).json({
        message: 'Todo not found'
      });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: 'Error deleting todo',
      error: error.message
    });
  }
});

// ===============================
// INVENTORY ROUTES (New)
// ===============================

router.use('/inventory', inventoryRoutes);

// ===============================
// EXPORT ROUTER
// ===============================

module.exports = router;
