.page {
  padding-top: 120px;
  text-align: center;
  color: white;
}

.login-box {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.login-box input {
  width: 240px;
  padding: 10px;
  border-radius: 6px;
  border: none;
}

.login-box button {
  padding: 10px 26px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}


import { useState } from "react";
import "./index.css";

function Login({ setUser }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {

    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    const userData = {
      username: username
    };

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);   // 🔥 This alone will trigger Feed page
  };

  return (
    <main className="page">
      <h2>Login</h2>

      <div className="login-box">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </main>
  );
}

export default Login;
