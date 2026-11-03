const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    suppliedMaterials: {
        type: String
    },
    status: {
        type: String,
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Supplier', SupplierSchema);