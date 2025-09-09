import React, { useState } from "react";
import axios from "axios";
import "../styles/TaskForm.css";
import API from '../api'

const TaskForm = ({ token, onClose, refreshTasks }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // await axios.post(
    await API.post(
      // "http://localhost:5000/api/tasks",
      `/tasks`,
      { title, description, status: "Todo" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    refreshTasks(); // refetch tasks
    onClose(); // close modal
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-container">
        <h2>Create New Task</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>

          <div className="task-form-actions">
            <button type="submit">Create</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
