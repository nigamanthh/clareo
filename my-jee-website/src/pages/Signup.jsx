import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

  const toggleSubject = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

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
              Ready to begin your cosmic journey?<br />
              Sign up and start exploring your learning galaxies!
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="right-section">
        <div className="tab">
          <button onClick={() => navigate('/login')}>Login</button>
          <button className="active">Sign Up</button>
        </div>

        <div className="signup-card">
          <h3>Join the Clario Universe</h3>
          <p className="subtitle">Create your explorer profile</p>

          <form onSubmit={handleSubmit}>
            {/* Inputs */}
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" placeholder="Your cosmic name" required />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="explorer@galaxy.space" required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Create a secure password" required />
            </div>

            <div className="input-group">
              <label>Class</label>
              <select required>
                <option value="">Select your class</option>
                <option value="11">11th</option>
                <option value="12">12th</option>
              </select>
            </div>

            {/* Subjects */}
            <div className="subjects">
              <label className="subject-label">Select Your Subject Galaxies</label>
              <div className="subject-grid">
                {subjects.map((subject) => (
                  <div
                    key={subject}
                    className={`subject ${selectedSubjects.includes(subject) ? 'active' : ''}`}
                    onClick={() => toggleSubject(subject)}
                  >
                    {subject}
                  </div>
                ))}
              </div>
            </div>

            {/* Agreement */}
            <div className="agreement">
              <label>
                <input type="checkbox" required />
                I'm ready to explore the galaxy of knowledge and agree to the cosmic terms.
              </label>
            </div>

            <button type="submit" className="launch-btn">🚀 Start Journey</button>

            <p className="signup-text">
              Already have an account?
              <Link to="/login">Launch into Learning →</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
