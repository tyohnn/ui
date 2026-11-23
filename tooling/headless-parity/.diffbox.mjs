import sharp from "sharp";
const [a,b]=process.argv.slice(2);
const L=await sharp(a).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const R=await sharp(b).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const w=L.info.width; let x0=1e9,y0=1e9,x1=-1,y1=-1;
for(let i=0;i<L.data.length;i+=4){ if(L.data[i]!==R.data[i]||L.data[i+1]!==R.data[i+1]||L.data[i+2]!==R.data[i+2]){const p=i/4,x=p%w,y=Math.floor(p/w); x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);} }
console.log({x0,y0,x1,y1});
