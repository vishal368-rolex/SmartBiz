const mongoose = require('mongoose');

const InventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    productName: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ['IN', 'OUT'],
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    previousQuantity: {
      type: Number,
      required: true
    },

    newQuantity: {
      type: Number,
      required: true
    },

    reason: {
      type: String,
      default: 'Manual stock adjustment'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'InventoryTransaction',
  InventoryTransactionSchema
);