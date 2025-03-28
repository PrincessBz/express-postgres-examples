const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

// PostgreSQL connection pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "1964",
  port: 5432,
});

// Middleware to parse JSON requests
app.use(express.json());

// Placeholder data instead of a database (for now)
let users = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
];

// Stub function to create users table
async function createUsersTable() {
  // TODO: Add SQL logic to create the users table in PostgreSQL
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
    `);
    console.log("Creating users table...");
  } catch (err) {
    console.error("Error creating users table:", err);
  }
}

// Endpoint to list all users
app.get("/users", async (req, res) => {
  const result = await pool.query(`SELECT * FROM users;`);
  res.json(result.rows); // Return the users from the database
});

// Endpoint to add a new user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !name.trim().length < 1) {
    // check if name is empty
    res.status(400).json({ error: "Name is required" });
    return;
  }
  if (!email?.trim().length) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
  const result = await pool.query(
    `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *;`,
    [name, email]
  );
  res.status(201).json(result.rows[0]);
} catch (error) {
    res.status(500).json({ error: "Internal server error." });
    }
});

// Endpoint to update a user
app.put("/users/:id", async(req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name?.trim?.()){
    res.status(400).json({ error: "Name is required" });
    return;
  }
    if (!email?.trim?.()){
        res.status(400).json({ error: "Email is required" });
        return;
        }
    try {
  const results =await pool.query(
    `UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *;`,
    [name, email, id]
  );
    return res.status(200).json(results.rows[0]);
} catch (error) {
    res.status(500).json({ error: "Internal server error." });
}
});

// Endpoint to delete a user
app.delete("/users/:id", async(req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: "ID must be a valid integer." });
  }
  try{
    const result = await pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING *;`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }
    }

    catch(error){
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
  res.status(204).send();
});

createUsersTable().then(() =>
  app.listen(PORT, () =>
    console.log(`Server is running on http://localhost:${PORT}`)
  )
);
