// Authentication.jsx
import { useState, useEffect } from "react";

const PASSKEY = '123456';

const generateRandomName = () => {
  const adjectives = ["Quick", "Lazy", "Clever", "Brave", "Happy"];
  const animals = ["Fox", "Hawk", "Otter", "Lion", "Panda"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective}${animal}${Math.floor(Math.random() * 1000)}`;
};

export const Authentication = ({ onAuthenticated }) => {
  const isDev = process.env.NODE_ENV === 'development';

  const [name, setName] = useState('');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDev) {
      const devName = generateRandomName();
      onAuthenticated(devName);
    }
  }, [isDev, onAuthenticated]);

  const handleLogin = () => {
    if (passkeyInput === PASSKEY && name.trim()) {
      onAuthenticated(name.trim());
    } else {
      setError('Incorrect passkey or empty name.');
    }
  };

  if (isDev) return null;

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <div>
        <label>Prolific ID:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={passkeyInput}
          onChange={(e) => setPasskeyInput(e.target.value)}
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleLogin}>Submit</button>
    </div>
  );
};
