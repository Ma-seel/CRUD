
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Student = require('./model'); 


const app = express();


// Middleware
app.use(cors());
app.use(express.json()); 
app.use(cookieParser()); 



app.use(session({
 secret: 'your-secret-key', 
 resave: false,            
 saveUninitialized: false,
 cookie: {
   maxAge: 1000 * 60 * 60,  
   httpOnly: true,         
   secure: false,           
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
   process.exit(1); 
 });



app.get('/set-session-cookie', (req, res) => {
 req.session.user = {
   name: 'Quratulan Ilyas',
   role: 'Student',
 };
 req.session.isAdmin = true;  
 req.session.visited = req.session.visited ? req.session.visited + 1 : 1;



 res.cookie('customCookie', 'This is a custom cookie value', {
   maxAge: 1000 * 60 * 60,  
   httpOnly: true,          
   secure: false,           
 });


 res.status(200).json({
   message: 'Session and cookie set successfully',
   sessionData: req.session,
 });
});



app.get('/get-session-cookie', (req, res) => {

 const sessionData = req.session.user || 'No session data found';
 const visited = req.session.visited || 0;



 const cookieData = req.cookies.customCookie || 'No cookie found';


 res.status(200).json({
   session: sessionData,
   visitedCount: visited,
   cookie: cookieData,
 });
});



app.get('/destroy-session-cookie', (req, res) => {
 // Destroy session
 req.session.destroy(err => {
   if (err) {
     console.error('Error destroying session:', err);
     return res.status(500).json({ message: 'Failed to destroy session' });
   }

   res.clearCookie('connect.sid');
 
   res.clearCookie('customCookie');
   res.status(200).json({ message: 'Session and cookies cleared successfully' });
 });
});



app.get('/view-count', (req, res) => {
 if (!req.session.viewCount) {
   req.session.viewCount = 0;  
 }
 req.session.viewCount++;  
 res.send(`You have visited this page ${req.session.viewCount} times.`);
});


app.use((req, res, next) => {
 if (req.session.isAdmin) {
   next(); 
 } else {
   res.send("Not admin");
 }
});





app.get('/', (req, res) => {
 res.send("Hello, Student Management API with sessions and cookies is running!");
});



app.get('/students', async (req, res) => {
 try {
   const students = await Student.find();
   res.status(200).json(students);
 } catch (error) {
   res.status(500).json({ message: "Error fetching students", error: error.message });
 }
});



app.get('/students/:id', async (req, res) => {
 try {
   const student = await Student.findById(req.params.id);
   if (!student) return res.status(404).json({ message: 'Student not found' });
   res.status(200).json(student);
 } catch (error) {
   res.status(500).json({ message: "Error fetching student", error: error.message });
 }
});



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



app.delete('/students/:id', async (req, res) => {
 try {
   const deletedStudent = await Student.findByIdAndDelete(req.params.id);
   if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
   res.status(200).json({ message: 'Student deleted successfully' });
 } catch (error) {
   res.status(500).json({ message: "Error deleting student", error: error.message });
 }
});



const PORT = 3000;
app.listen(PORT, () => {
 console.log(`Server is running on http://localhost:${PORT}`);
});


 