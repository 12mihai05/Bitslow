import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ENDPOINT_URL = "http://localhost:3000/api";

export function useAuth() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    try {
      const response = await fetch(`${ENDPOINT_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error(await response.text());

      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const response = await fetch(`${ENDPOINT_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) throw new Error(await response.text());

      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  const logout = async () => {
    try {
      const res = await fetch(`${ENDPOINT_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const checkToken = async () => {
    try {
      const response = await fetch(`${ENDPOINT_URL}/check-token`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data && data.valid) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error during token verification:", error);
      setIsAuthenticated(false);
    }
  };

  return {
    login,
    register,
    logout,
    checkToken,
    error,
    setError,
    isAuthenticated,
  };
}
