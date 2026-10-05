import { chromium } from 'playwright';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const out = process.argv[2]; const errs=[];
for (const mode of ['light','dark']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(m => { try { localStorage.setItem('tyohnn-preview-mode', m); } catch {} }, mode);
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(mode+': '+e.message));
  await p.goto('http://localhost:5210/', { waitUntil: 'networkidle' }).catch(()=>{});
  await p.waitForTimeout(4000);
  await p.screenshot({ path: `${out}/${mode}-1-hero.png` });
  await (await p.$('.taste')).screenshot({ path: `${out}/${mode}-2-taste.png` });
  await (await p.$('#systems')).scrollIntoViewIfNeeded(); await p.waitForTimeout(3000);
  await p.screenshot({ path: `${out}/${mode}-3-gallery.png` });
  await ctx.close();
}
console.log(errs.join('\n')||'no page errors');
await b.close();
