const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
   const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username or password missing' });
    }
    if (!isValid(username) || !authenticatedUser(username, password)) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }


    const token = jwt.sign({ username: username }, '', { expiresIn: 3600, algorithm: 'none' }); // Sign a token without a secret
    return res.status(200).json({
        message: "User logged in",
        token: token
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Invalid access token' });
    }

    try {
        const decoded = jwt.verify(token, '');
        const username = decoded.username;
        const {review} = req.body;
        const {isbn} = req.params;

        if (!review) {
            return res.status(400).json({ message: 'Review missing' });
        }
        const book = books[isbn]
        if (!book) {
            return res.status(404).json({ message: 'Book missing' });
        }

        if (!book.reviews) {
            book.reviews = {};
        }

        book.reviews[username] = review;

        return res.status(200).json({ message: 'Review added successfully' });
    } catch (error) {
        return res.status(401).json({ message: error });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Missing access token' });
    }

    try {
        const decoded = jwt.verify(token, '');
        const username = decoded.username;
        const {isbn} = req.params;
        const book = books[isbn]
        if (!book) {
            return res.status(404).json({ message: 'Book missing' });
        }

        if (!book.reviews || !book.reviews[username]) {
            return res.status(404).json({ message: 'Review missing' });
        }

        delete book.reviews[username];

        return res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
