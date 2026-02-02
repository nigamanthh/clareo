import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';

export const Motion1D = ({ concept, title, initialVelocity = 0, acceleration = 2, showGraph = false, motionType = 'linear', angle = 45 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animation timing
  const introEnd = fps * 1; // 1 second intro
  const motionDuration = durationInFrames - introEnd - fps;

  // Calculate position based on equations of motion
  const progress = Math.max(0, Math.min(1, (frame - introEnd) / motionDuration));
  const time = progress * 5; // 5 seconds of motion

  // Physics calculations based on motion type
  let spaceshipX, spaceshipY, velocity, horizontalVelocity, verticalVelocity, displacement;

  if (motionType === 'projectile') {
    // Projectile motion with gravity
    const gravity = 9.8; // m/s²
    const angleRad = (angle * Math.PI) / 180;
    const u_x = initialVelocity * Math.cos(angleRad);
    const u_y = initialVelocity * Math.sin(angleRad);

    // x(t) = u_x * t
    const x = u_x * time;

    // y(t) = u_y * t - (1/2) * g * t²
    const y = u_y * time - 0.5 * gravity * time * time;

    // Position on screen
    spaceshipX = 100 + x * 40; // Scale for visibility
    spaceshipY = 600 - y * 40; // Invert Y axis (screen coordinates)

    // Velocity components
    horizontalVelocity = u_x;
    verticalVelocity = u_y - gravity * time;
    velocity = Math.sqrt(horizontalVelocity * horizontalVelocity + verticalVelocity * verticalVelocity);

    // For projectile, displacement is horizontal distance
    displacement = x;
  } else {
    // Linear 1D motion
    // s = ut + (1/2)at²
    displacement = initialVelocity * time + 0.5 * acceleration * time * time;
    spaceshipX = 100 + displacement * 60; // Scale for visibility
    spaceshipY = 300;

    // v = u + at
    velocity = initialVelocity + acceleration * time;
  }

  // Constants for visualization
  const arrowScale = 50;

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a0f2e' }}>
      {/* Stars background */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
        {[...Array(50)].map((_, i) => (
          <circle
            key={i}
            cx={Math.random() * 1920}
            cy={Math.random() * 1080}
            r={Math.random() * 2 + 1}
            fill="white"
            opacity={Math.random() * 0.7 + 0.3}
          />
        ))}
      </svg>

      {/* Title */}
      <Sequence from={0} durationInFrames={introEnd}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 72,
          color: '#fff',
          fontWeight: 'bold',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          opacity: interpolate(frame, [0, 15, introEnd - 10, introEnd], [0, 1, 1, 0])
        }}>
          {title}
        </div>
      </Sequence>

      {/* Motion Animation */}
      <Sequence from={introEnd}>
        <svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
          {/* Ground/Reference line */}
          <line
            x1="0"
            y1={motionType === 'projectile' ? 680 : spaceshipY + 80}
            x2="1920"
            y2={motionType === 'projectile' ? 680 : spaceshipY + 80}
            stroke="#444"
            strokeWidth="2"
            strokeDasharray="10,5"
          />

          {/* Trajectory path for projectile motion */}
          {motionType === 'projectile' && time > 0 && (
            <polyline
              points={[...Array(Math.floor(time * 20))].map((_, i) => {
                const t = i / 20;
                const gravity = 9.8;
                const angleRad = (angle * Math.PI) / 180;
                const u_x = initialVelocity * Math.cos(angleRad);
                const u_y = initialVelocity * Math.sin(angleRad);
                const x = 100 + u_x * t * 40;
                const y = 600 - (u_y * t - 0.5 * gravity * t * t) * 40;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#ff6b6b"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          )}

          {/* Spaceship (simple rocket shape) */}
          <g transform={`translate(${spaceshipX}, ${spaceshipY - 40})`}>
            {/* Rocket body */}
            <polygon
              points="40,10 50,50 30,50"
              fill="#6a5af9"
            />
            {/* Nose cone */}
            <polygon
              points="40,10 35,20 45,20"
              fill="#8b7aff"
            />
            {/* Fins */}
            <polygon
              points="30,50 25,65 30,60"
              fill="#5848d9"
            />
            <polygon
              points="50,50 55,65 50,60"
              fill="#5848d9"
            />
            {/* Window */}
            <circle cx="40" cy="30" r="8" fill="#4a4a6a" />
          </g>

          {/* Displacement arrow (only for linear motion) */}
          {motionType === 'linear' && displacement > 0 && (
            <g>
              <line
                x1="100"
                y1={spaceshipY + 100}
                x2={spaceshipX}
                y2={spaceshipY + 100}
                stroke="#ff6b6b"
                strokeWidth="3"
              />
              <polygon
                points={`${spaceshipX},${spaceshipY + 100} ${spaceshipX - 10},${spaceshipY + 95} ${spaceshipX - 10},${spaceshipY + 105}`}
                fill="#ff6b6b"
              />
              <text
                x={(100 + spaceshipX) / 2}
                y={spaceshipY + 130}
                fill="#ff6b6b"
                fontSize="20"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
              >
                Displacement (s)
              </text>
            </g>
          )}

          {/* Velocity arrows */}
          {motionType === 'projectile' ? (
            <>
              {/* Horizontal velocity component */}
              {horizontalVelocity > 0 && (
                <g>
                  <line
                    x1={spaceshipX + 40}
                    y1={spaceshipY}
                    x2={spaceshipX + 40 + horizontalVelocity * arrowScale}
                    y2={spaceshipY}
                    stroke="#51cf66"
                    strokeWidth="3"
                  />
                  <polygon
                    points={`${spaceshipX + 40 + horizontalVelocity * arrowScale},${spaceshipY} ${spaceshipX + 35 + horizontalVelocity * arrowScale},${spaceshipY - 5} ${spaceshipX + 35 + horizontalVelocity * arrowScale},${spaceshipY + 5}`}
                    fill="#51cf66"
                  />
                  <text
                    x={spaceshipX + 40 + (horizontalVelocity * arrowScale) / 2}
                    y={spaceshipY - 15}
                    fill="#51cf66"
                    fontSize="16"
                    textAnchor="middle"
                    fontFamily="Arial, sans-serif"
                  >
                    vₓ = {horizontalVelocity.toFixed(1)} m/s
                  </text>
                </g>
              )}

              {/* Vertical velocity component */}
              <g>
                <line
                  x1={spaceshipX + 40}
                  y1={spaceshipY}
                  x2={spaceshipX + 40}
                  y2={spaceshipY - verticalVelocity * arrowScale}
                  stroke="#4dabf7"
                  strokeWidth="3"
                />
                <polygon
                  points={`${spaceshipX + 40},${spaceshipY - verticalVelocity * arrowScale} ${spaceshipX + 35},${spaceshipY - verticalVelocity * arrowScale + (verticalVelocity > 0 ? 10 : -10)} ${spaceshipX + 45},${spaceshipY - verticalVelocity * arrowScale + (verticalVelocity > 0 ? 10 : -10)}`}
                  fill="#4dabf7"
                />
                <text
                  x={spaceshipX + 70}
                  y={spaceshipY - (verticalVelocity * arrowScale) / 2}
                  fill="#4dabf7"
                  fontSize="16"
                  textAnchor="start"
                  fontFamily="Arial, sans-serif"
                >
                  vᵧ = {verticalVelocity.toFixed(1)} m/s
                </text>
              </g>

              {/* Resultant velocity */}
              <text
                x={spaceshipX + 40}
                y={spaceshipY + 80}
                fill="#fff"
                fontSize="18"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
              >
                v = {velocity.toFixed(1)} m/s
              </text>
            </>
          ) : (
            /* Linear motion velocity arrow */
            velocity > 0 && (
              <g>
                <line
                  x1={spaceshipX + 40}
                  y1={spaceshipY}
                  x2={spaceshipX + 40 + velocity * arrowScale}
                  y2={spaceshipY}
                  stroke="#51cf66"
                  strokeWidth="3"
                />
                <polygon
                  points={`${spaceshipX + 40 + velocity * arrowScale},${spaceshipY} ${spaceshipX + 35 + velocity * arrowScale},${spaceshipY - 5} ${spaceshipX + 35 + velocity * arrowScale},${spaceshipY + 5}`}
                  fill="#51cf66"
                />
                <text
                  x={spaceshipX + 40 + (velocity * arrowScale) / 2}
                  y={spaceshipY - 15}
                  fill="#51cf66"
                  fontSize="18"
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                >
                  v = {velocity.toFixed(1)} m/s
                </text>
              </g>
            )
          )}

          {/* Acceleration/Gravity arrow */}
          {motionType === 'projectile' ? (
            /* Gravity arrow for projectile motion */
            <g>
              <line
                x1={spaceshipX + 80}
                y1={spaceshipY}
                x2={spaceshipX + 80}
                y2={spaceshipY + 9.8 * arrowScale}
                stroke="#ffd43b"
                strokeWidth="3"
              />
              <polygon
                points={`${spaceshipX + 80},${spaceshipY + 9.8 * arrowScale} ${spaceshipX + 75},${spaceshipY + 9.8 * arrowScale - 10} ${spaceshipX + 85},${spaceshipY + 9.8 * arrowScale - 10}`}
                fill="#ffd43b"
              />
              <text
                x={spaceshipX + 110}
                y={spaceshipY + (9.8 * arrowScale) / 2}
                fill="#ffd43b"
                fontSize="16"
                textAnchor="start"
                fontFamily="Arial, sans-serif"
              >
                g = 9.8 m/s²
              </text>
            </g>
          ) : (
            /* Acceleration arrow for linear motion */
            acceleration !== 0 && (
              <g>
                <line
                  x1={spaceshipX + 40}
                  y1={spaceshipY + 40}
                  x2={spaceshipX + 40 + acceleration * arrowScale}
                  y2={spaceshipY + 40}
                  stroke="#ffd43b"
                  strokeWidth="3"
                />
                <polygon
                  points={`${spaceshipX + 40 + acceleration * arrowScale},${spaceshipY + 40} ${spaceshipX + 35 + acceleration * arrowScale},${spaceshipY + 35} ${spaceshipX + 35 + acceleration * arrowScale},${spaceshipY + 45}`}
                  fill="#ffd43b"
                />
                <text
                  x={spaceshipX + 40 + (acceleration * arrowScale) / 2}
                  y={spaceshipY + 70}
                  fill="#ffd43b"
                  fontSize="18"
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                >
                  a = {acceleration} m/s²
                </text>
              </g>
            )
          )}
        </svg>

        {/* Equations display */}
        <div style={{
          position: 'absolute',
          top: 50,
          left: 50,
          backgroundColor: 'rgba(42, 42, 62, 0.9)',
          padding: '20px',
          borderRadius: '10px',
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          lineHeight: '1.8'
        }}>
          {motionType === 'projectile' ? (
            <>
              <div>t = {time.toFixed(2)} s</div>
              <div>u = {initialVelocity} m/s</div>
              <div>θ = {angle}°</div>
              <div style={{ marginTop: '10px', borderTop: '1px solid #666', paddingTop: '10px' }}>
                uₓ = u cos θ = {horizontalVelocity.toFixed(2)} m/s
              </div>
              <div>
                uᵧ = u sin θ = {(initialVelocity * Math.sin((angle * Math.PI) / 180)).toFixed(2)} m/s
              </div>
              <div style={{ marginTop: '10px', borderTop: '1px solid #666', paddingTop: '10px' }}>
                x = uₓ × t
              </div>
              <div>
                y = uᵧ × t - ½gt²
              </div>
              <div style={{ marginTop: '10px' }}>
                v = {velocity.toFixed(2)} m/s
              </div>
            </>
          ) : (
            <>
              <div>t = {time.toFixed(2)} s</div>
              <div>s = {(initialVelocity * time + 0.5 * acceleration * time * time).toFixed(2)} m</div>
              <div>u = {initialVelocity} m/s</div>
              <div>a = {acceleration} m/s²</div>
              <div style={{ marginTop: '10px', borderTop: '1px solid #666', paddingTop: '10px' }}>
                v² = u² + 2as
              </div>
              <div>
                v = {velocity.toFixed(2)} m/s
              </div>
            </>
          )}
        </div>

        {/* Graph (if enabled) */}
        {showGraph && (
          <div style={{
            position: 'absolute',
            bottom: 50,
            right: 50,
            width: 400,
            height: 300,
            backgroundColor: 'rgba(42, 42, 62, 0.9)',
            borderRadius: '10px',
            padding: '20px'
          }}>
            <svg width="360" height="260">
              {/* Axes */}
              <line x1="40" y1="220" x2="340" y2="220" stroke="#fff" strokeWidth="2" />
              <line x1="40" y1="20" x2="40" y2="220" stroke="#fff" strokeWidth="2" />

              {/* Velocity-time graph */}
              <polyline
                points={[...Array(Math.floor(time * 20))].map((_, i) => {
                  const t = i / 20;
                  const v = initialVelocity + acceleration * t;
                  return `${40 + t * 50},${220 - v * 20}`;
                }).join(' ')}
                fill="none"
                stroke="#51cf66"
                strokeWidth="3"
              />

              {/* Labels */}
              <text x="190" y="250" fill="#fff" fontSize="14" textAnchor="middle">Time (s)</text>
              <text x="15" y="120" fill="#fff" fontSize="14" transform="rotate(-90, 15, 120)">Velocity (m/s)</text>
            </svg>
          </div>
        )}
      </Sequence>
    </AbsoluteFill>
  );
};
