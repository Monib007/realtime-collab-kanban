import React, { useState } from 'react';
import axios from 'axios';
import '../styles/TaskDetailsModal.css';
import API from '../api'

const TaskDetailsModal = ({ task, onClose, token, refreshTasks, user }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);

  const handleUpdate = async () => {
    try {
      // await axios.put(
      await API.put(
        // `http://localhost:5000/api/tasks/${task._id}`,
        `/tasks/${task._id}`,
        {
          title,
          description,
          status,
          updatedAt: task.updatedAt,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Task updated successfully!');
      onClose();
      refreshTasks();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert('Conflict detected! Please refresh.');
      } else {
        console.error(err);
        alert('Error updating task');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Task Details</h2>

        {user.role === 'admin' ? (
          <>
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label>Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label>Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <button onClick={handleUpdate} className="update-btn">
              Update Task
            </button>
          </>
        ) : (
          <>
            <p><b>Title:</b> {title}</p>
            <p><b>Description:</b> {description}</p>
            <p><b>Status:</b> {status}</p>
          </>
        )}

        <p><b>Assigned To:</b> {task.assignedTo?.username || "Unassigned"}</p>
        <p><b>Created:</b> {new Date(task.createdAt).toLocaleString()}</p>
        <p><b>Updated:</b> {new Date(task.updatedAt).toLocaleString()}</p>

        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
