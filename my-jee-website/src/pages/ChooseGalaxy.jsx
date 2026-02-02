import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChooseGalaxy.css';

export default function ChooseGalaxy() {
  const navigate = useNavigate();
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showDialogue, setShowDialogue] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const dialogues = [
    "Ah… another curious mind awakens.",
    "Once, understanding held the universe together.",
    "But shortcuts replaced clarity… and everything fractured.",
    "These galaxies now drift in confusion.",
    "Restore them — and you restore balance.",
    "Choose wisely, Explorer."
  ];

  const handleNext = () => {
    if (dialogueIndex < dialogues.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
    } else {
      setFadeOut(true);
      setTimeout(() => {
        setShowDialogue(false);
      }, 800);
    }
  };

  const selectGalaxy = (subject) => {
    localStorage.setItem("selectedSubject", subject);
    navigate('/dashboard');
  };

  const goToDuel = () => {
    navigate('/duel-landing');
  };

  return (
    <>
      {/* 🧑‍🔬 DR NEUTRON DIALOGUE */}
      {showDialogue && (
        <div id="dialogue-overlay" className={fadeOut ? 'fade-out' : ''}>
          <div className="dialogue-box">
            <h3>🧑‍🔬 Dr. Neutron</h3>
            <p id="dialogue-text">{dialogues[dialogueIndex]}</p>
            <button id="next-btn" onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {/* 🌌 GALAXY PAGE */}
      <div className={`galaxy-container ${showDialogue ? 'hidden' : ''}`} id="galaxyPage">
        <h1 className="title">Choose Your Galaxy</h1>
        <p className="subtitle">Select a realm to begin your cosmic journey</p>

        <div className="card-wrapper">
          <div className="galaxy-card physics">
            <h2>Physics</h2>
            <p>Explore the universe and its mysteries.</p>
            <button className="enter-btn" onClick={() => selectGalaxy('Physics')}>Enter Galaxy</button>
          </div>

          <div className="galaxy-card chemistry">
            <h2>Chemistry</h2>
            <p>Discover reactions that shape the cosmos.</p>
            <button className="enter-btn" onClick={() => selectGalaxy('Chemistry')}>Enter Galaxy</button>
          </div>

          <div className="galaxy-card maths">
            <h2>Maths</h2>
            <p>Decode the language of the universe.</p>
            <button className="enter-btn" onClick={() => selectGalaxy('Maths')}>Enter Galaxy</button>
          </div>
        </div>

        {/* ⚔️ DUEL CHALLENGES */}
        <div className="duel-container">
          <button className="duel-btn" onClick={goToDuel}>⚔️ Duel Challenges</button>
        </div>
      </div>
    </>
  );
}
