
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Student = require('./model'); // Ensure you have a model.js for the Mongoose schema


const app = express();


// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies
app.use(cookieParser()); // To parse cookies


// Configure Session
app.use(session({
 secret: 'your-secret-key', // Replace with a secure, random string in production
 resave: false,             // Prevents session being saved if it hasn't changed
 saveUninitialized: false,  // Prevents saving uninitialized sessions
 cookie: {
   maxAge: 1000 * 60 * 60,  // Session duration (1 hour)
   httpOnly: true,          // Makes the cookie inaccessible to client-side JavaScript
   secure: false,           // Set to true if using HTTPS
 },
}));


// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/studentManagement', {
 useNewUrlParser: true,
 useUnifiedTopology: true,
})
 .then(() => console.log('Connected to MongoDB'))
 .catch(err => {
   console.error('Could not connect to MongoDB:', err);
   process.exit(1); // Exit process on failure to connect to MongoDB
 });


// Test route to set session data and cookies
app.get('/set-session-cookie', (req, res) => {
 req.session.user = {
   name: 'Quratulan Ilyas',
   role: 'Student',
 };
 req.session.isAdmin = true;  // Set admin flag
 req.session.visited = req.session.visited ? req.session.visited + 1 : 1;


 // Set a custom cookie
 res.cookie('customCookie', 'This is a custom cookie value', {
   maxAge: 1000 * 60 * 60,  // Cookie duration (1 hour)
   httpOnly: true,          // Prevent access by client-side JavaScript
   secure: false,           // Set to true if using HTTPS
 });


 res.status(200).json({
   message: 'Session and cookie set successfully',
   sessionData: req.session,
 });
});


// Test route to get session and cookie data
app.get('/get-session-cookie', (req, res) => {
 // Retrieve session data
 const sessionData = req.session.user || 'No session data found';
 const visited = req.session.visited || 0;


 // Retrieve cookie data
 const cookieData = req.cookies.customCookie || 'No cookie found';


 res.status(200).json({
   session: sessionData,
   visitedCount: visited,
   cookie: cookieData,
 });
});


// Test route to destroy session and clear cookies
app.get('/destroy-session-cookie', (req, res) => {
 // Destroy session
 req.session.destroy(err => {
   if (err) {
     console.error('Error destroying session:', err);
     return res.status(500).json({ message: 'Failed to destroy session' });
   }
   // Clear the session cookie
   res.clearCookie('connect.sid');
   // Clear the custom cookie
   res.clearCookie('customCookie');
   res.status(200).json({ message: 'Session and cookies cleared successfully' });
 });
});


// Route to track view count
app.get('/view-count', (req, res) => {
 if (!req.session.viewCount) {
   req.session.viewCount = 0;  // Initialize viewCount if it's not set
 }
 req.session.viewCount++;  // Increment the view count
 res.send(`You have visited this page ${req.session.viewCount} times.`);
});


// Admin middleware to protect routes
app.use((req, res, next) => {
 if (req.session.isAdmin) {
   next(); // Allow access if admin session is true
 } else {
   res.send("Not admin");
 }
});




// Routes
// Test route
app.get('/', (req, res) => {
 res.send("Hello, Student Management API with sessions and cookies is running!");
});


// Fetch all students
app.get('/students', async (req, res) => {
 try {
   const students = await Student.find();
   res.status(200).json(students);
 } catch (error) {
   res.status(500).json({ message: "Error fetching students", error: error.message });
 }
});


// Fetch a single student by ID
app.get('/students/:id', async (req, res) => {
 try {
   const student = await Student.findById(req.params.id);
   if (!student) return res.status(404).json({ message: 'Student not found' });
   res.status(200).json(student);
 } catch (error) {
   res.status(500).json({ message: "Error fetching student", error: error.message });
 }
});


// Create a new student
app.post('/students', async (req, res) => {
 const { name, departments, course } = req.body;


 const newStudent = new Student({ name, departments, course });


 try {
   const savedStudent = await newStudent.save();
   res.status(201).json(savedStudent);
 } catch (error) {
   res.status(400).json({ message: "Error creating student", error: error.message });
 }
});


// Update an existing student by ID
app.put('/students/:id', async (req, res) => {
 const { name, departments, course } = req.body;


 try {
   const updatedStudent = await Student.findByIdAndUpdate(
     req.params.id,
     { name, departments, course },
     { new: true, runValidators: true }
   );
   if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
   res.status(200).json(updatedStudent);
 } catch (error) {
   res.status(400).json({ message: "Error updating student", error: error.message });
 }
});


// Delete a student by ID
app.delete('/students/:id', async (req, res) => {
 try {
   const deletedStudent = await Student.findByIdAndDelete(req.params.id);
   if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
   res.status(200).json({ message: 'Student deleted successfully' });
 } catch (error) {
   res.status(500).json({ message: "Error deleting student", error: error.message });
 }
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
 console.log(`Server is running on http://localhost:${PORT}`);
});


 