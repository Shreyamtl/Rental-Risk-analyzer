import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const handleLogout = () => {
    logout();     
    navigate("/");  
  };

  return (
    <nav className="flex justify-between items-center px-10 py-4  border-b border-seal/25">
      <Link to={user ? "/dashboard" : "/"} className="font-serif font-bold text-lg text-paper flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-seal shadow-[0_0_0_3px_rgba(201,162,39,0.2)]" />
        Rental Risk Analyzer
      </Link>
      <div className="flex gap-6 items-center">
        {user ? (
          <>
            {/* <Link to="/Dashboard" className="text-paper/75 hover:text-paper text-sm font-medium">Dashboard</Link> */}
            <span className="text-paper text-sm font-mono">Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              className="text-paper text-sm border border-paper/30 rounded px-4 py-1.5 hover:border-paper transition-colors cursor-pointer"
            >
              Logout
            </button>
            <button onClick={toggle} className={`text-sm rounded px-3 py-1.5 cursor-pointer transition-all duration-200
    ${dark
                ? 'bg-yellow-500 text-ink-900 hover:bg-yellow-400 border border-yellow-500/50'
                : 'bg-ink-900 text-paper hover:bg-ink-800 border border-paper/30 hover:border-paper'
              }
  `}>
              {dark ? "Light" : "Dark"}
            </button>
          </>
        ) : (
          <>
            <Link to="/register" className="bg-yellow-700 text-paper px-3 py-1.5 rounded hover:bg-yellow-600 text-sm font-medium">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}