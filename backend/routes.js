const express = require('express');
const router = express.Router();
const Student = require('./model');

// Fetch all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new student
router.post('/students', async (req, res) => {
  const { name, departments, course } = req.body;

  const newStudent = new Student})