// Authentication.jsx
import { useState } from "react";

export const Authentication = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const result = onLogin(name, passkey);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Please enter your name and the passkey</h2>
      <div>
        <label>Name:</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Passkey:</label>
        <input
          type="password"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
        />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleLogin}>Submit</button>
    </div>
  );
};
