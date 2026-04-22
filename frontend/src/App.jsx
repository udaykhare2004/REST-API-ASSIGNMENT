import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://rest-api-assignment-vakp.onrender.com/api/v1";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);

  const withAuth = () => (token ? { Authorization: `Bearer ${token}` } : {});

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const api = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...withAuth(),
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  };

  const saveToken = (nextToken) => {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
  };

  const register = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const body = Object.fromEntries(formData.entries());
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
      saveToken(data.data.token);
      showMessage("Registration successful");
      event.target.reset();
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  const login = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const body = Object.fromEntries(formData.entries());
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
      saveToken(data.data.token);
      showMessage("Login successful");
      event.target.reset();
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setProfile(null);
    setTasks([]);
    showMessage("Logged out");
  };

  const fetchProfile = async () => {
    try {
      const data = await api("/auth/me");
      setProfile(data.data);
      showMessage("Fetched profile");
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await api("/tasks");
      setTasks(data.data);
      showMessage("Tasks loaded");
    } catch (error) {
      showMessage(error.message, true);
      setTasks([]);
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const body = Object.fromEntries(formData.entries());
    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify(body),
      });
      showMessage("Task created");
      event.target.reset();
      loadTasks();
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  const toggleTask = async (task) => {
    const next =
      task.status === "pending"
        ? "in_progress"
        : task.status === "in_progress"
        ? "done"
        : "pending";

    try {
      await api(`/tasks/${task._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: next }),
      });
      showMessage("Task updated");
      loadTasks();
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      showMessage("Task deleted");
      loadTasks();
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  return (
    <main className="container">
      <h1>REST API ASSIGNMENT</h1>
      <p className="subtitle">React styled UI for testing authentication and task CRUD APIs.</p>
      {message ? <div className={`message ${isError ? "err" : "ok"}`}>{message}</div> : null}

      <section className="grid">
        <form onSubmit={register} className="card">
          <h2>Register</h2>
          <input name="name" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <select name="role" defaultValue="user">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Register</button>
        </form>

        <form onSubmit={login} className="card">
          <h2>Login</h2>
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Login</button>
          <button type="button" className="secondary" onClick={logout}>
            Logout
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Protected Dashboard</h2>
        <button onClick={fetchProfile}>Get My Profile</button>
        {profile ? <pre>{JSON.stringify(profile, null, 2)}</pre> : null}
      </section>

      <section className="card">
        <h2>Create Task</h2>
        <form onSubmit={createTask}>
          <input name="title" placeholder="Task title" required />
          <input name="description" placeholder="Description" />
          <select name="status" defaultValue="pending">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button type="submit">Create</button>
        </form>
      </section>

      <section className="card">
        <h2>Tasks</h2>
        <button onClick={loadTasks}>Refresh Tasks</button>
        <div>
          {tasks.map((task) => (
            <article key={task._id} className="task">
              <div>
                <strong>{task.title}</strong>
                <p>{task.description || ""}</p>
                <small>Status: {task.status}</small>
              </div>
              <div className="actions">
                <button onClick={() => toggleTask(task)}>Toggle Status</button>
                <button className="danger" onClick={() => deleteTask(task._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
