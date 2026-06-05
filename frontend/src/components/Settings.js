import { useEffect, useState } from "react";

function Settings() {
  const defaultSettings = {
    libraryName: "Late S. Chattar Singh Tehsildar Memorial Library",
    studentIssueDays: 14,
    teacherIssueDays: 30,
    finePerDay: 1,
    maxFine: 100,
    darkMode: false,
    users: [
      {
        name: "Super Admin",
        username: "superadmin",
        password: "super123",
        role: "Super Admin",
        status: "Active",
      },
      {
        name: "Librarian",
        username: "librarian",
        password: "lib123",
        role: "Librarian",
        status: "Active",
      },
      {
        name: "Assistant",
        username: "assistant",
        password: "assist123",
        role: "Assistant",
        status: "Active",
      },
    ],
  };

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("librarySettings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    role: "Librarian",
    status: "Active",
  });

  useEffect(() => {
  fetchUsers();
}, []);

const fetchUsers = async () => {
  try {
    const response = await fetch(
      "https://library-lms-backend.onrender.com/api/auth/users"
    );

    const data = await response.json();

    setSettings((prev) => ({
      ...prev,
      users: data || [],
    }));
  } catch (error) {
    console.log(error);
  }
};

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNewUserChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const addUser = async () => {
  if (!newUser.name || !newUser.username || !newUser.password) {
    alert("Please fill name, username and password");
    return;
  }

  try {
    const response = await fetch(
      "https://library-lms-backend.onrender.com/api/auth/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      }
    );

    const data = await response.json();

    if (!response.ok) {
  alert(data.error || data.message || "User creation failed");
  return;
}

    fetchUsers();

    setNewUser({
      name: "",
      username: "",
      password: "",
      role: "Librarian",
      status: "Active",
    });

    alert("User created successfully");
  } catch (error) {
    console.log(error);
    alert(error.message || "Error creating user");
  }
};

  const deleteUser = async (id) => {
  if (!window.confirm("Delete this user?")) return;

  try {
    await fetch(
      `https://library-lms-backend.onrender.com/api/auth/users/${id}`,
      {
        method: "DELETE",
      }
    );

    fetchUsers();

    alert("User deleted successfully");
  } catch (error) {
    console.log(error);
    alert("Delete failed");
  }
};

  const saveSettings = () => {
    localStorage.setItem("librarySettings", JSON.stringify(settings));
    alert("Settings saved successfully");
  };

  return (
    <section className="section-card">
      <h2>System Settings</h2>
      <p>
        Configure library information, login users, issue duration and fine
        settings.
      </p>

      <br />

      <h3>Library Information</h3>

      <div className="form-box">
        <input
          name="libraryName"
          value={settings.libraryName}
          onChange={handleSettingChange}
          placeholder="Library Name"
        />
      </div>

      <h3>User Login Accounts</h3>

      <div className="form-box">
        <input
          name="name"
          value={newUser.name}
          onChange={handleNewUserChange}
          placeholder="User Name"
        />

        <input
          name="username"
          value={newUser.username}
          onChange={handleNewUserChange}
          placeholder="Login ID"
        />

        <input
          name="password"
          value={newUser.password}
          onChange={handleNewUserChange}
          placeholder="Password"
        />

        <select
          name="role"
          value={newUser.role}
          onChange={handleNewUserChange}
        >
          <option>Super Admin</option>
          <option>Librarian</option>
          <option>Assistant</option>
        </select>

        <button type="button" onClick={addUser}>
          Add User
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Login ID</th>
            <th>Password</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {(settings.users || []).map((u, index) => (
            <tr key={index}>
              <td>{u.name || u.username}</td>
              <td>{u.username}</td>
              <td>{u.password}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => deleteUser(u._id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <h3>Issue Duration Settings</h3>

      <div className="form-box">
        <input
          type="number"
          name="studentIssueDays"
          value={settings.studentIssueDays}
          onChange={handleSettingChange}
          placeholder="Student Issue Days"
        />

        <input
          type="number"
          name="teacherIssueDays"
          value={settings.teacherIssueDays}
          onChange={handleSettingChange}
          placeholder="Teacher Issue Days"
        />
      </div>

      <h3>Fine Settings</h3>

      <div className="form-box">
        <input
          type="number"
          name="finePerDay"
          value={settings.finePerDay}
          onChange={handleSettingChange}
          placeholder="Fine Per Day"
        />

        <input
          type="number"
          name="maxFine"
          value={settings.maxFine}
          onChange={handleSettingChange}
          placeholder="Maximum Fine"
        />
      </div>

      <h3>Other Settings</h3>

      <label>
        <input
          type="checkbox"
          name="darkMode"
          checked={settings.darkMode}
          onChange={handleSettingChange}
        />
        Enable Dark Mode
      </label>

      <br />
      <br />

      <button className="edit-btn" onClick={saveSettings}>
        💾 Save All Settings
      </button>

      <br />
      <br />

      <h3>Current Configuration</h3>

      <table>
        <tbody>
          <tr>
            <th>Library Name</th>
            <td>{settings.libraryName}</td>
          </tr>
          <tr>
            <th>Student Issue Duration</th>
            <td>{settings.studentIssueDays} Days</td>
          </tr>
          <tr>
            <th>Teacher Issue Duration</th>
            <td>{settings.teacherIssueDays} Days</td>
          </tr>
          <tr>
            <th>Fine Per Day</th>
            <td>₹{settings.finePerDay}</td>
          </tr>
          <tr>
            <th>Maximum Fine</th>
            <td>₹{settings.maxFine}</td>
          </tr>
          <tr>
            <th>Dark Mode</th>
            <td>{settings.darkMode ? "Enabled" : "Disabled"}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default Settings;