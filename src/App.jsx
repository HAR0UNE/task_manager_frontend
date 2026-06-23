import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:3000/api/v1";
const token = import.meta.env.VITE_API_KEY;

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_ORDER = ["todo", "in_progress", "completed"];

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");

  // Task state
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("todo");
  const [editDueDate, setEditDueDate] = useState("");

  // GET PROJECTS
  useEffect(() => {
    async function getProjects() {
      try {
        const response = await fetch(`${API_BASE}/projects`, { headers });
        const data = await response.json();
        setProjects(data.data || []);
      } catch (error) {
        console.error(error);
      }
    }
    getProjects();
  }, []);

  // FETCH TASKS when project changes
  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }
    fetchTasks(selectedProject.id);
  }, [selectedProject]);

  const fetchTasks = async (projectId) => {
    setLoadingTasks(true);
    try {
      const response = await fetch(
        `${API_BASE}/projects/${projectId}/tasks`,
        { headers }
      );
      const data = await response.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  // CREATE PROJECT
  const createProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers,
        body: JSON.stringify({ project: { name: newProjectName } }),
      });
      const data = await response.json();
      setProjects([...projects, data.data]);
      setNewProjectName("");
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // CREATE TASK
  const createTask = async () => {
    if (!newTaskTitle.trim() || !selectedProject) return;
    try {
      const response = await fetch(
        `${API_BASE}/projects/${selectedProject.id}/tasks`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            task: {
              title: newTaskTitle,
              description: newTaskDesc,
              status: "todo",
            },
          }),
        }
      );
      const data = await response.json();
      setTasks([...tasks, data.data]);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setShowCreateTask(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // UPDATE TASK
  const updateTask = async () => {
    if (!editingTask || !selectedProject) return;
    try {
      const response = await fetch(
        `${API_BASE}/projects/${selectedProject.id}/tasks/${editingTask.id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            task: {
              title: editTitle,
              description: editDesc,
              status: editStatus,
              due_date: editDueDate || null,
            },
          }),
        }
      );
      const data = await response.json();
      setTasks(tasks.map((t) => (t.id === editingTask.id ? data.data : t)));
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // DELETE TASK
  const deleteTask = async (taskId) => {
    if (!selectedProject) return;
    try {
      await fetch(
        `${API_BASE}/projects/${selectedProject.id}/tasks/${taskId}`,
        { method: "DELETE", headers }
      );
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // TOGGLE STATUS (quick cycle)
  const cycleStatus = async (task) => {
    const currentIdx = STATUS_ORDER.indexOf(task.attributes.status);
    const nextStatus = STATUS_ORDER[(currentIdx + 1) % STATUS_ORDER.length];
    try {
      const response = await fetch(
        `${API_BASE}/projects/${selectedProject.id}/tasks/${task.id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ task: { status: nextStatus } }),
        }
      );
      const data = await response.json();
      setTasks(tasks.map((t) => (t.id === task.id ? data.data : t)));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.attributes.title || "");
    setEditDesc(task.attributes.description || "");
    setEditStatus(task.attributes.status || "todo");
    setEditDueDate(task.attributes.due_date || "");
  };

  const cancelEdit = () => setEditingTask(null);

  const handleProjectKeyDown = (e) => {
    if (e.key === "Enter") createProject();
  };

  const handleTaskKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createTask();
    }
    if (e.key === "Escape") {
      setShowCreateTask(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
    }
  };

  const taskCount = tasks.length;
  const completedCount = tasks.filter(
    (t) => t.attributes.status === "completed"
  ).length;

  return (
    <div className="app">
      {/* ---- Sidebar ---- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span className="brand-name">Taskflow</span>
          </div>

          <div className="create-form">
            <input
              id="create-project-input"
              className="create-input"
              type="text"
              placeholder="New project name…"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={handleProjectKeyDown}
            />
            <button id="create-project-btn" className="create-btn" onClick={createProject}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty-sidebar">
            <div className="empty-sidebar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="empty-sidebar-text">
              No projects yet.<br />
              Create one above to get started.
            </p>
          </div>
        ) : (
          <div className="project-list">
            <div className="project-list-label">Projects</div>
            {projects.map((project) => (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                className={`project-card${selectedProject?.id === project.id ? " active" : ""}`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="project-card-name">
                  {project.attributes.name}
                </div>
                <div className="project-card-id">#{project.id}</div>
              </div>
            ))}
          </div>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-footer-dot" />
          <span className="sidebar-footer-text">Connected to API</span>
        </div>
      </aside>

      {/* ---- Main Content ---- */}
      <main className="main-content">
        {!selectedProject ? (
          <div className="empty-main">
            <div className="empty-main-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <h1 className="empty-main-title">Select a project</h1>
            <p className="empty-main-desc">
              Choose a project from the sidebar to view its details and manage tasks.
            </p>
          </div>
        ) : (
          <div className="project-detail">
            {/* Project header */}
            <div className="project-detail-header">
              <div className="project-detail-overline">Project</div>
              <h1 className="project-detail-title">
                {selectedProject.attributes.name}
              </h1>
              <div className="project-detail-meta">
                <span className="meta-tag">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  ID: {selectedProject.id}
                </span>
                <span className="meta-tag">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  {completedCount}/{taskCount} done
                </span>
              </div>
            </div>

            {/* Tasks area */}
            <div className="task-area">
              <div className="task-area-header">
                <h2 className="task-area-title">Tasks</h2>
                <button
                  id="add-task-btn"
                  className="create-btn"
                  onClick={() => setShowCreateTask(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add task
                </button>
              </div>

              {/* Create task form */}
              {showCreateTask && (
                <div className="task-create-form">
                  <input
                    id="new-task-title"
                    className="task-input"
                    type="text"
                    placeholder="Task title…"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleTaskKeyDown}
                    autoFocus
                  />
                  <textarea
                    id="new-task-desc"
                    className="task-textarea"
                    placeholder="Description (optional)"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    rows={2}
                  />
                  <div className="task-form-actions">
                    <button className="btn-secondary" onClick={() => { setShowCreateTask(false); setNewTaskTitle(""); setNewTaskDesc(""); }}>
                      Cancel
                    </button>
                    <button className="create-btn" onClick={createTask}>
                      Create task
                    </button>
                  </div>
                </div>
              )}

              {/* Task list */}
              {loadingTasks ? (
                <div className="task-loading">
                  <div className="loading-dots">
                    <span /><span /><span />
                  </div>
                  <p>Loading tasks…</p>
                </div>
              ) : tasks.length === 0 && !showCreateTask ? (
                <div className="task-placeholder">
                  <div className="task-placeholder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </div>
                  <div className="task-placeholder-title">No tasks yet</div>
                  <p className="task-placeholder-desc">
                    Click "Add task" to create your first task.
                  </p>
                </div>
              ) : (
                <div className="task-list">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      id={`task-${task.id}`}
                      className={`task-card${task.attributes.status === "completed" ? " task-completed" : ""}`}
                    >
                      {editingTask?.id === task.id ? (
                        /* ---- Edit Mode ---- */
                        <div className="task-edit-form">
                          <input
                            className="task-input"
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Task title"
                            autoFocus
                          />
                          <textarea
                            className="task-textarea"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description"
                            rows={2}
                          />
                          <div className="task-edit-row">
                            <div className="task-edit-fields">
                              <select
                                className="task-select"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                              >
                                {STATUS_ORDER.map((s) => (
                                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                ))}
                              </select>
                              <input
                                className="task-date-input"
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                              />
                            </div>
                            <div className="task-form-actions">
                              <button className="btn-secondary" onClick={cancelEdit}>
                                Cancel
                              </button>
                              <button className="create-btn" onClick={updateTask}>
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* ---- Display Mode ---- */
                        <>
                          <div className="task-card-left">
                            <button
                              className={`task-checkbox ${task.attributes.status}`}
                              onClick={() => cycleStatus(task)}
                              title={`Status: ${STATUS_LABELS[task.attributes.status]} — Click to cycle`}
                            >
                              {task.attributes.status === "completed" && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                              {task.attributes.status === "in_progress" && (
                                <div className="checkbox-progress" />
                              )}
                            </button>
                            <div className="task-card-content">
                              <div className="task-card-title">
                                {task.attributes.title}
                              </div>
                              {task.attributes.description && (
                                <div className="task-card-desc">
                                  {task.attributes.description}
                                </div>
                              )}
                              <div className="task-card-tags">
                                <span className={`status-badge ${task.attributes.status}`}>
                                  {STATUS_LABELS[task.attributes.status]}
                                </span>
                                {task.attributes.due_date && (
                                  <span className="due-badge">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                      <line x1="16" y1="2" x2="16" y2="6" />
                                      <line x1="8" y1="2" x2="8" y2="6" />
                                      <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {task.attributes.due_date}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="task-card-actions">
                            <button
                              className="icon-btn"
                              onClick={() => startEdit(task)}
                              title="Edit task"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              className="icon-btn icon-btn-danger"
                              onClick={() => deleteTask(task.id)}
                              title="Delete task"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;