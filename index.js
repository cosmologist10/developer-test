const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

let inventory = [];
let nextItemId = 1;

// POST /items - To add an item
app.post('/items', (req, res) => {
    const { name, quantity, price } = req.body;

    if (!name || !quantity || !price) {
        return res.status(400).json({ error: 'Incomplete item information provided.' });
    }

    const newItem = {
        id: nextItemId++,
        name,
        quantity,
        price
    };

    inventory.push(newItem);

    res.status(200).json(newItem);
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is healthy.' });
})

// DELETE /items/:id - To remove an item based on its ID
app.delete('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);

    const index = inventory.findIndex(item => item.id === itemId);

    if (index === -1) {
        return res.status(404).json({ error: 'Item not found.' });
    }

    const deletedItem = inventory.splice(index, 1)[0];

    res.status(200).json({ message: `Item with ID ${itemId} deleted successfully.` });
});

// GET /items/:id - To retrieve details of a specific item based on its ID
app.get('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);

    const item = inventory.find(item => item.id === itemId);

    if (!item) {
        return res.status(404).json({ error: 'Item not found.' });
    }

    res.status(200).json(item);
});


const users = [];

const secretKey = 'your-secret-key'; // Replace with a strong secret key in production

// POST /users/register - To register a new user
app.post('/users/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Incomplete user information provided.' });
    }

    const existingUser = users.find(user => user.username === username);

    if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    users.push(newUser);

    res.status(200).json({ message: 'User registered successfully.' });
});

// POST /users/login - To login a user and return a JWT
app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ token });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});