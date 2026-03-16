const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use(cors()); 

// 1. CONNECT TO YOUR VAULT
// !!! PASTE YOUR WORKING LONG MONGODB LINK HERE !!!
const mongoURI = "mongodb://muneem:muneem12345.@ac-armjkoz-shard-00-00.karc90n.mongodb.net:27017,ac-armjkoz-shard-00-01.karc90n.mongodb.net:27017,ac-armjkoz-shard-00-02.karc90n.mongodb.net:27017/?ssl=true&replicaSet=atlas-3mw11r-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Successfully connected to your MongoDB Vault!'))
    .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// 2. CREATE A USER BLUEPRINT (Schema)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Student', 'Admin'], default: 'Student' } 
});

const User = mongoose.model('User', userSchema);

// 3. ROUTE: REGISTER A NEW USER
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // MASTER ADMIN TRICK: List all the VIP emails here!
        // You can add as many as you want, just separate them with a comma.
        const masterAdmins = [
            "mohammad.mutoasituzzaman@g.bracu.ac.bd",
            "muneemzaman15@gmail.com",
            
        ];

        // Check if the registering email is inside the masterAdmins list
        let assignedRole = "Student";
        if (masterAdmins.includes(email)) { 
            assignedRole = "Admin";
        }

        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword,
            role: assignedRole 
        });
        
        await newUser.save();

        res.status(201).json({ 
            message: "User registered successfully!",
            user: { username: newUser.username, email: newUser.email, role: newUser.role } 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error during registration." });
    }
});

// 4. ROUTE: LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password!" });
        }

        // CREATE THE JWT ID BADGE
        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            "MySuperSecretKey123!", 
            { expiresIn: "1h" } 
        );

        res.status(200).json({ 
            message: "Login successful! Welcome back!",
            token: token,
            user: { username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error during login." });
    }
});

// Turn the server on
app.listen(5000, () => {
    console.log('ClubDiary Server is running on port 5000');
});