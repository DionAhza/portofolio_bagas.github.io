const cv=document.getElementById('stars'),cx=cv.getContext('2d');let W,H,S=[],sh=[],mx=0,my=0;
function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight;S=Array.from({length:Math.min(220,W/5)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+.3,d:Math.random()*.9+.1,p:Math.random()*6,c:['#fff','#bfe9ff','#ffd1f3','#fff3b0'][Math.random()*4|0]}))}
rs();addEventListener('resize',rs);
addEventListener('pointermove',e=>{mx=e.clientX/W-.5;my=e.clientY/H-.5;g.style.transform=`translate(${e.clientX}px,${e.clientY}px)`});
const g=document.getElementById('glow');
(function f(t){cx.clearRect(0,0,W,H);for(const s of S){s.y-=s.d*.12;if(s.y<0)s.y=H;const a=.5+.5*Math.sin(t/500*s.d+s.p);cx.globalAlpha=a;cx.fillStyle=s.c;cx.beginPath();cx.arc(s.x-mx*s.d*40,s.y-my*s.d*40,s.r,0,7);cx.fill()}
if(Math.random()<.01)sh.push({x:Math.random()*W,y:Math.random()*H*.5,l:0});
sh=sh.filter(m=>m.l<40);for(const m of sh){m.l++;m.x+=14;m.y+=7;cx.globalAlpha=1-m.l/40;cx.strokeStyle='#fff';cx.lineWidth=2;cx.beginPath();cx.moveTo(m.x,m.y);cx.lineTo(m.x-70,m.y-35);cx.stroke()}
requestAnimationFrame(f)})(0);
const R=['Web Developer Cilik 👨‍💻','Penjelajah Galaksi 🌌','Pecinta HTML, CSS & JS 🚀'];let ri=0,ci=0,del=false;const ty=document.getElementById('typed');
(function tp(){const w=[...R[ri]];ty.textContent=w.slice(0,ci).join('');if(!del&&ci++==w.length){del=true;return setTimeout(tp,1400)}if(del&&--ci<0){del=false;ci=0;ri=(ri+1)%R.length}setTimeout(tp,del?40:90)})();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;el.classList.add('in');el.querySelectorAll('[data-w]').forEach(b=>b.style.width=b.dataset.w+'%');
el.querySelectorAll('[data-n]').forEach(c=>{const n=+c.dataset.n;let i=0;const id=setInterval(()=>{c.textContent=++i+'%';if(i>=n)clearInterval(id)},1600/n)});io.unobserve(el)}),{threshold:.2});
document.querySelectorAll('.rev').forEach(e=>io.observe(e));
document.querySelectorAll('.tilt').forEach(c=>{c.addEventListener('pointermove',e=>{const b=c.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;c.style.transform=`perspective(700px) rotateY(${x*14}deg) rotateX(${-y*14}deg) translateY(-6px)`});c.addEventListener('pointerleave',()=>c.style.transform='')});
addEventListener('click',e=>{for(let i=0;i<9;i++){const s=document.createElement('div');s.className='pop';s.textContent=['✨','⭐','🌟','💫'][i%4];s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';const a=Math.random()*6.28,d=40+Math.random()*70;s.style.setProperty('--x',Math.cos(a)*d+'px');s.style.setProperty('--y',Math.sin(a)*d+'px');document.body.appendChild(s);setTimeout(()=>s.remove(),1000)}});
document.querySelector('form').addEventListener('submit',()=>{document.querySelector('form button').textContent='🚀 Meluncur...'});