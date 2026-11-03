
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        purchasePrice: {
            type: Number,
            required: true,
            min: 0
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0
        },

        reorderLevel: {
            type: Number,
            required: true,
            min: 0,
            default: 10
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Product', ProductSchema);
