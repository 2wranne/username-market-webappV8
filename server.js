const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to database
const db = new sqlite3.Database('./usernames_market.db');

// API endpoints
app.get('/api/user/:id', (req, res) => {
    db.get(
        'SELECT balance FROM users WHERE user_id = ?',
        [req.params.id],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                balance: row ? row.balance : 0
            });
        }
    );
});

app.get('/api/usernames', (req, res) => {
    db.all(
        'SELECT username as name, price FROM usernames WHERE sold = FALSE ORDER BY RANDOM() LIMIT 5',
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        }
    );
});

app.get('/api/user/:id/inventory', (req, res) => {
    db.all(
        'SELECT username as name, price FROM usernames WHERE seller_id = ? AND sold = FALSE',
        [req.params.id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        }
    );
});

app.get('/api/user/:id/referrals', (req, res) => {
    db.all(
        `SELECT u.username as name, r.profit 
         FROM referrals r
         JOIN users u ON r.referred_id = u.user_id
         WHERE r.referrer_id = ?`,
        [req.params.id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows || []);
        }
    );
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});