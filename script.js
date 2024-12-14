const apiEndpoint = 'https://672ddb98fd8979715643fda7.mockapi.io/api/dummyapi/Students';


async function fetchStudents() {
  const response = await fetch(apiEndpoint);
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
}


async function saveStudent(event) {
  event.preventDefault();
  const studentId = document.getElementById('studentId').value;
  const name = document.getElementById('name').value;
  const departments = document.getElementById('departments').value;
  const course = document.getElementById('course').value;

  const studentData = { name, departments, course };

  if (studentId) {
    // Update operation
    await fetch(`${apiEndpoint}/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
  } else {
    // Create operation
    await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
  }

  
  document.getElementById('studentForm').reset();
  document.getElementById('studentId').value = '';
  fetchStudents();
}


async function editStudent(id) {
  const response = await fetch(`${apiEndpoint}/${id}`);
  const student = await response.json();
  document.getElementById('studentId').value = student.id;
  document.getElementById('name').value = student.name;
  document.getElementById('departments').value = student.departments;
  document.getElementById('course').value = student.course;
}

async function deleteStudent(id) {
  await fetch(`${apiEndpoint}/${id}`, { method: 'DELETE' });
  fetchStudents();
}


document.getElementById('studentForm').addEventListener('submit', saveStudent);


fetchStudents();
