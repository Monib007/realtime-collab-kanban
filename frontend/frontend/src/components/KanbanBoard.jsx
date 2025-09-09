import React, { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import TaskCard from "./TaskCard";
import ActivityLog from "./ActivityLog";
import TaskForm from "./TaskForm";
import ConflictModal from "./ConflictModal";
import { AuthContext } from "../context/AuthContext";
import TaskDetailsModal from "./TaskDetailsModal";
import TopBar from "./TopBar";

import "../styles/KanbanBoard.css";
import API from '../api'
import socket from "../socket";

const KanbanBoard = () => {
  const { token, user, logout } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [conflictTask, setConflictTask] = useState(null);
  const [serverTask, setServerTask] = useState(null);

  const fetchTasks = async () => {
    // const res = await axios.get("http://localhost:5000/api/tasks", {
    const res = await API.get("/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data);
  };

  useEffect(() => {
    // const socket = io("http://localhost:5000");
    fetchTasks();

    const fetchActivity = async () => {
      // const res = await axios.get("http://localhost:5000/api/tasks/actions", {
      const res = await API.get("/tasks/actions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivity(res.data);
    };

    fetchActivity();

    socket.on("taskCreated", (task) => {
      setTasks((prev) => [...prev, task]);
      fetchActivity(); // 🔥 Always fetch from backend to get updated logs
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
      fetchActivity();
    });

    socket.on("taskDeleted", (taskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      fetchActivity();
    });

    return () => socket.disconnect();
  }, [token]);

  const handleDragStart = (e, id) => {
    const task = tasks.find((t) => t._id === id);
    if (
      user.role === "admin" ||
      (task.assignedTo && task.assignedTo._id === user.id)
    ) {
      e.dataTransfer.setData("taskId", id);
    } else {
      e.preventDefault();
      alert("You can only move your own tasks.");
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (
      user.role !== "admin" &&
      (!task.assignedTo || task.assignedTo._id !== user.id)
    ) {
      alert("You can't move this task.");
      return;
    }

    if (task.status !== newStatus) {
      try {
        // await axios.put(
        await API.post(
          // `http://localhost:5000/api/tasks/${taskId}`,
          `/tasks/${taskId}`,
          {
            status: newStatus,
            updatedAt: task.updatedAt,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        if (err.response && err.response.status === 409) {
          setConflictTask(task);
          setServerTask(err.response.data.serverTask);
        } else {
          console.error(err);
        }
      }
    }
  };

  const handleMerge = async (mergedTask) => {
    try {
      // await axios.put(
      await API.put(
        // `http://localhost:5000/api/tasks/${mergedTask._id}`,
        `/tasks/${mergedTask._id}`,
        {
          ...mergedTask,
          updatedAt: serverTask.updatedAt,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConflictTask(null);
      setServerTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOverwrite = async () => {
    try {
      // await axios.put(
      await API.put(
        // `http://localhost:5000/api/tasks/${conflictTask._id}`,
        `/tasks/${conflictTask._id}`,
        {
          ...conflictTask,
          updatedAt: serverTask.updatedAt,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConflictTask(null);
      setServerTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelConflict = () => {
    setConflictTask(null);
    setServerTask(null);
  };

  const columns = ["Todo", "In Progress", "Done"];

  return (
    <>
      <TopBar
        user={user}
        logout={logout}
        onCreateTask={() => setShowForm(true)}
        onToggleActivity={() => setShowActivity((prev) => !prev)}
      />

      <div className="kanban-wrapper">
        <div className="kanban-board">
          {columns.map((status) => (
            <div
              key={status}
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={(e) => e.preventDefault()}
              className="kanban-column"
            >
              <h3>{status}</h3>
              <div className="task-list">
                {tasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      user={user}
                      token={token}
                      onDragStart={handleDragStart}
                      onCardClick={(task) => setSelectedTask(task)}
                      column={status}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {showActivity && <ActivityLog activity={activity} />}
      </div>

      {showForm && (
        <TaskForm
          token={token}
          onClose={() => setShowForm(false)}
          refreshTasks={fetchTasks}
        />
      )}

      {conflictTask && serverTask && (
        <ConflictModal
          localTask={conflictTask}
          serverTask={serverTask}
          onMerge={handleMerge}
          onOverwrite={handleOverwrite}
          onCancel={handleCancelConflict}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          token={token}
          refreshTasks={fetchTasks}
          user={user}
        />
      )}
    </>
  );
};

export default KanbanBoard;
