import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showNeutronOverlay, setShowNeutronOverlay] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Physics');

  useEffect(() => {
    const subject = localStorage.getItem('selectedSubject') || 'Physics';
    setSelectedSubject(subject);
  }, []);

  const openNeutron = () => {
    setShowNeutronOverlay(true);
  };

  const closeNeutron = () => {
    setShowNeutronOverlay(false);
    navigate('/motion-1d');
  };

  const chapters = [
    'Units & Measurements',
    'Motion in 1D',
    'Motion in 2D',
    'Laws of Motion',
    'Work, Energy & Power',
    'System of Particles',
    'Gravitation',
    'Properties of Bulk Matter',
    'Thermodynamics',
    'Kinetic Theory',
    'Oscillations & Waves',
    'Electrostatics',
    'Current Electricity',
    'Magnetism',
    'EM Induction & AC',
    'EM Waves',
    'Optics',
    'Dual Nature',
    'Atoms & Nuclei'
  ];

  return (
    <>
      <div className="subject-container">
        <h1 className="galaxy-title">{selectedSubject} Galaxy</h1>
        <p className="galaxy-subtitle">Conquer each planet to restore balance</p>

        <div className="chapter-grid">
          {chapters.map((chapter, index) => (
            <div
              key={index}
              className={`chapter-card ${chapter === 'Motion in 1D' ? 'motion1d' : ''}`}
              onClick={chapter === 'Motion in 1D' ? openNeutron : undefined}
            >
              <h3>{chapter}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* DR NEUTRON OVERLAY */}
      <div id="neutronOverlay" className={`neutron-overlay ${showNeutronOverlay ? 'active' : ''}`}>
        <div className="neutron-box">
          <h2>Dr. Neutron</h2>

          <p>This world moves along a single path.</p>
          <p>Every position has meaning. Every direction matters.</p>

          <p className="highlight">
            Understand motion in one dimension… and balance will return.
          </p>

          <button onClick={closeNeutron}>Begin Journey</button>
        </div>
      </div>
    </>
  );
}
