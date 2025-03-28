const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '1964',
    port: 5432,
});

// Middleware to parse JSON requests
app.use(express.json());

// Placeholder data for products
let products = [
    { id: 1, name: 'Sample Product 1', price: 19.99 },
    { id: 2, name: 'Sample Product 2', price: 29.99 }
];

// Stub function to create products table
async function createProductsTable() {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            price DECIMAL(10, 2) NOT NULL
        
        ); `);              
        console.log("Creating products table...");
    } catch (err) {
        console.error("Error creating products table:", err);
    }
}

// Endpoint to list all products
app.get('/products', async(req, res) => {
    try {
    const result = await pool.query('SELECT name, price FROM products;');
    return res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to add a new product
app.post('/products', async(req, res) => {
    const { name, price } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required, and must be a non-empty string.' });
    }

    if (!price || price <= 0) {
        return res.status(400).json({ error: 'Price is required, and must be a value greater than zero.' });
    }

    try{
      const result = await pool.query(
        `INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *`,
        [name, price]
      );
      return res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
  
});

// Endpoint to update a product
app.put('/products/:id', async(req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required, and must be a non-empty string.' });
    }

    if (!price || price <= 0) {
        return res.status(400).json({ error: 'Price is required, and must be a value greater than zero.' });
    }

    try{
   
    const result = await pool.query(`UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *`, [name, price, id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found with ID: ${id}' });
    }
    return res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }

    
});

// Endpoint to delete a product
app.delete('/products/:id', async(req, res) => {
    const { id } = req.params;
   try{
    const result = await pool.query(
        `DELETE FROM products WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found with ID: ${id}' });
    }
    return res.json(result.rows[0]);
   }
   catch (err)
   {
       console.error(err);
       return res.status(500).json({ error: 'Internal server error' });
   }
   res.status(204).send();
});

createProductsTable()
    .then(() => app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`)));