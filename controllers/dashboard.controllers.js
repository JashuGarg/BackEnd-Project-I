import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'users.json');
const booksFilePath = path.join(process.cwd(), 'models/books.json');
const borrowingFilePath = path.join(process.cwd(), 'models/borrowing.json');

// Helper functions
const readUsers = () => {
    if (!fs.existsSync(usersFilePath)) {
        return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
};

const readBooks = () => {
    if (!fs.existsSync(booksFilePath)) {
        return [];
    }
    const data = fs.readFileSync(booksFilePath, 'utf8');
    return JSON.parse(data);
};

const readBorrowing = () => {
    if (!fs.existsSync(borrowingFilePath)) {
        return [];
    }
    const data = fs.readFileSync(borrowingFilePath, 'utf8');
    return JSON.parse(data);
};

// Get dashboard stats (student view)
const getDashboardStats = (req, res) => {
    try {
        const userId = req.user?.id || req.headers['user-id'];
        const borrowing = readBorrowing();
        const books = readBooks();
        const users = readUsers();

        // Active borrowers count
        const activeBorrowers = borrowing.filter(b => !b.returnDate && b.status === 'active').length;
        const uniqueBorrowers = new Set(borrowing.filter(b => !b.returnDate).map(b => b.userId)).size;

        // Total books borrowed (active)
        const totalBorrowed = borrowing.filter(b => !b.returnDate && b.status === 'active').length;

        // User's borrowed books
        const userBorrowed = borrowing.filter(b => b.userId === userId && !b.returnDate && b.status === 'active').length;

        res.status(200).json({
            message: 'Dashboard stats retrieved successfully',
            stats: {
                totalBooks: books.length,
                availableBooks: books.filter(b => b.quantity > 0).length,
                borrowedBooks: totalBorrowed,
                activeBorrowers: uniqueBorrowers,
                userBorrowedCount: userBorrowed,
                totalUsers: users.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};

// Get admin dashboard stats
const getAdminStats = (req, res) => {
    try {
        const borrowing = readBorrowing();
        const books = readBooks();
        const users = readUsers();

        // Calculate various stats
        const totalBooks = books.length;
        const availableBooks = books.filter(b => b.quantity > 0).length;
        const borrowedBooks = borrowing.filter(b => !b.returnDate && b.status === 'active').length;
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.status !== 'suspended').length;
        const overdue = borrowing.filter(b => {
            if (!b.dueDate || b.returnDate) return false;
            return new Date(b.dueDate) < new Date();
        }).length;

        res.status(200).json({
            message: 'Admin stats retrieved successfully',
            stats: {
                totalBooks,
                availableBooks,
                borrowedBooks,
                totalUsers,
                activeUsers,
                suspendedUsers: totalUsers - activeUsers,
                overdueBooks: overdue,
                totalBorrowTransactions: borrowing.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
    }
};

// Get borrowing history (admin view)
const getBorrowingHistory = (req, res) => {
    try {
        const borrowing = readBorrowing();
        const users = readUsers();
        const books = readBooks();

        const history = borrowing.map(record => {
            const user = users.find(u => u.id === record.userId);
            const book = books.find(b => b.id === record.bookId);
            const isOverdue = !record.returnDate && new Date(record.dueDate) < new Date();

            return {
                ...record,
                userName: user?.name || 'Unknown',
                bookTitle: book?.title || 'Unknown',
                isOverdue: isOverdue,
                borrowDateFormatted: new Date(record.borrowDate).toLocaleDateString(),
                dueDateFormatted: new Date(record.dueDate).toLocaleDateString(),
                returnDateFormatted: record.returnDate ? new Date(record.returnDate).toLocaleDateString() : null
            };
        });

        res.status(200).json({
            message: 'Borrowing history retrieved successfully',
            history: history
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching borrowing history', error: error.message });
    }
};

export {
    getDashboardStats,
    getAdminStats,
    getBorrowingHistory
};
