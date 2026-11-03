
const mongoose = require('mongoose');

const ProductionSchema = new mongoose.Schema({

  productionNumber: {
    type: String,
    required: true,
    unique: true
  },

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

  materials: [{
    materialName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    }
  }],

  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Planned'
  },

  startDate: {
    type: Date,
    default: Date.now
  },

  completedAt: {
    type: Date,
    default: null
  },

  notes: {
    type: String,
    trim: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Production', ProductionSchema);
