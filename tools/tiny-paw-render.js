// Usage: node tiny-paw-render.js spec.json outDir
// spec = array of {file, category:'kitten'|'puppy'|'safety', label, headline, items:[...]}
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const F = n => 'data:font/woff2;base64,' + fs.readFileSync(path.join(__dirname, 'node_modules/@fontsource', n)).toString('base64');
const COL = { kitten: '#C4623E', puppy: '#4C7A5A', safety: '#D9922B' };
const css = `
@font-face{font-family:Fraunces;font-weight:600;src:url(${F('fraunces/files/fraunces-latin-600-normal.woff2')})}
@font-face{font-family:Fraunces;font-weight:700;src:url(${F('fraunces/files/fraunces-latin-700-normal.woff2')})}
@font-face{font-family:Nunito;font-weight:400;src:url(${F('nunito/files/nunito-latin-400-normal.woff2')})}
@font-face{font-family:Nunito;font-weight:700;src:url(${F('nunito/files/nunito-latin-700-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1000px;height:1500px;background:#FFF9F3;font-family:Nunito;color:#3A2B24;position:relative;overflow:hidden}
.wrap{position:absolute;left:80px;right:80px;top:80px}
.label{display:inline-block;font-weight:700;font-size:28px;letter-spacing:4px;text-transform:uppercase;color:#fff;padding:12px 28px;border-radius:40px}
h1{font-family:Fraunces;font-weight:700;font-size:88px;line-height:1.08;margin-top:40px;color:#3A2B24}
.rule{width:120px;height:6px;margin:44px 0 36px}
ol{list-style:none;padding:0;counter-reset:i}
li{counter-increment:i;font-size:40px;line-height:1.28;padding:28px 0 28px 100px;border-top:2px solid #EADFD3;position:relative}
li:last-child{border-bottom:2px solid #EADFD3}
li:before{content:counter(i);position:absolute;left:0;top:26px;width:62px;height:62px;border-radius:50%;color:#fff;font-family:Fraunces;font-weight:700;font-size:30px;text-align:center;line-height:62px;background:var(--c)}
.banner{position:absolute;left:80px;right:80px;bottom:150px;height:96px;background:#3A2B24;color:#FFF9F3;border-radius:20px;text-align:center;font-weight:700;font-size:32px;line-height:96px}
.foot{position:absolute;left:0;right:0;bottom:0;height:110px;text-align:center;font-family:Fraunces;font-weight:600;font-size:32px;line-height:110px;color:#3A2B24;letter-spacing:1px}
`;
(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2]));
  const out = process.argv[3]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
  for (const s of spec) {
    const c = COL[s.category];
    const html = `<style>${css}</style><div style="--c:${c}"><div class=wrap><div class=label style="background:${c}">${s.label}</div><h1>${s.headline}</h1><div class=rule style="background:${c}"></div><ol>${s.items.map(i => `<li>${i}</li>`).join('')}</ol></div><div class=banner>Free Tiny Paw Starter Guide · Get it free</div><div class=foot>tinypawclub.com</div></div>`;
    await p.setContent(html); await p.evaluate(async () => { await document.fonts.load('700 40px Fraunces'); await document.fonts.load('400 40px Nunito'); await document.fonts.ready; });
    await p.screenshot({ path: path.join(out, s.file) });
  }
  await b.close();
})();
