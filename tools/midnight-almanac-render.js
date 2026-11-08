// Usage: node midnight-almanac-render.js spec.json outDir
// formats: table, glossary, iconlist, spread, card  (see tools/example-spec-midnight-almanac.json)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const F = n => 'data:font/woff2;base64,' + fs.readFileSync(path.join(__dirname, 'node_modules/@fontsource', n)).toString('base64');
const GOLD = '#D9B15A', CREAM = '#F2E9D0', NAVY = '#17153B', NAVY2 = '#232459', LINE = 'rgba(242,233,208,0.28)';
const css = `
@font-face{font-family:Cin;font-weight:400;src:url(${F('cinzel/files/cinzel-latin-400-normal.woff2')})}
@font-face{font-family:Cin;font-weight:600;src:url(${F('cinzel/files/cinzel-latin-600-normal.woff2')})}
@font-face{font-family:Cin;font-weight:700;src:url(${F('cinzel/files/cinzel-latin-700-normal.woff2')})}
@font-face{font-family:Jost;font-weight:300;src:url(${F('jost/files/jost-latin-300-normal.woff2')})}
@font-face{font-family:Jost;font-weight:400;src:url(${F('jost/files/jost-latin-400-normal.woff2')})}
@font-face{font-family:Jost;font-weight:500;src:url(${F('jost/files/jost-latin-500-normal.woff2')})}
@font-face{font-family:Jost;font-weight:600;src:url(${F('jost/files/jost-latin-600-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1000px;height:1500px;background:${NAVY};color:${CREAM};font-family:Jost;position:relative;overflow:hidden}
.b1{position:absolute;left:32px;top:32px;right:32px;bottom:32px;border:3px solid ${GOLD};border-radius:10px}
.b2{position:absolute;left:46px;top:46px;right:46px;bottom:46px;border:1.5px solid rgba(217,177,90,.55)}
.kicker{position:absolute;left:0;right:0;top:92px;text-align:center;color:${GOLD};font-weight:500;font-size:26px;letter-spacing:7px;text-transform:uppercase;display:flex;justify-content:center;align-items:center;gap:20px}
h1{position:absolute;left:70px;right:70px;text-align:center;font-family:Cin;font-weight:400;font-size:92px;line-height:1.04;letter-spacing:1px}
.sub{position:absolute;left:70px;right:70px;text-align:center;font-size:32px;font-weight:400}
.foot{position:absolute;left:0;right:0;bottom:70px;text-align:center;color:${GOLD};font-weight:500;font-size:25px;letter-spacing:8px;display:flex;justify-content:center;align-items:center;gap:14px}
.note{position:absolute;left:70px;right:70px;bottom:128px;text-align:center;font-size:24px;font-weight:300;color:#cfc8b4}
.sm{font-family:Cin;font-weight:700;font-variant:normal}
.hair{border-bottom:1.5px solid ${LINE}}
.gold{color:${GOLD}}
.cap{font-family:Cin;font-weight:600}
`;
const star = `<svg width="26" height="26" viewBox="-13 -13 26 26"><path d="M0-12 L2.2-2.2 L12 0 L2.2 2.2 L0 12 L-2.2 2.2 L-12 0 L-2.2-2.2Z" fill="none" stroke="${GOLD}" stroke-width="1.6"/></svg>`;
const crescent = `<svg width="26" height="26" viewBox="-13 -13 26 26"><path d="M4-11 A11 11 0 1 0 4 11 A8.5 8.5 0 0 1 4-11Z" fill="${GOLD}"/></svg>`;
const head = (s, topH = 150) => `<div class=b1></div><div class=b2></div><div class=kicker>${star}<span>${s.kicker}</span>${star}</div>`;
const foot = () => `<div class=foot>${crescent}<span>MIDNIGHT ALMANAC</span></div>`;
function moon(phase, size = 62) {
  const r = 30, k = { 'new': 0, 'full': 0, 'first-quarter': 0, 'last-quarter': 0, 'waxing-crescent': 0.5, 'waning-crescent': 0.5, 'waxing-gibbous': 0.5, 'waning-gibbous': 0.5, 'half': 0 }[phase] ?? 0;
  const base = `<circle r="${r}" fill="${NAVY2}" stroke="${GOLD}" stroke-width="2"/>`;
  let lit = '';
  if (phase === 'full') lit = `<circle r="${r}" fill="${CREAM}" stroke="${GOLD}" stroke-width="2"/>`;
  else if (phase !== 'new') {
    const gib = phase.includes('gibbous'), sweep = gib ? 1 : 0, rx = k * r;
    const d = `M0 ${-r} A${r} ${r} 0 0 1 0 ${r} A${rx} ${r} 0 0 ${sweep} 0 ${-r}Z`;
    const mirror = phase.startsWith('waning') || phase === 'last-quarter';
    lit = `<path d="${d}" fill="${CREAM}" ${mirror ? 'transform="scale(-1,1)"' : ''}/><circle r="${r}" fill="none" stroke="${GOLD}" stroke-width="2"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="-32 -32 64 64">${base}${lit}</svg>`;
}
function html(s) {
  if (s.headline) s.headline = String(s.headline).replace(/\n/g, '<br>');
  if (s.format === 'table') {
    const n = s.rows.length;
    const rows = s.rows.map(r => `<div class="hair" style="display:flex;align-items:center;flex:1"><div class=cap style="width:270px;font-size:29px">${r[0]}</div><div style="font-size:29px;font-weight:400">${r[1]}</div></div>`).join('');
    return `${head(s)}<h1 style="top:140px">${s.headline}</h1><div class=sub style="top:340px">${s.sub}</div>
<div style="position:absolute;left:90px;right:90px;top:395px;display:flex;color:${GOLD};font-weight:600;font-size:22px;letter-spacing:5px"><div style="width:270px">${s.colA}</div><div>${s.colB}</div></div>
<div style="position:absolute;left:90px;right:90px;top:445px;bottom:${s.note ? 190 : 150}px;display:flex;flex-direction:column;border-top:1.5px solid ${LINE}">${rows}</div>
${s.note ? `<div class=note style="bottom:128px">${s.note}</div>` : ''}${foot()}`;
  }
  if (s.format === 'glossary') {
    const half = Math.ceil(s.terms.length / 2);
    const col = (arr, off) => arr.map((t, i) => `<div class="hair" style="flex:1;display:flex;align-items:center;font-size:26px;line-height:1.2"><span class="gold sm" style="width:54px;font-size:27px;flex:none">${off + i + 1}</span><span><b style="font-weight:600">${t[0]}:</b> ${t[1]}</span></div>`).join('');
    return `${head(s)}<div style="position:absolute;left:0;right:0;top:140px;display:flex;justify-content:center">${moon('half', 104)}</div><h1 style="top:290px">${s.headline}</h1><div class=sub style="top:495px;color:${GOLD}">${s.sub}</div>
<div style="position:absolute;left:90px;right:90px;top:562px;bottom:150px;display:flex;gap:34px"><div style="flex:1;display:flex;flex-direction:column;border-top:1.5px solid ${LINE}">${col(s.terms.slice(0, half), 0)}</div><div style="flex:1;display:flex;flex-direction:column;border-top:1.5px solid ${LINE}">${col(s.terms.slice(half), half)}</div></div>${foot()}`;
  }
  if (s.format === 'iconlist') {
    const rows = s.rows.map(r => `<div class="hair" style="flex:1;display:flex;align-items:center;gap:30px">${r[2] ? moon(r[2], 64) : ''}<div><div class=cap style="font-size:30px;letter-spacing:.5px">${r[0]}</div><div class=gold style="font-size:29px;margin-top:4px">${r[1]}</div></div></div>`).join('');
    return `${head(s)}<h1 style="top:140px">${s.headline}</h1><div class=sub style="top:350px">${s.sub}</div>
<div style="position:absolute;left:90px;right:90px;top:412px;bottom:128px;display:flex;flex-direction:column;border-top:1.5px solid ${LINE}">${rows}</div>${foot()}`;
  }
  if (s.format === 'spread') {
    const cards = s.cards.map(c => `<div style="flex:1;text-align:center"><div style="height:390px;border:2px solid ${GOLD};border-radius:14px;background:${NAVY2};display:flex;align-items:center;justify-content:center;font-family:Cin;font-size:${s.cards.length > 4 ? 64 : 84}px;color:${GOLD}">${c[0]}</div><div class=cap style="font-size:28px;margin-top:22px">${c[1]}</div><div style="font-size:23px;font-weight:300;color:#d8d1bd;margin-top:14px;line-height:1.3;padding:0 4px">${c[2]}</div></div>`).join('');
    const steps = s.steps.map((t, i) => `<div style="font-size:30px;margin-top:14px;display:flex"><span class="gold sm" style="width:54px;flex:none">${i + 1}</span><span>${t}</span></div>`).join('');
    return `${head(s)}<h1 style="top:140px">${s.headline}</h1><div class=sub style="top:410px;color:${GOLD}">${s.sub}</div>
<div style="position:absolute;left:90px;right:90px;top:548px;display:flex;gap:${s.cards.length > 4 ? 12 : 22}px">${cards}</div>
<div style="position:absolute;left:90px;right:90px;top:1140px;border-top:1.5px solid ${LINE};padding-top:22px"><div class=gold style="font-weight:600;font-size:22px;letter-spacing:5px">HOW TO READ IT</div>${steps}</div>${foot()}`;
  }
  if (s.format === 'card') {
    const li = a => a.map(x => `<div style="font-size:28px;margin-top:12px">${x}</div>`).join('');
    const rows = s.rows.map(r => `<div class="hair" style="flex:1;display:flex;align-items:center"><div class=gold style="width:236px;font-weight:600;font-size:22px;letter-spacing:5px;text-transform:uppercase">${r[0]}</div><div style="font-size:31px">${r[1]}</div></div>`).join('');
    return `${head(s)}
<div style="position:absolute;left:90px;top:152px;width:240px;height:368px;border:3px solid ${GOLD};border-radius:14px;background:${NAVY2};box-shadow:inset 0 0 0 8px ${NAVY2},inset 0 0 0 9.5px rgba(217,177,90,.6);text-align:center"><div class=gold style="font-family:Cin;font-weight:700;font-size:48px;margin-top:24px">${s.numeral}</div><svg style="margin-top:44px" width="100" height="100" viewBox="-50 -50 100 100"><path d="M0-46 L8-8 L46 0 L8 8 L0 46 L-8 8 L-46 0 L-8-8Z" fill="none" stroke="${GOLD}" stroke-width="3"/><circle r="7" fill="${GOLD}"/></svg><div style="position:absolute;left:0;right:0;bottom:20px;font-family:Cin;font-weight:700;font-size:17px;letter-spacing:1px;text-transform:uppercase">${s.name}</div></div>
<div style="position:absolute;left:370px;right:90px;top:182px"><div class=gold style="font-weight:600;font-size:23px;letter-spacing:5px">${s.arcana}</div><div style="font-family:Cin;font-size:58px;line-height:1.02;margin-top:10px;text-transform:capitalize">${s.name}</div><div class=gold style="font-family:Cin;font-size:32px;margin-top:14px">${s.sub}</div><div style="font-size:26px;font-weight:300;line-height:1.35;margin-top:12px;color:#ded7c3">${s.desc}</div></div>
<div style="position:absolute;left:90px;right:90px;top:545px;height:292px;display:flex;gap:20px"><div style="flex:1;border:1.5px solid ${LINE};padding:20px 26px"><div class="cap gold" style="font-size:30px">Upright</div>${li(s.upright)}</div><div style="flex:1;border:1.5px solid ${LINE};padding:20px 26px"><div class="cap gold" style="font-size:30px">Reversed</div>${li(s.reversed)}</div></div>
<div style="position:absolute;left:90px;right:90px;top:860px;bottom:200px;display:flex;flex-direction:column;border-top:1.5px solid ${LINE}">${rows}</div>
<div class=note style="bottom:128px">${s.note}</div>${foot()}`;
  }
  throw new Error('unknown format ' + s.format);
}
(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2]));
  const out = process.argv[3]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
  for (const s of spec) {
    await p.setContent(`<style>${css}</style><body>${html(s)}</body>`);
    await p.evaluate(async () => { for (const f of ['400 40px Cin', '600 40px Cin', '700 40px Cin', '300 40px Jost', '400 40px Jost', '500 40px Jost', '600 40px Jost']) await document.fonts.load(f); await document.fonts.ready; });
    await p.screenshot({ path: path.join(out, s.file) });
  }
  await b.close();
})();
