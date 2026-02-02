import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/choose-galaxy');
  };

  return (
    <div className="container">
      {/* LEFT SECTION */}
      <div className="left-section">
        <h2 className="logo">Clario</h2>
        <h3>Learn. Explore. Conquer the Galaxy.</h3>

        <div className="astronaut-card">
          <img src="/setup/jn6nvpEKvoBwWPP3hNEnWa.png" alt="Astronaut floating in space" />

          <div className="welcome-box">
            <p>
              Welcome back, Space Explorer! <br />
              Ready to continue your journey through <br />
              the galaxy of knowledge?
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="right-section">
        <div className="tab">
          <button className="active">Login</button>
          <button onClick={() => navigate('/signup')}>Sign Up</button>
        </div>

        <div className="login-card">
          <h3>Welcome Back, Space Explorer!</h3>
          <p className="subtitle">Continue your journey through the cosmos</p>

          <form id="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="explorer@galaxy.space" required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" required />
            </div>

            <div className="options">
              <label>
                <input type="checkbox" /> Remember Me
              </label>
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit" className="launch-btn">
              🚀 Launch into Learning
            </button>
          </form>

          <p className="signup-text">
            Don't have an account?
            <Link to="/signup">Start your space mission →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
