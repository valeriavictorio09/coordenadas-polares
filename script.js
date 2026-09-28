// ---------- render de fórmulas KaTeX ----------
if (window.renderMathInElement) {
  renderMathInElement(document.body, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false}
    ],
    throwOnError: false
  });
}

// ---------- utilidades ----------
// Paleta "joyería sobre negro": cada curva/sección usa un tono distinto.
const PALETTE = {blue: '#4cc9f0', green: '#2ec4b6', gold: '#ffd166', purple: '#b185ff'};
const INK = '#f5f5fa', GRID = 'rgba(255,255,255,.10)', SOFT = '#7d7f99';
const A1 = PALETTE.blue, A2 = PALETTE.green, A3 = PALETTE.purple; // valores por defecto (se sobreescriben por sección)
const deg2rad = d => d * Math.PI / 180;
const rad2deg = r => r * 180 / Math.PI;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Configura un canvas para pantallas Retina/High-DPI conservando las
// dimensiones "lógicas" (las del atributo width/height en el HTML) como
// el sistema de coordenadas que usa el resto del código.
function setupCanvas(id) {
  const c = document.getElementById(id);
  const W = c.width, H = c.height; // dimensiones lógicas (CSS px)
  const dpr = window.devicePixelRatio || 1;
  c.width = Math.round(W * dpr);
  c.height = Math.round(H * dpr);
  c.style.width = W + 'px';
  c.style.height = H + 'px';
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return {c, ctx, cx: W / 2, cy: H / 2, W, H};
}

// Convierte coordenadas de puntero (mouse/touch) a coordenadas lógicas del
// canvas, basándose en su tamaño CSS (que coincide con las dimensiones
// lógicas fijadas en setupCanvas), para que funcione igual en pantallas HiDPI.
function toLocal(c, evt) {
  const rect = c.getBoundingClientRect();
  const point = evt.touches ? evt.touches[0] : (evt.changedTouches ? evt.changedTouches[0] : evt);
  return {
    x: (point.clientX - rect.left) * (parseFloat(c.style.width) / rect.width),
    y: (point.clientY - rect.top) * (parseFloat(c.style.height) / rect.height)
  };
}

function drawPolarGrid(ctx, cx, cy, R, rings = 4) {
  ctx.clearRect(0, 0, cx * 2, cy * 2);
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (let i = 1; i <= rings; i++) {
    ctx.beginPath(); ctx.arc(cx, cy, R * i / rings, 0, Math.PI * 2); ctx.stroke();
  }
  for (let a = 0; a < 360; a += 30) {
    const r = deg2rad(a);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(r), cy - R * Math.sin(r));
    ctx.stroke();
  }
  // eje polar destacado
  ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.globalAlpha = .55;
  ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
}

// ---------- HERO: campo de estrellas con paralaje ----------
(function () {
  const {ctx, W, H} = setupCanvas('starfield');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = [PALETTE.blue, PALETTE.green, PALETTE.gold, PALETTE.purple];
  const stars = Array.from({length: 70}, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.6 + 0.4,
    baseAlpha: Math.random() * 0.45 + 0.3,
    speed: Math.random() * 0.02 + 0.008,
    phase: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
  let mx = 0, my = 0;
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.addEventListener('mousemove', e => {
      const rect = heroEl.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });
  }

  function paint(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      const a = reduceMotion ? s.baseAlpha : s.baseAlpha + Math.sin(t * s.speed + s.phase) * 0.25;
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x + mx * 6, s.y + my * 6, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  if (reduceMotion) {
    paint(0);
  } else {
    let t = 0;
    (function loop() { t += 1; paint(t); requestAnimationFrame(loop); })();
  }
})();

// ---------- HERO decorativo ----------
(function () {
  const {ctx, cx, cy} = setupCanvas('heroCanvas');
  const R = 140;
  drawPolarGrid(ctx, cx, cy, R, 3);
  ctx.strokeStyle = A1; ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let t = 0; t <= 6.4; t += 0.02) {
    const r = 18 * Math.cos(3 * t);
    const x = cx + r * 7.6 * Math.cos(t), y = cy - r * 7.6 * Math.sin(t);
    t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
})();

// ---------- SECCIÓN 1: Polo y Eje Polar ----------
(function () {
  const {ctx, cx, cy} = setupCanvas('poloCanvas');
  const R = 115;
  drawPolarGrid(ctx, cx, cy, R, 3);
  const theta = 50, r = 92;
  const rad = deg2rad(theta);
  const px = cx + r * Math.cos(rad), py = cy - r * Math.sin(rad);
  ctx.strokeStyle = A1; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
  ctx.fillStyle = A1; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.gold; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, -rad, true); ctx.stroke();
  ctx.fillStyle = INK; ctx.font = '13px "JetBrains Mono"';
  ctx.fillText('Polo', cx - 12, cy + 18);
  ctx.fillStyle = A1; ctx.fillText('(r, θ)', px + 8, py - 8);
  ctx.fillStyle = PALETTE.gold; ctx.fillText('θ', cx + 38, cy - 14);
})();

// ---------- SECCIÓN 1: signos de r y θ (con arrastre) ----------
(function () {
  const {c, ctx, cx, cy} = setupCanvas('signCanvas');
  const R = 140;
  const rSlider = document.getElementById('signR');
  const tSlider = document.getElementById('signTheta');
  const rVal = document.getElementById('signRVal');
  const tVal = document.getElementById('signThetaVal');
  const note = document.getElementById('signNote');
  const unit = R / 4; // px por unidad de r (rango del slider: -4..4)
  let px = cx, py = cy; // posición actual del punto, para hit-testing del arrastre
  let dragging = false;

  function draw() {
    const r = parseFloat(rSlider.value), theta = parseFloat(tSlider.value);
    rVal.textContent = r; tVal.textContent = theta + '°';
    drawPolarGrid(ctx, cx, cy, R, 4);
    const rad = deg2rad(theta);
    const effR = Math.abs(r) * unit;
    const dir = r < 0 ? rad + Math.PI : rad;
    px = cx + effR * Math.cos(dir); py = cy - effR * Math.sin(dir);
    ctx.strokeStyle = A1; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = A1; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.stroke();

    let msg = `Punto (${r}, ${theta}°): `;
    msg += r < 0 ? 'r negativo → se refleja al lado opuesto del ángulo. ' : 'r positivo → dirección normal. ';
    msg += theta < 0 ? 'θ negativo → medido en sentido horario.' : 'θ positivo → medido en sentido antihorario.';
    note.textContent = msg;
  }

  function setFromPointer(evt) {
    const p = toLocal(c, evt);
    const dx = p.x - cx, dy = cy - p.y;
    const radiusPx = Math.sqrt(dx * dx + dy * dy);
    const r = clamp(radiusPx / unit, 0, 4);
    let angle = rad2deg(Math.atan2(dy, dx));
    rSlider.value = r.toFixed(1);
    tSlider.value = angle.toFixed(0);
    draw();
  }

  function hitsPoint(evt) {
    const p = toLocal(c, evt);
    return Math.hypot(p.x - px, p.y - py) < 22;
  }

  c.addEventListener('mousedown', e => { if (hitsPoint(e)) { dragging = true; setFromPointer(e); } });
  window.addEventListener('mousemove', e => { if (dragging) setFromPointer(e); });
  window.addEventListener('mouseup', () => { dragging = false; });

  c.addEventListener('touchstart', e => { if (hitsPoint(e)) { dragging = true; setFromPointer(e); e.preventDefault(); } }, {passive: false});
  c.addEventListener('touchmove', e => { if (dragging) { setFromPointer(e); e.preventDefault(); } }, {passive: false});
  c.addEventListener('touchend', () => { dragging = false; });

  rSlider.addEventListener('input', draw);
  tSlider.addEventListener('input', draw);
  draw();
})();

// ---------- SECCIÓN 2: convertidor (con arrastre y proyecciones) ----------
(function () {
  const {c, ctx, cx, cy} = setupCanvas('convCanvas');
  const scale = 22;
  const cxInput = document.getElementById('cx'), cyInput = document.getElementById('cy');
  const prInput = document.getElementById('pr'), ptInput = document.getElementById('pt');
  const cToP = document.getElementById('cToP'), pToC = document.getElementById('pToC');

  let orange = {x: 3, y: 3};   // punto cartesiano → se traduce a polar (dorado)
  let green = {r: 4, t: 30};   // punto polar → se traduce a cartesiano (verde)
  let dragTarget = null;       // 'orange' | 'green' | null
  const COL_A = PALETTE.gold, COL_B = PALETTE.green;

  function drawProjection(ox, oy, px, py, color) {
    ctx.save();
    ctx.strokeStyle = color; ctx.globalAlpha = .55; ctx.lineWidth = 1.3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px, py); ctx.stroke(); // proyección vertical (y)
    ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(px, py); ctx.stroke(); // proyección horizontal (x)
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawAngleArc(ox, oy, px, py, color) {
    const angle = Math.atan2(-(py - oy), px - ox);
    ctx.save();
    ctx.strokeStyle = color; ctx.globalAlpha = .8; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(ox, oy, 22, 0, -angle, angle > 0); ctx.stroke();
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, cx * 2, cy * 2);
    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(cx * 2, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, cy * 2); ctx.stroke();

    const ox1 = cx + orange.x * scale, oy1 = cy - orange.y * scale;
    const rad2 = deg2rad(green.t);
    const gx = green.r * Math.cos(rad2), gy = green.r * Math.sin(rad2);
    const ox2 = cx + gx * scale, oy2 = cy - gy * scale;

    // proyecciones y arcos (triángulo rectángulo x, y, r)
    drawProjection(cx, cy, ox1, oy1, COL_A);
    drawAngleArc(cx, cy, ox1, oy1, COL_A);
    drawProjection(cx, cy, ox2, oy2, COL_B);
    drawAngleArc(cx, cy, ox2, oy2, COL_B);

    // hipotenusas (r)
    ctx.strokeStyle = COL_A; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ox1, oy1); ctx.stroke();
    ctx.strokeStyle = COL_B; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ox2, oy2); ctx.stroke();

    // puntos
    ctx.fillStyle = COL_A; ctx.beginPath(); ctx.arc(ox1, oy1, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0a0a0f'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = COL_B; ctx.beginPath(); ctx.arc(ox2, oy2, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0a0a0f'; ctx.stroke();
  }

  function syncFieldsFromState() {
    cxInput.value = orange.x.toFixed(2);
    cyInput.value = orange.y.toFixed(2);
    prInput.value = green.r.toFixed(2);
    ptInput.value = green.t.toFixed(1);
    const r1 = Math.hypot(orange.x, orange.y);
    const t1 = rad2deg(Math.atan2(orange.y, orange.x));
    cToP.textContent = `→ r = ${r1.toFixed(2)}, θ = ${t1.toFixed(1)}°`;
    const rad2 = deg2rad(green.t);
    pToC.textContent = `→ x = ${(green.r * Math.cos(rad2)).toFixed(2)}, y = ${(green.r * Math.sin(rad2)).toFixed(2)}`;
  }

  function updateFromInputs() {
    orange.x = parseFloat(cxInput.value) || 0;
    orange.y = parseFloat(cyInput.value) || 0;
    green.r = parseFloat(prInput.value) || 0;
    green.t = parseFloat(ptInput.value) || 0;
    syncFieldsFromState();
    render();
  }

  function pixelOf(point) {
    if (point === 'orange') return {x: cx + orange.x * scale, y: cy - orange.y * scale};
    const rad2 = deg2rad(green.t);
    return {x: cx + green.r * Math.cos(rad2) * scale, y: cy - green.r * Math.sin(rad2) * scale};
  }

  function nearestTarget(p) {
    const po = pixelOf('orange'), pg = pixelOf('green');
    const dO = Math.hypot(p.x - po.x, p.y - po.y);
    const dG = Math.hypot(p.x - pg.x, p.y - pg.y);
    const threshold = 24;
    if (dO < threshold && dO <= dG) return 'orange';
    if (dG < threshold) return 'green';
    return null;
  }

  function dragTo(evt) {
    const p = toLocal(c, evt);
    if (dragTarget === 'orange') {
      orange.x = (p.x - cx) / scale;
      orange.y = (cy - p.y) / scale;
    } else if (dragTarget === 'green') {
      const dx = p.x - cx, dy = cy - p.y;
      green.r = Math.hypot(dx, dy) / scale;
      green.t = rad2deg(Math.atan2(dy, dx));
    }
    syncFieldsFromState();
    render();
  }

  c.addEventListener('mousedown', e => { dragTarget = nearestTarget(toLocal(c, e)); if (dragTarget) dragTo(e); });
  window.addEventListener('mousemove', e => { if (dragTarget) dragTo(e); });
  window.addEventListener('mouseup', () => { dragTarget = null; });

  c.addEventListener('touchstart', e => {
    dragTarget = nearestTarget(toLocal(c, e));
    if (dragTarget) { dragTo(e); e.preventDefault(); }
  }, {passive: false});
  c.addEventListener('touchmove', e => { if (dragTarget) { dragTo(e); e.preventDefault(); } }, {passive: false});
  c.addEventListener('touchend', () => { dragTarget = null; });

  [cxInput, cyInput, prInput, ptInput].forEach(el => el.addEventListener('input', updateFromInputs));
  syncFieldsFromState();
  render();
})();

// ---------- SECCIÓN 3: laboratorio de curvas (animación + zoom) ----------
(function () {
  const {c, ctx, cx, cy} = setupCanvas('labCanvas');
  const baseScale = 42, baseR = 200;
  const typeSel = document.getElementById('curveType');
  const aSlider = document.getElementById('paramA'), bSlider = document.getElementById('paramB'), nSlider = document.getElementById('paramN');
  const aVal = document.getElementById('paramAVal'), bVal = document.getElementById('paramBVal'), nVal = document.getElementById('paramNVal');
  const bWrap = document.getElementById('bWrap'), nWrap = document.getElementById('nWrap');
  const explain = document.getElementById('labExplain');
  const animateBtn = document.getElementById('labAnimateBtn');
  const resetZoomBtn = document.getElementById('labResetZoomBtn');

  const explanations = {
    rose: 'a controla el tamaño del pétalo. n controla el número de pétalos: si n es impar hay n pétalos, si es par hay 2n.',
    cardioid: 'Con a = b se forma un cardioide (una punta). Si a > b, un caracol con hueco interior. Si a < b, un caracol con lazo interior.',
    spiral: 'a controla qué tan rápido crece el radio conforme aumenta θ — una espiral de Arquímedes.',
    lemniscate: 'a controla el tamaño de los dos lóbulos de la figura en forma de ocho.'
  };

  let zoom = 1;
  let animating = false, raf = null, animT = 0;

  function updateVisibility() {
    const t = typeSel.value;
    bWrap.style.display = (t === 'cardioid') ? 'flex' : 'none';
    nWrap.style.display = (t === 'rose') ? 'flex' : 'none';
  }

  function radiusFor(theta, a, b, n) {
    switch (typeSel.value) {
      case 'rose': return a * Math.cos(n * theta);
      case 'cardioid': return a + b * Math.cos(theta);
      case 'spiral': return a * theta / 3;
      case 'lemniscate': {
        const val = a * a * Math.cos(2 * theta);
        return val >= 0 ? Math.sqrt(val) : -Math.sqrt(-val);
      }
    }
  }

  function maxTheta() { return typeSel.value === 'spiral' ? 6 * Math.PI : 2 * Math.PI; }

  // Cada familia de curva recibe su propio tono de la paleta
  const curveColor = {rose: PALETTE.purple, cardioid: PALETTE.blue, spiral: PALETTE.gold, lemniscate: PALETTE.green};

  function drawUpTo(tEnd) {
    const a = parseFloat(aSlider.value), b = parseFloat(bSlider.value), n = parseInt(nSlider.value);
    aVal.textContent = a; bVal.textContent = b; nVal.textContent = n;
    const R = baseR * zoom, scale = baseScale * zoom;
    const strokeColor = curveColor[typeSel.value];
    drawPolarGrid(ctx, cx, cy, R, 4);
    ctx.strokeStyle = strokeColor; ctx.lineWidth = 2.2;
    ctx.beginPath();
    let started = false;
    for (let t = 0; t <= tEnd; t += 0.01) {
      const r = radiusFor(t, a, b, n);
      const x = cx + r * scale * Math.cos(t), y = cy - r * scale * Math.sin(t);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // punto guía en la punta del trazo (útil sobre todo durante la animación)
    if (started && tEnd < maxTheta()) {
      const a2 = parseFloat(aSlider.value), b2 = parseFloat(bSlider.value), n2 = parseInt(nSlider.value);
      const r = radiusFor(tEnd, a2, b2, n2);
      const x = cx + r * scale * Math.cos(tEnd), y = cy - r * scale * Math.sin(tEnd);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    }
    explain.textContent = explanations[typeSel.value];
  }

  function draw() { drawUpTo(maxTheta()); }

  function stopAnimation() {
    animating = false;
    if (raf) cancelAnimationFrame(raf);
    animateBtn.textContent = '▶ Animar trazo';
  }

  function step() {
    const mt = maxTheta();
    animT += mt / 260;
    if (animT >= mt) { drawUpTo(mt); stopAnimation(); return; }
    drawUpTo(animT);
    raf = requestAnimationFrame(step);
  }

  function startAnimation() {
    animating = true; animT = 0;
    animateBtn.textContent = '⏸ Pausar';
    step();
  }

  animateBtn.addEventListener('click', () => { animating ? stopAnimation() : startAnimation(); });
  resetZoomBtn.addEventListener('click', () => { zoom = 1; draw(); });

  c.addEventListener('wheel', e => {
    e.preventDefault();
    zoom = clamp(zoom * (e.deltaY < 0 ? 1.08 : 0.93), 0.4, 3.2);
    if (animating) stopAnimation();
    draw();
  }, {passive: false});

  typeSel.addEventListener('change', () => { updateVisibility(); if (animating) stopAnimation(); draw(); });
  [aSlider, bSlider, nSlider].forEach(el => el.addEventListener('input', () => { if (animating) stopAnimation(); draw(); }));

  updateVisibility();
  draw();
})();

// ---------- SECCIÓN 4: límites — acercamiento por trayectorias ----------
(function () {
  const {c, ctx, cx, cy} = setupCanvas('limitsCanvas');
  const R = 150, plotMax = 1.25; // r visual máximo representado en el panel
  const scale = R / plotMax;

  const funcSel = document.getElementById('limitFunc');
  const thetaSlider = document.getElementById('limitTheta');
  const thetaVal = document.getElementById('limitThetaVal');
  const animBtn = document.getElementById('limitAnimBtn');
  const readout = document.getElementById('limitReadout');
  const verdict = document.getElementById('limitVerdict');

  const verdicts = {
    f1: 'Mueve θ y observa: el valor siempre tiende a 0 al acercarte al origen, sin importar la trayectoria — por eso este límite SÍ existe.',
    f2: 'Mueve θ y observa: el valor se mantiene constante (no llega a 0) conforme r → 0, y ese valor cambia con θ — trayectorias distintas dan resultados distintos, por eso este límite NO existe.'
  };

  let rCur = plotMax, animating = false, raf = null;

  function f(x, y, type) {
    const denom = x * x + y * y;
    if (denom < 1e-9) return 0;
    if (type === 'f1') return (x * x * y) / denom;
    return (x * y) / denom;
  }

  function draw() {
    drawPolarGrid(ctx, cx, cy, R, 4);
    const theta = parseFloat(thetaSlider.value);
    thetaVal.textContent = theta + '°';
    const rad = deg2rad(theta);

    // trayectoria recta hacia el origen
    ctx.save();
    ctx.strokeStyle = SOFT; ctx.globalAlpha = .7; ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx + R * Math.cos(rad), cy - R * Math.sin(rad));
    ctx.lineTo(cx - R * Math.cos(rad), cy + R * Math.sin(rad)); // línea completa que pasa por el polo
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    const x = rCur * Math.cos(rad), y = rCur * Math.sin(rad);
    const px = cx + x * scale, py = cy - y * scale;
    ctx.strokeStyle = PALETTE.purple; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = PALETTE.purple; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0a0a0f'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = PALETTE.gold; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();

    const type = funcSel.value;
    const val = f(x, y, type);
    readout.textContent = `r = ${rCur.toFixed(3)}, θ = ${theta}° → f(x,y) ≈ ${val.toFixed(4)}`;
  }

  function stopAnimation() {
    animating = false;
    if (raf) cancelAnimationFrame(raf);
    animBtn.textContent = '▶ Acercarse al origen';
  }

  function step() {
    rCur *= 0.965;
    if (rCur < 0.01) { rCur = 0.01; draw(); stopAnimation(); return; }
    draw();
    raf = requestAnimationFrame(step);
  }

  function startAnimation() {
    animating = true; rCur = plotMax;
    animBtn.textContent = '⏸ Pausar';
    step();
  }

  animBtn.addEventListener('click', () => { animating ? stopAnimation() : startAnimation(); });
  thetaSlider.addEventListener('input', () => { if (!animating) draw(); else draw(); });
  funcSel.addEventListener('change', () => {
    verdict.textContent = verdicts[funcSel.value];
    draw();
  });

  verdict.textContent = verdicts[funcSel.value];
  draw();
})();