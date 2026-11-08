// Usage: node gentle-habit-render.js spec.json outDir
// spec = array of {file, format, kicker, headline, items, variant, sub, footerRight, chips}
// formats: quote (variant sage|apricot|green), list, check (variant white|pink), promo (variant light|dark)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const F = n => 'data:font/woff2;base64,' + fs.readFileSync(path.join(__dirname, 'node_modules/@fontsource', n)).toString('base64');
const css = `
@font-face{font-family:Brico;font-weight:700;src:url(${F('bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff2')})}
@font-face{font-family:Brico;font-weight:800;src:url(${F('bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff2')})}
@font-face{font-family:Fig;font-weight:400;src:url(${F('figtree/files/figtree-latin-400-normal.woff2')})}
@font-face{font-family:Fig;font-weight:500;src:url(${F('figtree/files/figtree-latin-500-normal.woff2')})}
@font-face{font-family:Fig;font-weight:700;src:url(${F('figtree/files/figtree-latin-700-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1000px;height:1500px;position:relative;overflow:hidden;font-family:Fig;color:#1F3B2D;background:#DCE5D3}
.kicker{position:absolute;left:80px;top:92px;font-size:26px;letter-spacing:6px;text-transform:uppercase;font-weight:700}
h1{position:absolute;left:80px;right:80px;font-family:Brico;font-weight:800;letter-spacing:-2px;line-height:1.02}
.circle{position:absolute;border-radius:50%}
.foot{position:absolute;left:80px;right:80px;bottom:62px;display:flex;justify-content:space-between;font-size:26px;font-weight:500}
.card{position:absolute;left:80px;right:80px;border-radius:36px;display:flex;flex-direction:column;justify-content:space-evenly;padding:20px 44px}
.row{display:flex;align-items:center;font-size:36px;font-weight:500;line-height:1.15;padding:0}
.card.list .row{border-bottom:2px solid #e3e8dc;flex:1}.card.list .row:last-child{border-bottom:0}
.num{font-family:Brico;font-weight:700;color:#F0A27A;width:68px;flex:none}
.box{width:38px;height:38px;border:3.5px solid #1F3B2D;border-radius:10px;margin-right:24px;flex:none}
.pill{position:absolute;left:80px;top:90px;background:#F0A27A;color:#1F3B2D;font-weight:700;font-size:28px;letter-spacing:5px;text-transform:uppercase;padding:0 30px;height:62px;line-height:62px;border-radius:31px}
.sub{position:absolute;left:80px;right:80px;font-size:42px;font-weight:500;line-height:1.25}
.cta{position:absolute;left:80px;right:80px;bottom:70px;height:103px;border-radius:30px;display:flex;justify-content:space-between;align-items:center;padding:0 36px;font-family:Brico;font-weight:700;font-size:38px}
.chip{display:inline-block;padding:14px 26px;border-radius:30px;font-size:30px;font-weight:700;margin:0 14px 16px 0}
`;
function html(s) {
  const v = s.variant || '', n = (s.items || []).length;
  const fr = s.footerRight || '';
  if (s.format === 'quote') {
    const bg = v === 'apricot' ? '#F0A27A' : v === 'green' ? '#1F3B2D' : '#DCE5D3';
    const fg = v === 'green' ? '#FAFBF7' : '#1F3B2D';
    const circ = v === 'apricot' ? '#EE946A' : v === 'green' ? '#2C5240' : '#C7D4BE';
    const len = s.headline.length; const fs = len > 70 ? 92 : len > 50 ? 104 : 116;
    return `<body style="background:${bg};color:${fg}"><div class=kicker>${s.kicker}</div><div class=circle style="width:760px;height:760px;right:-200px;bottom:-250px;background:${circ}"></div><h1 style="top:520px;font-size:${fs}px;color:${fg}">${s.headline}</h1><div class=foot><span>Gentle Habit</span><span>${fr}</span></div></body>`;
  }
  if (s.format === 'list' || s.format === 'check') {
    const pink = v === 'pink', check = s.format === 'check';
    const bg = pink ? '#F8E3E1' : check ? '#FAFBF7' : '#DCE5D3';
    const circ = pink ? '#F0C9C5' : check ? '#DCE5D3' : '#F0A27A';
    const cardBg = pink ? '#FDF1F0' : check ? '#EEF2E8' : '#FAFBF7';
    const fs = n > 10 ? 33 : 36;
    const rows = s.items.map((t, i) => `<div class=row style="font-size:${fs}px">${check ? '<span class=box></span>' : `<span class=num>${String(i + 1).padStart(2, '0')}</span>`}<span>${t}</span></div>`).join('');
    return `<body style="background:${bg}"><div class=circle style="width:620px;height:620px;right:-170px;top:-340px;background:${circ}"></div><div class=kicker>${s.kicker}</div><h1 style="top:150px;font-size:82px;max-width:840px">${s.headline}</h1><div class="card ${s.format}" style="top:470px;bottom:127px;background:${cardBg}">${rows}</div><div class=foot><span>Gentle Habit</span><span>${fr}</span></div></body>`;
  }
  if (s.format === 'promo') {
    const dark = v === 'dark';
    const bg = dark ? '#1F3B2D' : '#DCE5D3', fg = dark ? '#FAFBF7' : '#1F3B2D';
    const circ = dark ? '#2C5240' : '#F0A27A';
    const chips = (s.chips || []).map(c => `<div class=row style="font-size:40px;font-weight:700;flex:1;border-bottom:2px solid ${dark ? '#3a6050' : '#e3e8dc'}"><span class=num>+</span><span>${c}</span></div>`).join('');
    return `<body style="background:${bg};color:${fg}"><div class=circle style="width:760px;height:760px;right:-200px;top:-420px;background:${circ}"></div><div class=pill>Free printable</div><h1 style="top:205px;font-size:100px;color:${fg}">${s.headline}</h1><div class=sub style="top:640px;color:${dark ? '#DCE5D3' : '#3B5A49'}">${s.sub}</div><div class="card" style="top:790px;bottom:230px;background:${dark ? '#2C5240' : '#FAFBF7'};color:${fg}">${chips}</div><div class=cta style="background:${dark ? '#F0A27A' : '#1F3B2D'};color:${dark ? '#1F3B2D' : '#FAFBF7'}"><span>Get it free</span><span style="color:${dark ? '#1F3B2D' : '#F0A27A'}">gentlehabitclub.com</span></div></body>`;
  }
  throw new Error('unknown format ' + s.format);
}
(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2]));
  const out = process.argv[3]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
  for (const s of spec) {
    await p.setContent(`<style>${css}</style>${html(s)}`);
    await p.evaluate(async () => { await document.fonts.load('800 40px Brico'); await document.fonts.load('700 40px Brico'); await document.fonts.load('500 40px Fig'); await document.fonts.load('700 40px Fig'); await document.fonts.ready; });
    await p.screenshot({ path: path.join(out, s.file) });
  }
  await b.close();
})();
