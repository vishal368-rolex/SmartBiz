
const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({

  purchaseNumber: {
    type: String,
    required: true,
    unique: true
  },

  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },

  items: [
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

      quantity: {
        type: Number,
        required: true,
        min: 1
      },

      purchasePrice: {
        type: Number,
        required: true,
        min: 0
      },

      subtotal: {
        type: Number,
        required: true,
        min: 0
      }
    }
  ],

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  status: {
    type: String,
    enum: ['Pending', 'Received', 'Cancelled'],
    default: 'Pending'
  },

  notes: {
    type: String,
    trim: true
  },

  receivedAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model('Purchase', PurchaseSchema);
