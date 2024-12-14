const apiEndpoint = 'http://localhost:3000/students';


async function fetchStudents() {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      credentials: 'same-origin', 
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.statusText}`);
    }

    const students = await response.json();
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '';
    students.forEach(student => {
      const studentItem = document.createElement('li');
      studentItem.className = 'student-item';
      studentItem.innerHTML = `
        <strong>${student.name}</strong> - ${student.departments} - ${student.course}
        <button onclick="editStudent(${student.id})">Edit</button>
        <button onclick="deleteStudent(${student.id})">Delete</button>
      `;
      studentList.appendChild(studentItem);
    });
  } catch (error) {
    console.error('An error occurred while fetching students:', error.message);
    alert('An error occurred while fetching students. Please try again.');
  }
}



async function saveStudent(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const departments = document.getElementById('departments').value;
  const course = document.getElementById('course').value;

  const studentData = { name, departments, course };
  const editingId = document.getElementById('studentForm').dataset.editingId;

  try {
    const url = editingId ? `${apiEndpoint}/${editingId}` : apiEndpoint;
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error(`Failed to ${editingId ? 'update' : 'save'} student: ${response.statusText}`);
    }

    document.getElementById('studentForm').reset();
    delete document.getElementById('studentForm').dataset.editingId;
    fetchStudents();
  } catch (error) {
    console.error('A error occurred while saving the student:', error.message);
    alert('An error occurred while saving the student. Please try again.');
  }
}

// Edit student
async function editStudent(id) {
  try {
    const response = await fetch(`${apiEndpoint}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch student: ${response.statusText}`);
    }
    const student = await response.json();
    document.getElementById('name').value = student.name;
    document.getElementById('departments').value = student.departments;
    document.getElementById('course').value = student.course;
    document.getElementById('studentForm').dataset.editingId = id;
  } catch (error) {
    console.error('An error occurred while fetching the student details:', error.message);
    alert('An error occurred while fetching the student details. Please try again.');
  }
}


async function deleteStudent(id) {
  try {
    const response = await fetch(`${apiEndpoint}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Failed to delete student: ${response.statusText}`);
    }
    fetchStudents();
  } catch (error) {
    console.error('A error occurred while deleting the student:', error.message);
    alert('An error occurred while deleting the student. Please try again.');
  }
}


document.getElementById('studentForm').addEventListener('submit', saveStudent);

fetchStudents();
