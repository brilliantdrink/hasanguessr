import confetti from 'canvas-confetti'

export default function celebrate() {
  const angle = 40
  const spread = 80

  confetti({
    startVelocity: 15,
    particleCount: 40,
    angle: 90 + angle,
    spread,
    origin: {y: .7, x: 1},
  });
  confetti({
    startVelocity: 15,
    particleCount: 40,
    angle: 90 - angle,
    spread,
    origin: {y: .7, x: 0},
  });
  confetti({
    particleCount: 100,
    angle: 90 + angle,
    spread,
    origin: {y: .7, x: 1},
  });
  confetti({
    particleCount: 100,
    angle: 90 - angle,
    spread,
    origin: {y: .7, x: 0},
  });
  confetti({
    startVelocity: 80,
    particleCount: 200,
    angle: 90 + angle,
    spread,
    origin: {y: .7, x: 1},
  });
  confetti({
    startVelocity: 80,
    particleCount: 200,
    angle: 90 - angle,
    spread,
    origin: {y: .7, x: 0},
  });
}
