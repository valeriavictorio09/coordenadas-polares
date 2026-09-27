// ---------- utilidades ----------
const INK = '#22283a', GRID = '#d8cfb8', A1 = '#c1440e', A2 = '#1f6f5c', SOFT='#8b93a8';
const deg2rad = d => d * Math.PI / 180;

function setupCanvas(id){
  const c = document.getElementById(id);
  const ctx = c.getContext('2d');
  return {c, ctx, cx: c.width/2, cy: c.height/2};
}

function drawPolarGrid(ctx, cx, cy, R, rings=4){
  ctx.clearRect(0,0,cx*2,cy*2);
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for(let i=1;i<=rings;i++){
    ctx.beginPath(); ctx.arc(cx,cy, R*i/rings, 0, Math.PI*2); ctx.stroke();
  }
  for(let a=0;a<360;a+=30){
    const r = deg2rad(a);
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(cx+R*Math.cos(r), cy-R*Math.sin(r));
    ctx.stroke();
  }
  // eje polar destacado
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-R,cy); ctx.lineTo(cx+R,cy); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2); ctx.fill();
}

// ---------- HERO decorativo ----------
(function(){
  const {ctx, cx, cy} = setupCanvas('heroCanvas');
  const R = 150;
  drawPolarGrid(ctx, cx, cy, R, 3);
  ctx.strokeStyle = A1; ctx.lineWidth = 2.2;
  ctx.beginPath();
  for(let t=0; t<=6.4; t+=0.02){
    const r = 18*Math.cos(3*t);
    const x = cx + r*8*Math.cos(t), y = cy - r*8*Math.sin(t);
    t===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.stroke();
})();

// ---------- SECCIÓN 1: Polo y Eje Polar ----------
(function(){
  const {ctx, cx, cy} = setupCanvas('poloCanvas');
  const R = 120;
  drawPolarGrid(ctx, cx, cy, R, 3);
  const theta = 50, r = 95;
  const rad = deg2rad(theta);
  const px = cx + r*Math.cos(rad), py = cy - r*Math.sin(rad);
  ctx.strokeStyle = A1; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py); ctx.stroke();
  ctx.fillStyle = A1; ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = A2; ctx.beginPath(); ctx.arc(cx,cy,30,0,-rad,true); ctx.stroke();
  ctx.fillStyle = INK; ctx.font='14px "Source Sans 3"';
  ctx.fillText('Polo', cx-10, cy+18);
  ctx.fillStyle = A1; ctx.fillText('(r, θ)', px+8, py-8);
  ctx.fillStyle = A2; ctx.fillText('θ', cx+38, cy-14);
})();

// ---------- SECCIÓN 1: signos de r y θ ----------
(function(){
  const {ctx, cx, cy} = setupCanvas('signCanvas');
  const R = 140;
  const rSlider = document.getElementById('signR');
  const tSlider = document.getElementById('signTheta');
  const rVal = document.getElementById('signRVal');
  const tVal = document.getElementById('signThetaVal');
  const note = document.getElementById('signNote');

  function draw(){
    const r = parseFloat(rSlider.value), theta = parseFloat(tSlider.value);
    rVal.textContent = r; tVal.textContent = theta + '°';
    drawPolarGrid(ctx, cx, cy, R, 4);
    const rad = deg2rad(theta);
    // Punto real: si r<0, se refleja
    const effR = Math.abs(r) * (R/4);
    const dir = r < 0 ? rad + Math.PI : rad;
    const px = cx + effR*Math.cos(dir), py = cy - effR*Math.sin(dir);
    ctx.strokeStyle = A1; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py); ctx.stroke();
    ctx.fillStyle = A1; ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill();

    let msg = `Punto (${r}, ${theta}°): `;
    msg += r<0 ? 'r negativo → se refleja al lado opuesto del ángulo. ' : 'r positivo → dirección normal. ';
    msg += theta<0 ? 'θ negativo → medido en sentido horario.' : 'θ positivo → medido en sentido antihorario.';
    note.textContent = msg;
  }
  rSlider.addEventListener('input', draw);
  tSlider.addEventListener('input', draw);
  draw();
})();

// ---------- SECCIÓN 2: convertidor ----------
(function(){
  const {ctx, cx, cy} = setupCanvas('convCanvas');
  const scale = 22;
  const cxInput = document.getElementById('cx'), cyInput = document.getElementById('cy');
  const prInput = document.getElementById('pr'), ptInput = document.getElementById('pt');
  const cToP = document.getElementById('cToP'), pToC = document.getElementById('pToC');

  function draw(px, py, qx, qy){
    ctx.clearRect(0,0,700,320);
    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(700,cy); ctx.moveTo(cx,0); ctx.lineTo(cx,320); ctx.stroke();
    // punto de cartesiano a polar (naranja)
    ctx.strokeStyle = A1; ctx.fillStyle = A1;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+px*scale, cy-py*scale); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx+px*scale, cy-py*scale, 5, 0, Math.PI*2); ctx.fill();
    // punto de polar a cartesiano (verde)
    ctx.strokeStyle = A2; ctx.fillStyle = A2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+qx*scale, cy-qy*scale); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx+qx*scale, cy-qy*scale, 5, 0, Math.PI*2); ctx.fill();
  }

  function update(){
    const x = parseFloat(cxInput.value)||0, y = parseFloat(cyInput.value)||0;
    const r1 = Math.sqrt(x*x+y*y);
    const t1 = Math.atan2(y,x) * 180/Math.PI;
    cToP.textContent = `→ r = ${r1.toFixed(2)}, θ = ${t1.toFixed(1)}°`;

    const r2 = parseFloat(prInput.value)||0, t2 = parseFloat(ptInput.value)||0;
    const rad2 = deg2rad(t2);
    const x2 = r2*Math.cos(rad2), y2 = r2*Math.sin(rad2);
    pToC.textContent = `→ x = ${x2.toFixed(2)}, y = ${y2.toFixed(2)}`;

    draw(x, y, x2, y2);
  }
  [cxInput,cyInput,prInput,ptInput].forEach(el => el.addEventListener('input', update));
  update();
})();

// ---------- SECCIÓN 3: laboratorio de curvas ----------
(function(){
  const {ctx, cx, cy} = setupCanvas('labCanvas');
  const scale = 45;
  const typeSel = document.getElementById('curveType');
  const aSlider = document.getElementById('paramA'), bSlider = document.getElementById('paramB'), nSlider = document.getElementById('paramN');
  const aVal = document.getElementById('paramAVal'), bVal = document.getElementById('paramBVal'), nVal = document.getElementById('paramNVal');
  const bWrap = document.getElementById('bWrap'), nWrap = document.getElementById('nWrap');
  const explain = document.getElementById('labExplain');

  const explanations = {
    rose: 'a controla el tamaño del pétalo. n controla el número de pétalos: si n es impar hay n pétalos, si es par hay 2n.',
    cardioid: 'Con a = b se forma un cardioide (una punta). Si a > b, un caracol con hueco interior. Si a < b, un caracol con lazo interior.',
    spiral: 'a controla qué tan rápido crece el radio conforme aumenta θ — una espiral de Arquímedes.',
    lemniscate: 'a controla el tamaño de los dos lóbulos de la figura en forma de ocho.'
  };

  function updateVisibility(){
    const t = typeSel.value;
    bWrap.style.display = (t==='cardioid') ? 'flex' : 'none';
    nWrap.style.display = (t==='rose') ? 'flex' : 'none';
  }

  function radiusFor(theta, a, b, n){
    switch(typeSel.value){
      case 'rose': return a*Math.cos(n*theta);
      case 'cardioid': return a + b*Math.cos(theta);
      case 'spiral': return a*theta/3;
      case 'lemniscate': {
        const val = a*a*Math.cos(2*theta);
        return val >= 0 ? Math.sqrt(val) : -Math.sqrt(-val);
      }
    }
  }

  function draw(){
    const a = parseFloat(aSlider.value), b = parseFloat(bSlider.value), n = parseInt(nSlider.value);
    aVal.textContent=a; bVal.textContent=b; nVal.textContent=n;
    drawPolarGrid(ctx, cx, cy, 210, 4);
    ctx.strokeStyle = A1; ctx.lineWidth = 2.2;
    ctx.beginPath();
    const maxT = typeSel.value === 'spiral' ? 6*Math.PI : 2*Math.PI;
    for(let t=0; t<=maxT; t+=0.01){
      const r = radiusFor(t, a, b, n);
      const x = cx + r*scale*Math.cos(t), y = cy - r*scale*Math.sin(t);
      t===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.stroke();
    explain.textContent = explanations[typeSel.value];
  }

  typeSel.addEventListener('change', ()=>{updateVisibility(); draw();});
  [aSlider,bSlider,nSlider].forEach(el=>el.addEventListener('input', draw));
  updateVisibility();
  draw();
})();