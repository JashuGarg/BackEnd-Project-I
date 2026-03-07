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
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All Fields are required' });
    }
    const users = readUsers();
    const found = users.find(user => user.email === email);
    if (found) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = { id: Date.now().toString(), email, password };
    users.push(newUser);
    writeUsers(users);
    res.status(201).json({ message: 'User created successfully' });
};

export const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = readUsers();
    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email } });
};


