import React, { useEffect, useState } from "react";
import axios from "axios";

const TaskCard = ({ task, user, token, onDragStart }) => {
  const [users, setUsers] = useState([]);
  const [isDragging, setIsDragging] = useState(false); // 🔥 For animation

  useEffect(() => {
    if (user.role === "admin") {
      const fetchUsers = async () => {
        const res = await axios.get("http://localhost:5000/api/auth/users", {
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

  const handleDelete = async () => {
    await axios.delete(`http://localhost:5000/api/tasks/${task._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleSmartAssign = async () => {
    await axios.post(
      `http://localhost:5000/api/tasks/smart-assign/${task._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleManualAssign = async (e) => {
    const newUserId = e.target.value;

    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${task._id}`,
        {
          assignedTo: newUserId,
          updatedAt: task.updatedAt, // ✅ For conflict detection
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("Conflict detected! Someone else updated this task. Please refresh and try again.");
      } else {
        console.error(err);
      }
    }
  };

  const handleClaimTask = async () => {
    await axios.post(
      `http://localhost:5000/api/tasks/claim/${task._id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  // 🔥 Animation Style
  const cardStyle = {
    padding: "10px",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: "grab",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    transform: isDragging ? "scale(1.05)" : "scale(1)",
    boxShadow: isDragging
      ? "0 8px 20px rgba(0,0,0,0.3)"
      : "0 2px 5px rgba(0,0,0,0.1)",
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={cardStyle}
    >
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p>
        <b>Assigned To:</b> {task.assignedTo?.username || "Unassigned"}
      </p>

      {user.role === "admin" && (
        <>
          <select
            onChange={handleManualAssign}
            defaultValue=""
            style={{
              width: "100%",
              marginTop: "5px",
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #aaa",
              background: "#f8f8f8",
            }}
          >
            <option value="">Reassign to...</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.username}
              </option>
            ))}
          </select>

          <div style={{ marginTop: "8px", display: "flex", gap: "4px" }}>
            <button
              onClick={handleDelete}
              style={{
                flex: 1,
                background: "red",
                color: "#fff",
                border: "none",
                padding: "5px",
                borderRadius: "4px",
              }}
            >
              Delete
            </button>

            <button
              onClick={handleSmartAssign}
              style={{
                flex: 1,
                background: "green",
                color: "#fff",
                border: "none",
                padding: "5px",
                borderRadius: "4px",
              }}
            >
              Smart Assign
            </button>
          </div>
        </>
      )}

      {/* Claim Task (Both Admin & User) */}
      {!task.assignedTo && (
        <button
          onClick={handleClaimTask}
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "5px",
            borderRadius: "4px",
            marginTop: "5px",
            width: "100%",
          }}
        >
          Claim Task
        </button>
      )}
    </div>
  );
};

export default TaskCard;
