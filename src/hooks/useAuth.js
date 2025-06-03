// useAuth.js
import { useState, useEffect } from "react";

const PASSKEY = "123456";

const generateRandomName = () => {
  const adjectives = ["Quick", "Lazy", "Clever", "Brave", "Happy"];
  const animals = ["Fox", "Hawk", "Otter", "Lion", "Panda"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective}${animal}${Math.floor(Math.random() * 1000)}`;
};

export const useAuth = () => {
  const [userName, setUserName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (isDev) {
      const devName = generateRandomName();
      setUserName(devName);
      setIsAuthenticated(true);
    }
  }, [isDev]);

  const login = (inputName, inputPasskey) => {
    if (inputPasskey === PASSKEY && inputName.trim()) {
      setUserName(inputName.trim());
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return { success: false, message: "Incorrect passkey or empty name." };
    }
  };

  return { userName, isAuthenticated, login };
};