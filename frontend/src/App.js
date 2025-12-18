import React, { useState, useEffect } from 'react';

const API_URL = 'http://198.46.141.67:30500';

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ roll: '', name: '', class: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/students`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing
        ? `${API_URL}/api/students/${editing}`
        : `${API_URL}/api/students`;
      const method = editing ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      setForm({ roll: '', name: '', class: '' });
      setEditing(null);
      fetchStudents();
    } catch (err) {
      console.error('Error saving student:', err);
    }
  };

  const handleEdit = (student) => {
    setForm({ roll: student.roll, name: student.name, class: student.class });
    setEditing(student.id);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Student Management System</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd' }}>
        <h2>{editing ? 'Edit Student' : 'Add Student'}</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Roll Number"
            value={form.roll}
            onChange={(e) => setForm({ ...form, roll: e.target.value })}
            required
            style={{ padding: '8px', marginRight: '10px', width: '150px' }}
          />
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{ padding: '8px', marginRight: '10px', width: '200px' }}
          />
          <input
            type="text"
            placeholder="Class"
            value={form.class}
            onChange={(e) => setForm({ ...form, class: e.target.value })}
            required
            style={{ padding: '8px', marginRight: '10px', width: '150px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 20px', marginRight: '10px' }}>
          {editing ? 'Update' : 'Add'}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({ roll: '', name: '', class: '' });
            }}
            style={{ padding: '8px 20px' }}
          >
            Cancel
          </button>
        )}
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Roll</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Class</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{student.roll}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{student.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{student.class}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button onClick={() => handleEdit(student)} style={{ marginRight: '10px', padding: '5px 10px' }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(student.id)} style={{ padding: '5px 10px' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
