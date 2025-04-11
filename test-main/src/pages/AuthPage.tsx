import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuth } from "../hooks/useAuth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const { login, register, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await fetch("/api/check-token");
        const data = await res.json();
        if (data.valid) navigate("/profile");
      } catch (err) {
        console.log("Token check failed:", err);
      }
    };

    if (Cookies.get("token")) navigate("/profile");
    else checkToken();
  }, [navigate]);

  const validateInputs = () => {
    if (!email || !password || (!isLogin && !name)) {
      return "All fields are required.";
    }

    if (!isLogin) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        return "Invalid email format.";
      }
      if (password.length < 6) {
        return "Password must be at least 6 characters.";
      }
      if (!/[A-Z]/.test(password)) {
        return "Password must include at least one uppercase letter.";
      }
      if (!/\d/.test(password)) {
        return "Password must include at least one number.";
      }
      if (password !== repeatPassword) {
        return "Passwords do not match.";
      }

      const nameParts = name.trim().split(" ");
      const isProperlyCased = nameParts.every((part) => /^[A-Z].*$/.test(part));

      if (!isProperlyCased) {
        return "Name must start with a capital letter for each word.";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (isLogin) await login(email, password);
    else await register(name, email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none"
            />
          )}
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none"
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Repeat Password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="w-full p-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-gray-800 outline-none"
            />
          )}
          <button
            type="submit"
            className="w-full p-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors duration-200 cursor-pointer"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="text-center text-sm mt-6 text-gray-700 hover:text-blue-600 cursor-pointer transition"
        >
          {isLogin
            ? "New here? Create an account"
            : "Already registered? Log in"}
        </p>
      </div>
    </div>
  );
}
