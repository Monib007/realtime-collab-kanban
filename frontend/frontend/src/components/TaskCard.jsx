import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/TaskCard.css";
import API from '../api'

const TaskCard = ({ task, user, token, onDragStart, column, onCardClick }) => {
  const [users, setUsers] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (user.role === "admin") {
      const fetchUsers = async () => {
        // const res = await axios.get("http://localhost:5000/api/auth/users", {
        const res = await API.get("/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      };
      fetchUsers();
    }
  }, []);

  const handleDragStart = (e) => {
    setIsDragging(true);
    onDragStart(e, task._id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent card click

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmDelete) return; // Cancel deletion if user clicks "No"
    // await axios.delete(`http://localhost:5000/api/tasks/${task._id}`, {
    await API.delete(`/tasks/${task._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleSmartAssign = async (e) => {
    e.stopPropagation(); // Prevent card click
    // await axios.post(
    await API.post(
      // `http://localhost:5000/api/tasks/smart-assign/${task._id}`,
      `/tasks/smart-assign/${task._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleManualAssign = async (e) => {
    e.stopPropagation();

    const newUserId = e.target.value;
    try {
      // await axios.put(
      await API.put(
        // `http://localhost:5000/api/tasks/${task._id}`,
        `/tasks/${task._id}`,
        {
          assignedTo: newUserId,
          updatedAt: task.updatedAt,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("Conflict detected! Please refresh.");
      }
    }
  };

  const handleClaimTask = async () => {
    // await axios.post(
    await API.post(
      // `http://localhost:5000/api/tasks/claim/${task._id}`,
      `/tasks/claim/${task._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  // 🔥 Color based on column
  const getCardColor = () => {
    switch (column) {
      case "Todo":
        return "#00bcd4"; // Cyan
      case "In Progress":
        return "#f39c12"; // Orange
      case "Done":
        return "#2ecc71"; // Green
      default:
        return "#ccc";
    }
  };

  const cardStyle = {
    padding: "15px",
    background: getCardColor(),
    borderRadius: "10px",
    marginBottom: "12px",
    boxShadow: isDragging
      ? "0 8px 20px rgba(0,0,0,0.3)"
      : "0 4px 8px rgba(0,0,0,0.08)",
    transform: isDragging ? "scale(1.05)" : "scale(1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    color: "#fff",
    cursor: "grab",
    borderLeft: `5px solid ${getCardColor()}`,
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (
          user.role === "admin" ||
          (task.assignedTo && task.assignedTo._id === user.id)
        ) {
          onCardClick(task);
        } else {
          alert("You can only view details of your own tasks.");
        }
      }}
      style={cardStyle}
    >
      <h4>{task.title}</h4>
      {/* <p>{task.description}</p> */}
      <p className="task-assignee">
        <b>Assigned To:</b> {task.assignedTo?.username || "Unassigned"}
      </p>

      {/* Both admin and user can see claim button */}
      {!task.assignedTo && (
        <button onClick={handleClaimTask} className="task-btn claim-btn">
          Claim Task
        </button>
      )}

      {/* Admin only actions */}
      {user.role === "admin" && (
        <>
          <select
          onClick={(e) => e.stopPropagation()}
            onChange={handleManualAssign}
            defaultValue=""
            className="task-select"
          >
            <option value="">Reassign to...</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.username}
              </option>
            ))}
          </select>

          <div className="task-actions">
            <button onClick={handleDelete} className="task-btn delete-btn">
              Delete
            </button>
            <button onClick={handleSmartAssign} className="task-btn assign-btn">
              Smart Assign
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;
