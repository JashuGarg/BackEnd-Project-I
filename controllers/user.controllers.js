import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'users.json');

const readUsers = () => {
    if (!fs.existsSync(usersFilePath)) {
        return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
};

const writeUsers = (users) => {
    fs.writeFileSync(usersFilePath,JSON.stringify(users, null, 2));
};

export const signup = (req, res) => {
    const { firstName, lastName, email, studentId, role, department, year, password } = req.body;
    
    if (!email || !password || !firstName || !lastName || !studentId || !role) {
        return res.status(400).json({ message: 'All required fields must be filled' });
    }
    
    // Department is optional for Librarian role
    if (role !== 'Librarian' && !department) {
        return res.status(400).json({ message: 'Department is required for this role' });
    }
    
    const users = readUsers();
    const found = users.find(user => user.email === email || user.studentId === studentId);
    if (found) {
        return res.status(409).json({ message: 'User with this email or ID already exists' });
    }

    const newUser = { 
        id: Date.now().toString(), 
        firstName, 
        lastName, 
        email, 
        studentId, 
        role, 
        department: department || null, 
        year: year || null,
        password 
    };
    users.push(newUser);
    writeUsers(users);
    res.status(201).json({ message: 'User created successfully' });
};

export const loginById = (req, res) => {
    const { studentId, role } = req.body;

    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    const users = readUsers();
    const user = users.find(user => user.studentId === studentId);

    if (!user) {
        return res.status(401).json({ message: 'Invalid student ID' });
    }

    // Verify that selected role matches stored role
    if (role !== user.role) {
        return res.status(401).json({ message: `Invalid role. You are registered as ${user.role}` });
    }

    res.status(200).json({ 
        message: 'Login successful', 
        user: { 
            id: user.id, 
            email: user.email, 
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            department: user.department
        } 
    });
};

export const login = (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = readUsers();
    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify that selected role matches stored role
    if (role !== user.role) {
        return res.status(401).json({ message: `Invalid role. You are registered as ${user.role}` });
    }

    res.status(200).json({ 
        message: 'Login successful', 
        user: { 
            id: user.id, 
            email: user.email, 
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            department: user.department
        } 
    });
};


