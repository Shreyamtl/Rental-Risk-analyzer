import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-70px)] px-4">
      <form
        onSubmit={handleSubmit}
        className="relative bg-paper dark:bg-ink-800 w-[420px] min-h-[400px] rounded p-11 pt-10 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] border-t-4 border-seal"
      >
        <h2 className="text-2xl text-ink-900 dark:text-paper mb-5 text-center">Register</h2>
        {error && <p className="text-redline text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="px-3.5 py-3 border border-[#D8D3C2] dark:border-white/20 border-b-2 border-b-[#B9B29A] dark:border-b-white/30 rounded-sm bg-[#FFFEF9] dark:bg-ink-900 dark:text-paper text-sm focus:outline-none focus:border-b-seal"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3.5 py-3 border border-[#D8D3C2] dark:border-white/20 border-b-2 border-b-[#B9B29A] dark:border-b-white/30 rounded-sm bg-[#FFFEF9] dark:bg-ink-900 dark:text-paper text-sm focus:outline-none focus:border-b-seal"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-3.5 py-3 border border-[#D8D3C2] dark:border-white/20 border-b-2 border-b-[#B9B29A] dark:border-b-white/30 rounded-sm bg-[#FFFEF9] dark:bg-ink-900 dark:text-paper text-sm focus:outline-none focus:border-b-seal"
        />
        <button
          type="submit"
          className="bg-seal text-ink-900 py-3.5 rounded-sm font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(201,162,39,0.35)] transition-all mb-5"
        >
          Register
        </button>
        <p className="text-sm text-muted dark:text-paper/60 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-ink-900 dark:text-paper font-semibold hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
