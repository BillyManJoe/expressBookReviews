const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are missing' });
    }

    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username taken" });
    }

    const newUser = { username, password };
    users.push(newUser);
    res.status(201).json({ message: "User successfully registered", user: newUser});
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    try {
        const bookList = await new Promise((resolve, reject) => {
            resolve(books);
        });
        return res.status(200).json(bookList); 
    } catch (error) {
        return res.status(500).json({ message: 'Error getting the book list' });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    try {
        const isbn = req.params.isbn;
        
        const book = await new Promise((resolve, reject) => {
          const foundBook = books[isbn];
          if (foundBook) {
            resolve(foundBook);
          } 
          else {
            reject(new Error("No book with given ISBN"));
          }
        });
    
        return res.status(200).json(book);
      } 
      catch (error) {
        return res.status(404).json({ message: error});
      }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    new Promise((resolve, reject) => {
      let booksList = [];
  
      for (let k of Object.keys(books)) {
        if (books[k].author === author) {
            booksList.push(books[k]);
        }
      }
  
      if (booksList.length > 0) {
        resolve(booksList);  
      } 
      else {
        reject(new Error("No books by the author"));  
      }
    })
    .then((booksList) => {
      return res.status(200).json(booksList);
    })
    .catch((error) => {
      return res.status(404).json({message: error});
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = req.params.title;

    new Promise((resolve, reject) => {
      let booksList = {};
  
      for (let key of Object.keys(books)) {
        if (books[key].title === title) {
            booksList[key] = books[key];
        }
      }
        resolve(booksList)
    
    })
    .then((booksList) => {
      return res.status(200).json(booksList);
    })
    .catch((error) => {
      return res.status(404).json({ message: error.message });
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book){
      return res.status(200).json({reviews:book.reviews})
    }
    else {
        return res.status(400).json({message:"Book is not found"})
    }
   
});

module.exports.general = public_users;
