import './Navbar.css';
import { FaHeart, FaHome, FaUserCircle } from 'react-icons/fa';
import { MdTimer, MdKeyboardVoice, MdOutlineRestaurantMenu } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const LogoIcon = () => <MdKeyboardVoice />;
const HomeIcon = () => <FaHome />;
const FavoritesIcon = () => <FaHeart />;
const TimersIcon = () => <MdTimer />;
const MainMenuIcon = () => <MdOutlineRestaurantMenu />;
const LoginIcon = () => <FaUserCircle />;

const Navbar = () => {
  const { currentUser, logout } = useAuth(); // 2. Get user and logout function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <LogoIcon />
        </div>
        <h1 className="navbar-title">Voice Cooking Assistant</h1>
      </div>
      <nav className="navbar-right">
        <ul className="navbar-links">
          {/* 3. Use <Link> for navigation instead of <a> */}
          <li className="nav-item">
            <Link to="/" className="nav-link">
              <HomeIcon />
              <span>Home</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/favorites" className="nav-link">
              <FavoritesIcon />
              <span>Favorites</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/timers" className="nav-link">
              <TimersIcon />
              <span>Timers</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/main-menu" className="nav-link">
              <MainMenuIcon />
              <span>Main Menu</span>
            </Link>
          </li>
        </ul>
        {/* 4. Add dynamic Login/Logout section */}
        <div className="auth-section">
          {currentUser ? (
            <>
              <span className="user-name">Hello, {currentUser.name}</span>
              <button onClick={handleLogout} className="auth-button">Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              <LoginIcon />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;