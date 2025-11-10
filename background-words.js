// Flying Golden Words Background
const WORDS = [
  'Quiz', 'Brain', 'Wave', 'Gold', 'Reseonance', 'Aloysius', 'Science', 'Fun', 'Logic', 'Spark',
  'Genius', 'Team', 'Win', 'Challenge', 'Fast', 'Smart', 'Learn', 'Play', 'Score', 'Answer',
  'Round', 'Energy', 'Focus', 'Speed', 'Power', 'Mind', 'Solve', 'Think', 'Shine', 'Glory',
  'Victory', 'Quest', 'Explore', 'Bright', 'Elite', 'Quizzer', 'Buzz', 'Flash', 'Skill', 'Dream',
  'Goal', 'Rise', 'Excel', 'Compete', 'Master', 'Lead', 'Edge', 'Peak', 'Top', 'Star', 'Light'
];

const GOLD = '#FFD700';
const SHADOW = 'rgba(191,161,0,0.7)';
const FONT = "2.2em 'Nabla', 'Arial Black', Arial, sans-serif";
const WORD_COUNT = 32;
const SPEED_MIN = 0.4;
const SPEED_MAX = 1.5;
const REPEL_DIST = 120;
const REPEL_FORCE = 2.2;
const RETURN_FORCE = 0.04;

const canvas = document.getElementById('flying-words-bg');
const ctx = canvas.getContext('2d');
let W = window.innerWidth, H = window.innerHeight;
canvas.width = W;
canvas.height = H;

window.addEventListener('resize', () => {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
});

let mouse = { x: -1000, y: -1000 };
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseout', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}
function randomY() {
  return 40 + Math.random() * (H - 80);
}
function randomSpeed() {
  return SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
}
function randomDir() {
  return Math.random() < 0.5 ? 1 : -1;
}

function isUnderGlass(x, y) {
  const resGlass = document.getElementById('resoenance-glass');
  const brainGlass = document.getElementById('brainwave-glass');
  const rects = [resGlass, brainGlass].map(el => el.getBoundingClientRect());
  // Canvas is fixed, so mouse and word coordinates are in viewport space
  return rects.some(rect => (
    x >= rect.left && x <= rect.right &&
    y >= rect.top && y <= rect.bottom
  ));
}

class FlyingWord {
  constructor() {
    this.text = randomWord();
    this.font = FONT;
    ctx.font = this.font;
    this.width = ctx.measureText(this.text).width;
    this.y = randomY();
    this.dir = randomDir();
    this.speed = randomSpeed() * this.dir;
    this.x = this.dir === 1 ? -this.width - Math.random() * W : W + Math.random() * W;
    this.base = { x: this.x, y: this.y, speed: this.speed };
    this.vx = this.speed;
    this.vy = 0;
    this.repelled = false;
  }
  update() {
    // Repel from mouse
    let dx = mouse.x - this.x, dy = mouse.y - this.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < REPEL_DIST) {
      let angle = Math.atan2(dy, dx);
      let force = (REPEL_DIST - dist) / REPEL_DIST * REPEL_FORCE;
      this.vx = -Math.cos(angle) * force * 2 + this.base.speed;
      this.vy = -Math.sin(angle) * force * 2;
      this.repelled = true;
    } else if (this.repelled) {
      // Return to path
      this.vx += (this.base.speed - this.vx) * RETURN_FORCE;
      this.vy += (0 - this.vy) * RETURN_FORCE;
      if (Math.abs(this.vx - this.base.speed) < 0.01 && Math.abs(this.vy) < 0.01) {
        this.vx = this.base.speed;
        this.vy = 0;
        this.repelled = false;
      }
    }
    this.x += this.vx;
    this.y += this.vy;
    // Wrap around
    if (this.dir === 1 && this.x > W + 20) {
      this.reset(-this.width - 20, randomY(), this.dir);
    } else if (this.dir === -1 && this.x < -this.width - 20) {
      this.reset(W + 20, randomY(), this.dir);
    }
  }
  reset(x, y, dir) {
    this.text = randomWord();
    this.font = FONT;
    ctx.font = this.font;
    this.width = ctx.measureText(this.text).width;
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.base.speed = randomSpeed() * dir;
    this.vx = this.base.speed;
    this.vy = 0;
    this.base.x = x;
    this.base.y = y;
    this.repelled = false;
  }
  draw() {
    ctx.save();
    ctx.font = this.font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.shadowColor = SHADOW;
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = GOLD;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

let flyingWords = [];
for (let i = 0; i < WORD_COUNT; ++i) {
  flyingWords.push(new FlyingWord());
}

function animate() {
  ctx.clearRect(0, 0, W, H);
  for (let word of flyingWords) {
    // Blur if under glass
    if (isUnderGlass(word.x, word.y)) {
      ctx.filter = 'blur(3.5px)';
    } else {
      ctx.filter = 'none';
    }
    word.update();
    word.draw();
    ctx.filter = 'none';
  }
  requestAnimationFrame(animate);
}
animate();
