// Usage: node stone-bloom-render.js spec.json outDir
// spec.json = array of {file, kicker, headline, items:[...]}
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const F = n => 'data:font/woff2;base64,' + fs.readFileSync(path.join(__dirname, 'node_modules/@fontsource', n)).toString('base64');
const css = `
@font-face{font-family:Domine;font-weight:400;src:url(${F('domine/files/domine-latin-400-normal.woff2')})}
@font-face{font-family:Domine;font-weight:700;src:url(${F('domine/files/domine-latin-700-normal.woff2')})}
@font-face{font-family:Inter;font-weight:400;src:url(${F('inter/files/inter-latin-400-normal.woff2')})}
@font-face{font-family:Inter;font-weight:600;src:url(${F('inter/files/inter-latin-600-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1000px;height:1500px;background:#E6E8E1;font-family:Inter;color:#27332D;position:relative;overflow:hidden}
.band{position:absolute;left:0;top:0;width:1000px;height:18px;background:#BF4F74}
.wrap{position:absolute;left:80px;right:80px;top:110px}
.kicker{font-size:30px;letter-spacing:5px;text-transform:uppercase;color:#BF4F74;font-weight:600}
h1{font-family:Domine;font-weight:700;font-size:92px;line-height:1.08;margin-top:34px;color:#22302A}
.rule{width:120px;height:6px;background:#BF4F74;margin:48px 0 44px}
ol{list-style:none;padding:0;counter-reset:i}
li{counter-increment:i;font-size:41px;line-height:1.3;padding:34px 0 34px 100px;border-top:2px solid #c9cdc3;position:relative}
li:last-child{border-bottom:2px solid #c9cdc3}
li:before{content:counter(i);position:absolute;left:0;top:32px;width:62px;height:62px;border-radius:50%;background:#27332D;color:#E6E8E1;font-family:Domine;font-weight:700;font-size:30px;text-align:center;line-height:62px}
.foot{position:absolute;left:0;right:0;bottom:0;height:120px;background:#27332D;color:#E6E8E1;text-align:center;font-family:Domine;font-size:34px;line-height:120px;letter-spacing:1px}
`;
(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2]));
  const out = process.argv[3]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
  for (const s of spec) {
    const html = `<style>${css}</style><div class=band></div><div class=wrap><div class=kicker>${s.kicker}</div><h1>${s.headline}</h1><div class=rule></div><ol>${s.items.map(i => `<li>${i}</li>`).join('')}</ol></div><div class=foot>Stone &amp; Bloom · stonenbloomgarden.com</div>`;
    await p.setContent(html); await p.evaluate(async () => { await document.fonts.load('700 40px Domine'); await document.fonts.load('400 40px Inter'); await document.fonts.ready; });
    await p.screenshot({ path: path.join(out, s.file) });
  }
  await b.close();
})();
