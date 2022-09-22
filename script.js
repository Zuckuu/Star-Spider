let width, height;
const ctx = canvas.getContext("2d");
const { sin, cos, PI, hypot, min, max } = Math;

//Random num function
function rnd(x = 1, dx = 0) {
  return Math.random() * x + dx;
}

//recalc funtion
function recalc(X, Y) {
  tx = X;
  ty = Y;
}

//drawCircle funtion
function drawCircle(x, y, r) {
  ctx.beginPath();
  ctx.ellipse(x, y, r + 1, r + 1, 0, 0, PI * 2);
  ctx.fill();
}

//drawLine function
function drawLine(x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);

  many(100, (i) => {
    i = (i + 1) / 100;
    let x = lerp(x0, x1, i);
    let y = lerp(y0, y1, i);
    let k = noise(x / 5 + x0, y / 5 + y0) * 2;
    ctx.lineTo(x + k, y + k);
  });

  ctx.stroke();
}

//many funtion
function many(n, f) {
  return [...Array(n)].map((_, i) => f(i));
}

//lerp
function lerp(a, b, t) {
  return a + (b - a) * t;
}

//noise
function noise(x, y, t = 101) {
  let w0 = sin(0.3 * x + 1.4 * t + 2.0 + 2.5 * sin(0.4 * y + -1.3 * t + 1.0));
  let w1 = sin(0.2 * y + 1.5 * t + 2.8 + 2.3 * sin(0.5 * x + -1.2 * t + 0.5));
  return w0 + w1;
}

//pt
function pt(x, y) {
  return { x, y };
}

//refresh frame function
requestAnimationFrame(function anim(t) {
  if (width !== innerWidth) width = canvas.width = innerWidth;
  if (height !== innerHeight) height = canvas.height = innerHeight;
  ctx.fillStyle = "#FFF";
  drawCircle(0, 0, width * 10);
  ctx.fillStyle = ctx.strokeStyle = "#000";
  t /= 1000;
  spiders.forEach((spider) => spider.tick(t));
  requestAnimationFrame(anim);
});

//Spawn function
function spawn() {
  const pts = many(600, () => {
    return {
      x: rnd(innerWidth),
      y: rnd(innerHeight),
      len: 0,
      r: 0,
    };
  });

  const pts2 = many(8, (i) => {
    return {
      x: cos((i / 9) * PI * 2),
      y: sin((i / 9) * PI * 2),
    };
  });

  let seed = rnd(200);
  let tx = rnd(innerWidth + 400);
  let ty = rnd(innerHeight);
  let x = rnd(innerWidth);
  let y = rnd(innerHeight);
  let kx = rnd(0.5, 0.5);
  let ky = rnd(0.5, 0.5);
  let walkRadius = pt(rnd(50, 50), rnd(50, 50));
  let r = innerWidth / rnd(100, 150);

  function paintPt(pt) {
    pts2.forEach((pt2) => {
      if (!pt.len) return;
      drawLine(
        lerp(x + pt2.x * r, pt.x, pt.len * pt.len),
        lerp(y + pt2.y * r, pt.y, pt.len * pt.len),
        x + pt2.x * r,
        y + pt2.y * r
      );
    });
    drawCircle(pt.x, pt.y, pt.r);
  }

  return {
    follow(x, y) {
      tx = x;
      ty = y;
    },

    tick(t) {
      const selfMoveX = cos(t * kx + seed) * walkRadius.x;
      const selfMoveY = sin(t * ky + seed) * walkRadius.y;
      let fx = tx + selfMoveX;
      let fy = ty + selfMoveY;

      x += min(innerWidth / 100, (fx - x) / 10);
      y += min(innerWidth / 100, (fy - y) / 10);

      let i = 0;
      pts.forEach((pt) => {
        const dx = pt.x - x,
          dy = pt.y - y;
        const len = hypot(dx, dy);
        let r = min(2, innerWidth / len / 5);
        pt.t = 0;
        const increasing = len < innerWidth / 10 && i++ < 8;
        let dir = increasing ? 0.1 : -0.1;
        if (increasing) {
          r *= 1.5;
        }
        pt.r = r;
        pt.len = max(0, min(pt.len + dir, 1));
        paintPt(pt);
      });
    },
  };
}

const spiders = many(1, spawn)

addEventListener("pointermove", (e) => {
    spiders.forEach(spider => {
        spider.follow(e.clientX, e.clientY)
    })
});
