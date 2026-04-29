import fs from 'fs';
import path from 'path';

const booksFilePath = path.join(process.cwd(), 'models/books.json');
const borrowingFilePath = path.join(process.cwd(), 'models/borrowing.json');

// Helper functions
const readBooks = () => {
    if (!fs.existsSync(booksFilePath)) {
        return [];
    }
    const data = fs.readFileSync(booksFilePath, 'utf8');
    return JSON.parse(data);
};

const writeBooks = (books) => {
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2));
};

const readBorrowing = () => {
    if (!fs.existsSync(borrowingFilePath)) {
        return [];
    }
    const data = fs.readFileSync(borrowingFilePath, 'utf8');
    return JSON.parse(data);
};

const writeBorrowing = (records) => {
    fs.writeFileSync(borrowingFilePath, JSON.stringify(records, null, 2));
};

// Get all books
const getAllBooks = (req, res) => {
    try {
        const books = readBooks();
        res.status(200).json({
            message: 'Books retrieved successfully',
            books: books
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
};

// Get available books only
const getAvailableBooks = (req, res) => {
    try {
        const books = readBooks();
        const available = books.filter(book => book.status === 'available' && book.quantity > 0);
        res.status(200).json({
            message: 'Available books retrieved successfully',
            books: available
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available books', error: error.message });
    }
};

// Get single book
const getBook = (req, res) => {
    try {
        const { id } = req.params;
        const books = readBooks();
        const book = books.find(b => b.id === id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({
            message: 'Book retrieved successfully',
            book: book
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book', error: error.message });
    }
};

// Create book (admin only)
const createBook = (req, res) => {
    try {
        const { title, author, isbn, quantity, description, cover } = req.body;

        if (!title || !author || !isbn || !quantity) {
            return res.status(400).json({ message: 'Title, author, ISBN, and quantity are required' });
        }

        const books = readBooks();
        const exists = books.find(b => b.isbn === isbn);

        if (exists) {
            return res.status(409).json({ message: 'Book with this ISBN already exists' });
        }

        const newBook = {
            id: 'book' + Date.now(),
            title,
            author,
            isbn,
            quantity: parseInt(quantity),
            status: 'available',
            cover: cover || '📚',
            description: description || ''
        };

        books.push(newBook);
        writeBooks(books);

        res.status(201).json({
            message: 'Book created successfully',
            book: newBook
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating book', error: error.message });
    }
};

// Update book (admin only)
const updateBook = (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, quantity, description, cover } = req.body;

        const books = readBooks();
        const bookIndex = books.findIndex(b => b.id === id);

        if (bookIndex === -1) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (isbn && isbn !== books[bookIndex].isbn) {
            const exists = books.find(b => b.isbn === isbn && b.id !== id);
            if (exists) {
                return res.status(409).json({ message: 'Another book with this ISBN exists' });
            }
        }

        books[bookIndex] = {
            ...books[bookIndex],
            title: title || books[bookIndex].title,
            author: author || books[bookIndex].author,
            isbn: isbn || books[bookIndex].isbn,
            quantity: quantity !== undefined ? parseInt(quantity) : books[bookIndex].quantity,
            cover: cover || books[bookIndex].cover,
            description: description !== undefined ? description : books[bookIndex].description
        };

        writeBooks(books);

        res.status(200).json({
            message: 'Book updated successfully',
            book: books[bookIndex]
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating book', error: error.message });
    }
};

// Delete book (admin only)
const deleteBook = (req, res) => {
    try {
        const { id } = req.params;
        const books = readBooks();
        const bookIndex = books.findIndex(b => b.id === id);

        if (bookIndex === -1) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const deletedBook = books.splice(bookIndex, 1);
        writeBooks(books);

        res.status(200).json({
            message: 'Book deleted successfully',
            book: deletedBook[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book', error: error.message });
    }
};

// Borrow book
const borrowBook = (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user?.id || req.headers['user-id'];

        if (!bookId || !userId) {
            return res.status(400).json({ message: 'Book ID and user ID are required' });
        }

        const books = readBooks();
        const book = books.find(b => b.id === bookId);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.quantity <= 0) {
            return res.status(409).json({ message: 'Book is not available for borrowing' });
        }

        const borrowing = readBorrowing();
        const alreadyBorrowed = borrowing.find(
            b => b.userId === userId && b.bookId === bookId && !b.returnDate
        );

        if (alreadyBorrowed) {
            return res.status(409).json({ message: 'You have already borrowed this book' });
        }

        const borrowDate = new Date();
        const dueDate = new Date(borrowDate);
        dueDate.setDate(dueDate.getDate() + 14); // 14 days borrow period

        const newBorrow = {
            id: 'borrow' + Date.now(),
            userId,
            bookId,
            borrowDate: borrowDate.toISOString(),
            dueDate: dueDate.toISOString(),
            returnDate: null,
            status: 'active'
        };

        borrowing.push(newBorrow);
        writeBorrowing(borrowing);

        book.quantity--;
        if (book.quantity === 0) {
            book.status = 'borrowed';
        }
        writeBooks(books);

        res.status(200).json({
            message: 'Book borrowed successfully',
            borrow: newBorrow
        });
    } catch (error) {
        res.status(500).json({ message: 'Error borrowing book', error: error.message });
    }
};

// Return book
const returnBook = (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user?.id || req.headers['user-id'];

        if (!bookId || !userId) {
            return res.status(400).json({ message: 'Book ID and user ID are required' });
        }

        const borrowing = readBorrowing();
        const borrowRecord = borrowing.find(
            b => b.userId === userId && b.bookId === bookId && !b.returnDate
        );

        if (!borrowRecord) {
            return res.status(404).json({ message: 'No active borrow record found for this book' });
        }

        borrowRecord.returnDate = new Date().toISOString();
        borrowRecord.status = 'returned';
        writeBorrowing(borrowing);

        const books = readBooks();
        const book = books.find(b => b.id === bookId);
        if (book) {
            book.quantity++;
            if (book.quantity > 0) {
                book.status = 'available';
            }
            writeBooks(books);
        }

        res.status(200).json({
            message: 'Book returned successfully',
            borrow: borrowRecord
        });
    } catch (error) {
        res.status(500).json({ message: 'Error returning book', error: error.message });
    }
};

// Get user's borrowed books
const getUserBorrowedBooks = (req, res) => {
    try {
        const userId = req.user?.id || req.headers['user-id'] || req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const borrowing = readBorrowing();
        const books = readBooks();

        const userBorrows = borrowing.filter(
            b => b.userId === userId && !b.returnDate && b.status === 'active'
        );

        const borrowedBooks = userBorrows.map(borrow => {
            const book = books.find(b => b.id === borrow.bookId);
            return {
                ...borrow,
                book: book
            };
        });

        res.status(200).json({
            message: 'Borrowed books retrieved successfully',
            borrowedBooks: borrowedBooks
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching borrowed books', error: error.message });
    }
};

export {
    getAllBooks,
    getAvailableBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
    getUserBorrowedBooks
};
