/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

let pos;
let colors;
const moveSpeed = 0.4;
const moveScale = 800;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#162a25');
  noStroke();

  colors = [
    color('#77c39c'),
    color('#2f5e36'),
    color('#55aba5'),
    color('#2d7063'),
    color('#3f6829'),
    color('#44a872'),
    color('#215964'),
    color('#162a25'),
    color('#162a25'),
    color('#162a25'),
    color('#162a25'),
    color('#000000'),
    color('#cdedae'),
  ];
  pos = [];
  for (let i = 0; i < 500; i++) {
    pos.push(newParticle(random(width), random(height)));
  }
}

function newParticle(x, y) {
  return {
    x,
    y,
    c: colors[floor(random(colors.length))],
    r: floor(random(4)),
    n: 0,
  };
}

function draw() {
  for (let i = 0; i < pos.length; i++) {
    const p = pos[i];
    let angle =            noise(p.x / moveScale, p.y / moveScale) * TWO_PI * moveScale; // I never understood why end by multiplying by moveScale
    angle = atan2(p.y - height / 2, p.x - width / 2);
    angle = -getAngleGrad(
      (p.x - width / 2) / 100,
      -(p.y - height / 2) / 100,
    );
    angle += (p.r * PI) / 2;
    p.x += cos(angle) * moveSpeed;
    p.y += sin(angle) * moveSpeed;
    fill(p.c);
    ellipse(p.x, p.y, 2, 2);
    if (
      p.x > width
            || p.x < 0
            || p.y > height
            || p.y < 0
            || random(1) < 0.001
    ) {
      p.x = random(width);
      p.y = random(height);
    }
  }
}

function getAngleGrad(x, y) {
  debugger;
  let grad = { x: 1, y: 0 };
  const a = { x: -2, y: -1 };
  const b = { x: 2, y: -1 };
  const ap = { x: x - a.x, y: y - a.y };
  const bp = { x: x - b.x, y: y - b.y };
  const e1sq = ap.x * ap.x + ap.y * ap.y;
  const e2sq = bp.x * bp.x + bp.y * bp.y;
  // const e1 = sqrt(e1sq) ;
  // const e2 = sqrt(e2sq) ;
  const cot1 = ap.x / ap.y;
  const cot2 = -bp.x / bp.y;
  grad = {
    x: (ap.x * cot1) / e1sq + (bp.x * cot2) / e2sq,
    y: (ap.y * cot1) / e1sq + (bp.y * cot2) / e2sq,
  };

  return Math.atan2(grad.y, grad.x);
}

function mousePressed() {
  for (let i = 0; i < 10; i++) {
    pos.push(
      newParticle(mouseX + random(-30, 30), mouseY + random(-30, 30)),
    );
  }
}

function mouseDragged() {
  mousePressed();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
