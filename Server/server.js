const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sales_database', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define MongoDB schema
const transactionSchema = new mongoose.Schema({
    productId: String,
    title: String,
    description: String,
    price: Number,
    dateOfSale: Date,
    category: String,
    sold: Boolean
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Initialize database with seed data from third-party API
app.get('/api/init-database', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = response.data;
        await Transaction.insertMany(data);
        res.json({ message: 'Database initialized successfully' });
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List all transactions with search and pagination
app.get('/api/transactions', async (req, res) => {
    const { month, year, search, page = 1, perPage = 10 } = req.query;
    const skip = (page - 1) * perPage;
    let query = {
        ...(month && { dateOfSale: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } }),
    };

    // Add search by transaction ID if provided
    if (search) {
        const transactionIdQuery = { _id: search }; // Assuming transaction ID is stored in '_id' field
        query = { ...query, ...transactionIdQuery };
    }

    try {
        const transactions = await Transaction.find(query).skip(skip).limit(parseInt(perPage));
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Statistics API
app.get('/api/statistics', async (req, res) => {
    const { month, year } = req.query;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);
    console.log(startOfMonth);
    console.log(endOfMonth);
    try {
        const totalSaleAmount = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startOfMonth, $lt: endOfMonth } } },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ]);
        const totalSoldItems = await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, sold: true });
        const totalNotSoldItems = await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, sold: false });
        res.json({ totalSaleAmount: totalSaleAmount[0]?.total || 0, totalSoldItems, totalNotSoldItems });
    } catch (error) {
        console.error('Error calculating statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bar Chart API
app.get('/api/bar-chart', async (req, res) => {
    const { month, year } = req.query;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);
    try {
        const priceRanges = [
            { range: '0-100', count: await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, price: { $gte: 0, $lt: 100 } }) },
            { range: '101-200', count: await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, price: { $gte: 101, $lt: 200 } }) },
            { range: '201-300', count: await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, price: { $gte: 201, $lt: 300 } }) },
            { range: '301-400', count: await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, price: { $gte: 301, $lt: 400 } }) },
            { range: '401-500', count: await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, price: { $gte: 401, $lt: 500 } }) },
            { range: '501-600', count: await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, price: { $gte: 501, $lt: 600 } }) },
            { range: '601-700', count: await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, price: { $gte: 601, $lt: 700 } }) },
            { range: '701-800', count: await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, price: { $gte: 701, $lt: 800 } }) },
            { range: '801-900', count: await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, price: { $gte: 801, $lt: 900 } }) },
            { range: '900-above', count: await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }, price: { $gte: 901 } }) }
        ];
        res.json(priceRanges);
    } catch (error) {
        console.error('Error generating bar chart data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Pie Chart API
app.get('/api/pie-chart', async (req, res) => {
    const { month, year } = req.query;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);
    try {
        const categories = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startOfMonth, $lt: endOfMonth } } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        res.json(categories);
    } catch (error) {
        console.error('Error generating pie chart data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Combined API
app.get('/api/combined-data', async (req, res) => {
    const { month, year } = req.query;
    try {
        const [transactions, statistics, barChart, pieChart] = await Promise.all([
            axios.get(`/api/transactions?month=${month}&year=${year}`),
            axios.get(`/api/statistics?month=${month}&year=${year}`),
            axios.get(`/api/bar-chart?month=${month}&year=${year}`),
            axios.get(`/api/pie-chart?month=${month}&year=${year}`)
        ]);
        res.json({ transactions: transactions.data, statistics: statistics.data, barChart: barChart.data, pieChart: pieChart.data });
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
