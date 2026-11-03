
const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const Purchase = require('../models/Purchase');
const Order = require('../models/Order');
const Production = require('../models/Production');

// GET: Business reports and analytics
router.get('/summary', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const [
      products,
      suppliers,
      customers,
      purchases,
      orders,
      productions,
      recentOrders,
      recentPurchases,
      monthlySalesData
    ] = await Promise.all([

      Product.find(),

      Supplier.find(),

      Customer.find(),

      Purchase.find(),

      Order.find(),

      Production.find(),

      // Fetch recent orders with populated customer details
      Order.find()
        .populate({
          path: 'customer',
          model: 'Customer',
          select: 'name company'
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Fetch recent purchases with populated supplier details
      Purchase.find()
        .populate('supplier', 'name company')
        .sort({ createdAt: -1 })
        .limit(5),

      // Calculate monthly sales from completed orders
      Order.aggregate([
        {
          $match: {
            status: 'Completed',
            completedAt: {
              $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
              $lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`)
            }
          }
        },
        {
          $group: {
            _id: {
              $month: '$completedAt'
            },
            total: {
              $sum: '$totalAmount'
            }
          }
        },
        {
          $sort: {
            _id: 1
          }
        }
      ])
    ]);

    // Total products
    const totalProducts = products.length;

    // Total available stock
    const totalStock = products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    // Low stock products
    const lowStockProducts = products.filter(
      product => product.quantity <= product.reorderLevel
    );

    // Total sales from completed orders
    const totalSales = orders
      .filter(order => order.status === 'Completed')
      .reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );

    // Total purchases from received purchases
    const totalPurchases = purchases
      .filter(purchase => purchase.status === 'Received')
      .reduce(
        (sum, purchase) => sum + purchase.totalAmount,
        0
      );

    // Completed orders
    const completedOrders = orders.filter(
      order => order.status === 'Completed'
    ).length;

    // Pending orders
    const pendingOrders = orders.filter(
      order => order.status === 'Pending'
    ).length;

    // Completed productions
    const completedProductions = productions.filter(
      production => production.status === 'Completed'
    ).length;

    // Prepare all 12 months of sales data
    const monthlySales = Array.from(
      { length: 12 },
      (_, index) => {
        const monthData = monthlySalesData.find(
          item => item._id === index + 1
        );

        return {
          month: index + 1,
          total: monthData ? monthData.total : 0
        };
      }
    );

    // Send report data
    res.json({
      totalProducts,
      totalStock,

      lowStockCount: lowStockProducts.length,
      lowStockProducts,

      totalSuppliers: suppliers.length,
      totalCustomers: customers.length,

      totalOrders: orders.length,
      completedOrders,
      pendingOrders,

      totalSales,
      totalPurchases,

      totalProductions: productions.length,
      completedProductions,

      recentOrders,
      recentPurchases,

      monthlySales
    });

  } catch (error) {
    console.error('Report error:', error);

    res.status(500).json({
      message: 'Unable to generate business reports.'
    });
  }
});

module.exports = router;
