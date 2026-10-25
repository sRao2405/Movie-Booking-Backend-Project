/* ============ CONFIG ============ */
// Spring Boot base URL. Change this to match your controllers.
const API = 'http://localhost:8081/api';
/* Endpoints this UI expects (adjust the paths in `api` below if yours differ):
   GET  /cities
   GET  /movies
   GET  /movies/{id}/shows?cityId=      -> [Show]  (Show has nested screen.theatre.city)
   GET  /shows/{id}/seats               -> [Seat]  (seats of that show's screen)
   GET  /shows/{id}/booked-seat-ids     -> [seatId]
   POST /bookings  {userId, showId, seatIds:[...]}  -> Booking
*/
 
/* ============ DATA LAYER (live API, falls back to demo data) ============ */
let live = false;
const MOCK = (() => {
  const cities=[['Delhi','Delhi'],['Mumbai','Maharashtra'],['Bangalore','Karnataka'],['Hyderabad','Telangana'],['Chennai','Tamil Nadu'],['Pune','Maharashtra']].map((c,i)=>({id:i+1,name:c[0],state:c[1]}));
  const mv=[['Ramayan','Drama','Hindi',180,8.9,'Tale of a god who defeated evil and brought light to this world'],['Dangal','Drama','Hindi',161,8.4,'A former wrestler trains his daughters to become world-class wrestlers.'],['Chhichhore','Comedy','Hindi',143,8.3,'Friends reunite and remember their college days.'],['Barfi','Romance','Hindi',151,8.1,'A charming young man forms an unusual bond with two women.'],['Lagaan','Drama','Hindi',224,8.1,'Villagers challenge British officers to a cricket match.'],['KGF Chapter 1','Action','Kannada',156,8.2,'A man rises from poverty in the gold mines of Kolar.']];
  const posters = [
  'https://stat5.bollywoodhungama.in/wp-content/uploads/2026/09/Ramayana-%E2%80%93-Part-I-1-306x393.jpeg',
  'https://thumb.wikimedia.org/wikipedia/en/thumb/9/99/Dangal_Poster.jpg/250px-Dangal_Poster.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail',
  'https://upload.wikimedia.org/wikipedia/en/3/3d/Chhichhore_Poster.jpg?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  'https://upload.wikimedia.org/wikipedia/en/2/2e/Barfi%21_poster.jpg?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  'https://upload.wikimedia.org/wikipedia/en/b/b6/Lagaan.jpg?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  'https://m.media-amazon.com/images/M/MV5BM2M0YmIxNzItOWI4My00MmQzLWE0NGYtZTM3NjllNjIwZjc5XkEyXkFqcGc@._V1_FMjpg_UX500_.jpg'
];


const movies=mv.map((m,i)=>({id:i+1,title:m[0],genre:m[1],language:m[2],durationMinutes:m[3],rating:m[4],description:m[5],posterUrl:posters[i]}));  
 const th=[['PVR Select Citywalk','Saket, New Delhi',1],['INOX Nehru Place','Nehru Place, New Delhi',1],['PVR Phoenix Mall','Lower Parel, Mumbai',2],['PVR Orion Mall','Rajajinagar, Bangalore',3],['PVR Banjara Hills','Banjara Hills, Hyderabad',4]].map((t,i)=>({id:i+1,name:t[0],address:t[1],city:cities[t[2]-1]}));
  const screens=[[1,'AUDI-1'],[1,'AUDI-2'],[2,'AUDI-1'],[3,'AUDI-1'],[4,'AUDI-1'],[5,'AUDI-1']].map((s,i)=>({id:i+1,name:s[1],totalSeats:50,theatre:th[s[0]-1]}));
  const times=['10:00','14:00','18:30','21:30'], prices=[220,250,300,320];
  const shows=[];let sid=1;
  movies.forEach(m=>screens.forEach((s,si)=>{ if((m.id+si)%2===0) times.forEach((t,ti)=>shows.push({id:sid++,movie:m,screen:s,showDate:'2026-10-24',startTime:`2026-10-24T${t}:00`,ticketPrice:prices[ti]}))}));
  const types=r=>r<2?'REGULAR':r<4?'PREMIUM':'VIP';
  const seatsFor=s=>{const out=[];'ABCDE'.split('').forEach((r,ri)=>{for(let c=1;c<=10;c++)out.push({id:s.id*100+ri*10+c,seatNumber:r+c,row:r,col:c,seatType:types(ri),screen:s})});return out};
  const booked={};
  const users=[['Rahul Sharma','rahul'],['Priya Singh','priya'],['Aman Verma','aman'],['Sneha Kapoor','sneha']].map((u,i)=>({id:i+1,name:u[0],email:u[1]+'@gmail.com',password:u[1]+'123'}));
  return {cities,movies,shows,seatsFor,booked,users,mine:[],th,screens};
})();
 
async function http(path,opt){
  const hd={'Content-Type':'application/json'};
  if(path.startsWith('/admin')&&st.adminKey) hd['X-Admin-Key']=st.adminKey;
  const r=await fetch(API+path,{headers:hd,...opt});
  if(!r.ok){
    const t=await r.text(); let msg=t;
    try{const o=JSON.parse(t); msg=o.message||o.error||t}catch(e){}
    throw new Error(msg||r.status);
  }
  return r.json();
}
const api={
  async cities(){try{const d=await http('/cities');live=true;return d}catch(e){live=false;return MOCK.cities}},
  async login(email,password){
    if(live) return http('/auth/login',{method:'POST',body:JSON.stringify({email,password})});
    const u=MOCK.users.find(x=>x.email===email.toLowerCase()&&x.password===password);
    if(!u) throw new Error('Invalid email or password');
    return {id:u.id,name:u.name,email:u.email};
  },
  async register(f){
    if(live) return http('/auth/register',{method:'POST',body:JSON.stringify(f)});
    if(MOCK.users.some(x=>x.email===f.email.toLowerCase())) throw new Error('Email already registered');
    const u={id:MOCK.users.length+1,...f,email:f.email.toLowerCase()}; MOCK.users.push(u);
    return {id:u.id,name:u.name,email:u.email};
  },
  async myBookings(uid){return live?http(`/bookings/user/${uid}`):MOCK.mine.filter(b=>b.userId===uid)},
  async cancel(id){
    if(live) return http(`/bookings/${id}/cancel`,{method:'PUT'});
    const b=MOCK.mine.find(x=>x.id===id); b.status='CANCELLED';
    MOCK.booked[b.showId]=(MOCK.booked[b.showId]||[]).filter(x=>!b.seatIds.includes(x));
    return b;
  },
  async theatres(cid){
    if(live) return http(`/theatre-info?cityId=${cid}`);
    return MOCK.th.filter(t=>t.city.id===cid).map(t=>{
      const sc=MOCK.screens.filter(s=>s.theatre.id===t.id).map(s=>({id:s.id,name:s.name,totalSeats:s.totalSeats}));
      return {id:t.id,name:t.name,address:t.address,city:t.city.name,state:t.city.state,screens:sc,totalSeats:sc.reduce((a,s)=>a+s.totalSeats,0)};
    });
  },
  async theatreShows(id){return live?http(`/theatre-info/${id}/shows`):MOCK.shows.filter(s=>s.screen.theatre.id===id)},
  async movies(){return live?http('/movies'):MOCK.movies},
  async shows(mid,cid){return live?http(`/movies/${mid}/shows?cityId=${cid}`):MOCK.shows.filter(s=>s.movie.id===mid&&s.screen.theatre.city.id===cid)},
  async seats(show){return live?http(`/shows/${show.id}/seats`):MOCK.seatsFor(show.screen)},
  async taken(show){return live?http(`/shows/${show.id}/booked-seat-ids`):(MOCK.booked[show.id]||(MOCK.booked[show.id]=[1,2,3,14,15,26].map(n=>show.screen.id*100+n)))},
  async book(show,userId,seatIds,seats){
    if(live) return http('/bookings',{method:'POST',body:JSON.stringify({userId,showId:show.id,seatIds})});
    MOCK.booked[show.id]=(MOCK.booked[show.id]||[]).concat(seatIds);
    const b={id:Math.floor(Math.random()*9000)+1000,status:'CONFIRMED',totalPrice:show.ticketPrice*seatIds.length,seats,
      bookedAt:new Date().toISOString(),showId:show.id,movieTitle:show.movie.title,theatreName:show.screen.theatre.name,
      screenName:show.screen.name,startTime:show.startTime};
    MOCK.mine.push({...b,userId,seatIds});
    return b;
  }
};
 
/* ============ STATE + HELPERS ============ */
const $=s=>document.querySelector(s), app=$('#app');
const st={cities:[],movies:[],cityId:null,movie:null,show:null,seats:[],taken:[],sel:new Set(),q:'',view:null,theatre:null,user:loadUser(),adminKey:loadAdminKey(),adminTab:'Movie'};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=t=>new Date(t).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
const rs=n=>'₹'+Number(n).toFixed(0);
const poster=m=>`<div class="poster">${m.posterUrl?`<img src="${esc(m.posterUrl)}" alt="" onerror="this.remove()">`:''}<span>${esc(m.title)}</span></div>`;
 
function go(view){ if(view==='movies'){st.theatre=null;st.movie=null;st.show=null;st.sel.clear();st.q='';st.view=null;} render(); }
 
/* ============ VIEWS ============ */
async function render(){
  if(st.view==='bookings') return bookingsView();
  if(st.view==='admin') return adminView();
  if(st.view==='theatres') return theatresView();
  if(st.view) return authView();
  if(st.show) return seatView();
  if(st.theatre) return theatreView();
  if(st.movie) return showsView();
  return moviesView();
}
 
function movieCards(list){
  if(!list.length) return `<div class="empty">No movies match "${esc(st.q)}". Try a title, genre or language.</div>`;
  return `<div class="grid">${list.map(m=>`
    <div class="movie" tabindex="0" role="button" data-id="${m.id}">${poster(m)}
      <div class="minfo"><b>${esc(m.title)}</b>${esc(m.genre)} · ${esc(m.language)} · ★ ${m.rating}<button class="btn" type="button">Book now</button></div></div>`).join('')}</div>`;
}
 
function filterMovies(){
  const q=st.q.trim().toLowerCase();
  return !q?st.movies:st.movies.filter(m=>[m.title,m.genre,m.language].some(v=>String(v||'').toLowerCase().includes(q)));
}
 
function drawMovies(){
  const box=$('#movies');
  box.innerHTML=movieCards(filterMovies());
  box.querySelectorAll('.movie').forEach(el=>{
    const open=()=>{st.movie=st.movies.find(m=>m.id==el.dataset.id);render()};
    el.onclick=open; el.onkeydown=e=>{if(e.key==='Enter'&&e.target===el)open()};
  });
}
 
async function moviesView(){
  app.innerHTML=`<div class="top-row"><h2>Now showing</h2>
    <input id="search" class="search" type="search" placeholder="Search movies, genre or language" aria-label="Search movies" value="${esc(st.q)}"></div>
    <div id="movies"></div>`;
  $('#search').oninput=e=>{st.q=e.target.value;drawMovies()};
  drawMovies();
}
 
async function showsView(){
  const m=st.movie;
  app.innerHTML=`<button class="back">← All movies</button>
  <div class="detail">${poster(m)}<div><h2 style="margin-bottom:4px">${esc(m.title)}</h2>
  <span class="badge">${esc(m.genre)}</span> <span class="badge">${esc(m.language)}</span> <span class="badge">${m.durationMinutes} min</span> <span class="badge">★ ${m.rating}</span>
  <p>${esc(m.description)}</p><button class="btn" id="bookNow" type="button">Book now</button></div></div><div id="shows" class="empty">Loading shows…</div>`;
  app.querySelector('.back').onclick=()=>go('movies');
  $('#bookNow').onclick=()=>$('#shows').scrollIntoView({behavior:'smooth'});
  let shows=[];
  try{shows=await api.shows(m.id,st.cityId)}catch(e){$('#shows').innerHTML=`<div class="msg">Could not load shows: ${esc(e.message)}</div>`;return}
  if(!shows.length){$('#shows').innerHTML=`<div class="empty">No shows for ${esc(m.title)} in this city yet. Try another city.</div>`;return}
  const by={};shows.forEach(s=>{const t=s.screen.theatre;(by[t.id]??={t,list:[]}).list.push(s)});
  $('#shows').className='';
  $('#shows').innerHTML=Object.values(by).map(g=>`<div class="theatre"><h3>${esc(g.t.name)}</h3><small>${esc(g.t.address)}</small>
    <div class="times">${g.list.sort((a,b)=>a.startTime<b.startTime?-1:1).map(s=>`<button class="time" data-id="${s.id}">${fmt(s.startTime)}<small>${esc(s.screen.name)} · ${rs(s.ticketPrice)}</small></button>`).join('')}</div></div>`).join('');
  $('#shows').querySelectorAll('.time').forEach(b=>b.onclick=()=>{st.show=shows.find(s=>s.id==b.dataset.id);st.sel.clear();render()});
}
 
async function seatView(){
  const s=st.show;
  app.innerHTML=`<button class="back">← Showtimes</button>
  <h2 style="margin-bottom:2px">${esc(s.movie.title)}</h2>
  <p class="note">${esc(s.screen.theatre.name)} · ${esc(s.screen.name)} · ${fmt(s.startTime)} · ${rs(s.ticketPrice)} per seat</p>
  <div id="err"></div><div id="map" class="empty">Loading seats…</div>`;
  app.querySelector('.back').onclick=()=>{st.show=null;st.sel.clear();render()};
  try{st.seats=await api.seats(s);st.taken=st.seats.some(x=>'booked' in x)?st.seats.filter(x=>x.booked).map(x=>x.id):await api.taken(s)}catch(e){$('#map').innerHTML=`<div class="msg">Could not load seats: ${esc(e.message)}</div>`;return}
  drawSeats();
}
 
function drawSeats(){
  const rows={};st.seats.forEach(x=>(rows[x.row]??=[]).push(x));
  const s=st.show;
  $('#map').className='';
  $('#map').innerHTML=`<div class="screen"></div><div class="screen-l">Screen this way</div><div class="seatmap">${Object.keys(rows).sort().map(r=>`<div class="row"><span class="rl">${r}</span>${rows[r].sort((a,b)=>a.col-b.col).map(x=>{
    const t=st.taken.includes(x.id), on=st.sel.has(x.id);
    return `<button class="seat ${x.seatType}${t?' taken':''}${on?' sel':''}" data-id="${x.id}" ${t?'disabled':''} aria-label="Seat ${x.seatNumber} ${x.seatType}" aria-pressed="${on}">${x.col}</button>`}).join('')}</div>`).join('')}</div>
  <p class="note" style="text-align:center;margin:14px 0 0">${st.seats.length-st.taken.length} of ${st.seats.length} seats available</p>
  <div class="legend"><span><i style="background:var(--reg)"></i>Regular</span><span><i style="background:var(--prem)"></i>Premium</span><span><i style="background:var(--vip)"></i>VIP</span><span><i style="background:var(--brand)"></i>Selected</span><span><i style="background:var(--taken)"></i>Booked</span></div>
  <div class="checkout"><div><b>${st.sel.size}</b> seat${st.sel.size===1?'':'s'} · <b>${rs(st.sel.size*s.ticketPrice)}</b></div><button class="btn" id="pay" ${st.sel.size?'':'disabled'}>Book ${st.sel.size||''} seat${st.sel.size===1?'':'s'}</button></div>`;
  $('#map').querySelectorAll('.seat:not(.taken)').forEach(b=>b.onclick=()=>{const id=+b.dataset.id;st.sel.has(id)?st.sel.delete(id):st.sel.add(id);drawSeats()});
  $('#pay').onclick=confirmBooking;
}
 
async function confirmBooking(){
  if(!st.user){st.view='login';return render();}
  const s=st.show, ids=[...st.sel], names=st.seats.filter(x=>st.sel.has(x.id)).map(x=>x.seatNumber);
  $('#pay').disabled=true;$('#pay').textContent='Booking…';
  try{
    const b=await api.book(s,st.user.id,ids,names);
    document.querySelector('.checkout')?.remove();
    app.innerHTML=`<div class="ticket"><div class="top"><span class="badge live">${esc(b.status||'CONFIRMED')}</span>
      <h2 style="margin-top:10px">${esc(s.movie.title)}</h2>
      <dl><dt>Theatre</dt><dd>${esc(s.screen.theatre.name)}</dd><dt>Screen</dt><dd>${esc(s.screen.name)}</dd><dt>Time</dt><dd>${esc(s.showDate)}, ${fmt(s.startTime)}</dd><dt>Seats</dt><dd>${esc(names.join(', '))}</dd></dl></div>
      <div class="bot"><div><small class="note">Booking #${esc(b.id)}</small><br><b>${rs(b.totalPrice??ids.length*s.ticketPrice)}</b></div><button class="btn" id="done">Done</button></div></div>`;
    $('#done').onclick=()=>{st.show=null;st.movie=null;st.sel.clear();render()};
  }catch(e){
    $('#err').innerHTML=`<div class="msg">Booking failed: ${esc(e.message)}</div>`;
    $('#pay').disabled=false;$('#pay').textContent='Book seats';
  }
}
 
/* ============ INIT ============ */
(async()=>{
  st.cities=await api.cities();
  $('#mode').textContent=live?'Connected to API':'Demo data (API not reachable)';
  $('#mode').className='badge'+(live?' live':'');
  renderAuthBar();
  $('#navAdmin').onclick=()=>{st.movie=null;st.show=null;st.theatre=null;st.sel.clear();st.view='admin';render()};
  $('#navTheatres').onclick=()=>{st.movie=null;st.show=null;st.theatre=null;st.sel.clear();st.view='theatres';render()};
  const sel=$('#city');
  sel.innerHTML=st.cities.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  st.cityId=st.cities[0]?.id; sel.onchange=()=>{st.cityId=+sel.value;st.show=null;st.sel.clear();if(st.theatre){st.theatre=null;st.view='theatres'}render()};
  try{st.movies=await api.movies()}catch(e){app.innerHTML=`<div class="msg">Could not load movies: ${esc(e.message)}</div>`;return}
  render();
})();
 
/* ============ AUTH ============ */
function loadUser(){ try{return JSON.parse(localStorage.getItem('bms_user'))}catch(e){return null} }
function saveUser(u){ st.user=u; try{u?localStorage.setItem('bms_user',JSON.stringify(u)):localStorage.removeItem('bms_user')}catch(e){} renderAuthBar(); }
 
function renderAuthBar(){
  const box=$('#auth');
  if(st.user){
    box.innerHTML=`<button class="link" id="mb" type="button">My bookings</button><span class="who">Hi, ${esc(String(st.user.name||'').split(' ')[0])}</span><button class="link" id="lo" type="button">Logout</button>`;
    $('#mb').onclick=()=>{st.show=null;st.movie=null;st.sel.clear();st.view='bookings';render()};
    $('#lo').onclick=()=>{saveUser(null);st.view=null;st.show=null;st.movie=null;st.sel.clear();render()};
  }else{
    box.innerHTML=`<button class="btn sm" id="li" type="button">Login</button>`;
    $('#li').onclick=()=>{st.view='login';render()};
  }
}
 
function authView(){
  const reg=st.view==='register';
  app.innerHTML=`<button class="back" type="button">← Back</button>
  <form id="authForm" class="authbox"><h2>${reg?'Create account':'Login'}</h2><div id="authErr"></div>
    ${reg?'<label>Name<input name="name" required autocomplete="name"></label><label>Phone<input name="phone" inputmode="tel" autocomplete="tel"></label>':''}
    <label>Email<input name="email" type="email" required autocomplete="email"></label>
    <label>Password<input name="password" type="password" required minlength="4" autocomplete="${reg?'new-password':'current-password'}"></label>
    <button class="btn" type="submit">${reg?'Sign up':'Login'}</button>
    <p class="note">${reg?'Already have an account? <a href="#" id="sw">Login</a>':'New here? <a href="#" id="sw">Create an account</a>'}</p>
    ${!live&&!reg?'<p class="note">Demo login: rahul@gmail.com / rahul123</p>':''}
  </form>`;
  app.querySelector('.back').onclick=()=>{st.view=null;render()};
  $('#sw').onclick=e=>{e.preventDefault();st.view=reg?'login':'register';render()};
  $('#authForm').onsubmit=async e=>{
    e.preventDefault();
    const f=Object.fromEntries(new FormData(e.target)), btn=e.target.querySelector('button[type=submit]');
    btn.disabled=true;
    try{
      const u=reg?await api.register(f):await api.login(f.email,f.password);
      saveUser({id:u.id,name:u.name,email:u.email});
      st.view=null; render();
    }catch(err){
      $('#authErr').innerHTML=`<div class="msg">${esc(err.message)}</div>`; btn.disabled=false;
    }
  };
}
 
/* ============ MY BOOKINGS ============ */
async function bookingsView(){
  if(!st.user){st.view='login';return authView();}
  app.innerHTML=`<button class="back" type="button">← All movies</button><h2>My bookings</h2><div id="bk" class="empty">Loading…</div>`;
  app.querySelector('.back').onclick=()=>go('movies');
  let list=[];
  try{list=await api.myBookings(st.user.id)}catch(e){$('#bk').innerHTML=`<div class="msg">Could not load bookings: ${esc(e.message)}</div>`;return}
  if(!list.length){$('#bk').innerHTML='<div class="empty">No bookings yet. Pick a movie and book your first show.</div>';return}
  list.sort((a,b)=>b.id-a.id);
  $('#bk').className='';
  $('#bk').innerHTML=`<div id="bkerr"></div>`+list.map(b=>{
    const cancelled=b.status==='CANCELLED', past=new Date(b.startTime)<new Date();
    return `<div class="bk"><div class="bk-main">
      <h3>${esc(b.movieTitle||'Show #'+b.showId)}</h3>
      <div class="note" style="margin:2px 0 8px">${esc(b.theatreName||'')} · ${esc(b.screenName||'')}</div>
      <div>${b.startTime?new Date(b.startTime).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):''}</div>
      <div>Seats: <b>${esc((b.seats||[]).join(', '))}</b></div>
      <div>Total: <b>${rs(b.totalPrice)}</b> <small class="note">· Booking #${b.id}</small></div></div>
      <div class="bk-side"><span class="badge ${cancelled?'cancel':'live'}">${esc(b.status)}</span>
      ${!cancelled&&!past?`<button class="btn sm danger" data-id="${b.id}" type="button">Cancel</button>`:''}
      ${!cancelled&&past?'<small class="note">Show has started</small>':''}</div></div>`}).join('');
  $('#bk').querySelectorAll('button[data-id]').forEach(btn=>btn.onclick=async()=>{
    if(!confirm('Cancel this booking? The seats will be released.')) return;
    btn.disabled=true;
    try{await api.cancel(+btn.dataset.id); bookingsView()}
    catch(e){$('#bkerr').innerHTML=`<div class="msg">Cancel failed: ${esc(e.message)}</div>`;btn.disabled=false}
  });
}
 
/* ============ THEATRES ============ */
async function theatresView(){
  const city=st.cities.find(c=>c.id===st.cityId);
  app.innerHTML=`<h2>Theatres in ${esc(city?city.name:'')}</h2><div id="th" class="empty">Loading theatres…</div>`;
  let list=[];
  try{list=await api.theatres(st.cityId)}catch(e){$('#th').innerHTML=`<div class="msg">Could not load theatres: ${esc(e.message)}</div>`;return}
  if(!list.length){$('#th').innerHTML='<div class="empty">No theatres listed in this city yet.</div>';return}
  $('#th').className='';
  $('#th').innerHTML=`<div class="tgrid">${list.map(t=>`<div class="tcard">
    <h3>${esc(t.name)}</h3>
    <p class="note" style="margin:2px 0 10px">${esc(t.address)}<br>${esc(t.city)}${t.state?', '+esc(t.state):''}</p>
    <div class="chips">${(t.screens||[]).map(s=>`<span class="badge">${esc(s.name)} · ${s.totalSeats} seats</span>`).join('')}</div>
    <p class="note" style="margin:10px 0">${(t.screens||[]).length} screen${(t.screens||[]).length===1?'':'s'} · ${t.totalSeats||0} seats in total</p>
    <button class="btn sm" data-id="${t.id}" type="button">View shows</button></div>`).join('')}</div>`;
  $('#th').querySelectorAll('button[data-id]').forEach(b=>b.onclick=()=>{
    st.theatre=list.find(t=>t.id==b.dataset.id); st.view=null; render();
  });
}
 
async function theatreView(){
  const t=st.theatre;
  app.innerHTML=`<button class="back" type="button">← All theatres</button>
  <h2 style="margin-bottom:2px">${esc(t.name)}</h2>
  <p class="note">${esc(t.address)} · ${esc(t.city)} · ${(t.screens||[]).length} screens · ${t.totalSeats||0} seats</p>
  <div id="ts" class="empty">Loading shows…</div>`;
  app.querySelector('.back').onclick=()=>{st.theatre=null;st.view='theatres';render()};
  let shows=[];
  try{shows=await api.theatreShows(t.id)}catch(e){$('#ts').innerHTML=`<div class="msg">Could not load shows: ${esc(e.message)}</div>`;return}
  if(!shows.length){$('#ts').innerHTML='<div class="empty">No shows scheduled at this theatre.</div>';return}
  const by={};shows.forEach(s=>(by[s.movie.id]??={m:s.movie,list:[]}).list.push(s));
  $('#ts').className='';
  $('#ts').innerHTML=Object.values(by).map(g=>`<div class="theatre"><h3>${esc(g.m.title)}</h3>
    <small>${esc(g.m.genre)} · ${esc(g.m.language)} · ${g.m.durationMinutes} min · ★ ${g.m.rating}</small>
    <div class="times">${g.list.sort((a,b)=>a.startTime<b.startTime?-1:1).map(s=>`<button class="time" data-id="${s.id}" type="button">${fmt(s.startTime)}<small>${esc(new Date(s.startTime).toLocaleDateString('en-IN',{day:'numeric',month:'short'}))} · ${esc(s.screen.name)} · ${rs(s.ticketPrice)}</small></button>`).join('')}</div></div>`).join('');
  $('#ts').querySelectorAll('.time').forEach(b=>b.onclick=()=>{st.show=shows.find(s=>s.id==b.dataset.id);st.sel.clear();render()});
}
 
/* ============ ADMIN ============ */
function loadAdminKey(){ try{return sessionStorage.getItem('bms_admin')||''}catch(e){return ''} }
function saveAdminKey(k){ st.adminKey=k; try{k?sessionStorage.setItem('bms_admin',k):sessionStorage.removeItem('bms_admin')}catch(e){} }
 
async function refreshCities(){
  st.cities=await http('/cities');
  const sel=$('#city');
  sel.innerHTML=st.cities.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  sel.value=st.cityId;
}
 
function adminLogin(){
  app.innerHTML=`<button class="back" type="button">← Back</button>
  <form id="keyForm" class="authbox"><h2>Admin access</h2><div id="keyErr"></div>
    <label>Admin key<input name="key" type="password" required autocomplete="off"></label>
    <button class="btn" type="submit">Unlock</button>
    <p class="note">The key is the <code>admin.key</code> value in your <code>application.properties</code>.</p></form>`;
  app.querySelector('.back').onclick=()=>go('movies');
  $('#keyForm').onsubmit=async e=>{
    e.preventDefault();
    saveAdminKey(new FormData(e.target).get('key').trim());
    try{await http('/admin/check'); adminView()}
    catch(err){saveAdminKey(''); $('#keyErr').innerHTML=`<div class="msg">${esc(err.message)}</div>`}
  };
}
 
async function adminView(){
  if(!live){
    app.innerHTML=`<button class="back" type="button">← Back</button><div class="msg">Admin needs the backend. Start the Spring Boot app and reload.</div>`;
    app.querySelector('.back').onclick=()=>go('movies'); return;
  }
  if(!st.adminKey) return adminLogin();
  const tabs=['Movie','City','Theatre','Screen','Seats','Show'];
  app.innerHTML=`<div class="top-row"><h2>Admin</h2><button class="link" id="adLock" type="button">Lock admin</button></div>
    <div class="tabs">${tabs.map(t=>`<button class="tab${t===st.adminTab?' on':''}" data-t="${t}" type="button">${t}</button>`).join('')}</div>
    <div id="adMsg"></div><div id="adBody" class="adbox"></div>`;
  $('#adLock').onclick=()=>{saveAdminKey('');go('movies')};
  app.querySelectorAll('.tab').forEach(b=>b.onclick=()=>adminTab(b.dataset.t));
  adminTab(st.adminTab);
}
 
const inp=(label,name,attrs='')=>`<label>${label}<input name="${name}" ${attrs}></label>`;
const cityOpts=ctx=>'<option value="">Select city</option>'+ctx.cities.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
const cityOnly=ctx=>`<label>City<select name="cityId" required>${cityOpts(ctx)}</select></label>`;
const cascade=(ctx,withScreen)=>cityOnly(ctx)+`<label>Theatre<select name="theatreId" required><option value="">Select theatre</option></select></label>`
  +(withScreen?`<label>Screen<select name="screenId" required><option value="">Select screen</option></select></label>`:'');
 
function wireCascade(root,withScreen){
  const cs=root.querySelector('[name=cityId]'), ts=root.querySelector('[name=theatreId]'), ss=withScreen?root.querySelector('[name=screenId]'):null;
  let theatres=[];
  const loadScreens=()=>{
    const t=theatres.find(x=>x.id==ts.value), sc=t?(t.screens||[]):[];
    ss.innerHTML='<option value="">Select screen</option>'+sc.map(s=>`<option value="${s.id}">${esc(s.name)} (${s.totalSeats||0} seats)</option>`).join('');
  };
  cs.onchange=async()=>{
    theatres=cs.value?await http(`/theatre-info?cityId=${cs.value}`):[];
    ts.innerHTML='<option value="">Select theatre</option>'+theatres.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
    if(ss) loadScreens();
  };
  ts.onchange=()=>{ if(ss) loadScreens() };
}
 
const ADMIN={
  Movie:()=>({path:'/admin/movies',
    html:inp('Title *','title','required')+'<label>Description<textarea name="description" rows="3"></textarea></label>'
      +inp('Genre','genre')+inp('Language','language')+inp('Duration (minutes) *','durationMinutes','type="number" min="1" required')
      +inp('Rating (0 to 10)','rating','type="number" step="0.1" min="0" max="10"')+inp('Release date','releaseDate','type="date"')
      +inp('Poster image link','posterUrl','placeholder="https://… or /images/poster.jpg"'),
    build:f=>({title:f.title,description:f.description,genre:f.genre,language:f.language,durationMinutes:+f.durationMinutes,
      rating:f.rating?+f.rating:null,releaseDate:f.releaseDate||null,posterUrl:f.posterUrl||null}),
    done:r=>`Movie "${r.title}" added`, after:async()=>{st.movies=await http('/movies')}}),
  City:()=>({path:'/admin/cities', html:inp('City name *','name','required')+inp('State','state'),
    build:f=>({name:f.name,state:f.state}), done:r=>`City "${r.name}" added`, after:refreshCities}),
  Theatre:ctx=>({path:'/admin/theatres', html:cityOnly(ctx)+inp('Theatre name *','name','required')+inp('Address','address'),
    build:f=>({name:f.name,address:f.address,cityId:+f.cityId}), done:r=>`Theatre "${r.name}" added`}),
  Screen:ctx=>({path:'/admin/screens', cascade:'theatre',
    html:cascade(ctx,false)+inp('Screen name *','name','required placeholder="AUDI-1"')+inp('Total seats (optional)','totalSeats','type="number" min="0"'),
    build:f=>({name:f.name,theatreId:+f.theatreId,totalSeats:f.totalSeats?+f.totalSeats:null}), done:r=>`Screen "${r.name}" added`}),
  Seats:ctx=>({path:'/admin/seats/generate', cascade:'screen', noClear:true, btn:'Create seats',
    html:cascade(ctx,true)+inp('Seats per row *','seatsPerRow','type="number" min="1" max="40" value="10" required')
      +inp('Regular rows','regularRows','type="number" min="0" value="2"')+inp('Premium rows','premiumRows','type="number" min="0" value="2"')
      +inp('VIP rows','vipRows','type="number" min="0" value="1"')
      +'<p class="note">Rows are lettered A, B, C… in order: regular first, then premium, then VIP. Seats that already exist are skipped, and the screen\'s seat count is updated.</p>',
    build:f=>({screenId:+f.screenId,seatsPerRow:+f.seatsPerRow,regularRows:+f.regularRows||0,premiumRows:+f.premiumRows||0,vipRows:+f.vipRows||0}),
    done:r=>`${r.created} seats created. The screen now has ${r.totalSeats} seats.`}),
  Show:ctx=>({path:'/admin/shows', cascade:'screen', noClear:true,
    html:'<label>Movie *<select name="movieId" required><option value="">Select movie</option>'+ctx.movies.map(m=>`<option value="${m.id}">${esc(m.title)} (${m.durationMinutes} min)</option>`).join('')+'</select></label>'
      +cascade(ctx,true)+inp('Start date and time *','startTime','type="datetime-local" required')+inp('Ticket price (₹) *','ticketPrice','type="number" min="1" step="1" required'),
    build:f=>({movieId:+f.movieId,screenId:+f.screenId,startTime:f.startTime,ticketPrice:+f.ticketPrice}),
    done:r=>`Show added: ends at ${new Date(r.endTime).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}`})
};
 
async function adminTab(name){
  st.adminTab=name;
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.t===name));
  $('#adMsg').innerHTML='';
  const box=$('#adBody'); box.textContent='Loading…';
  let ctx;
  try{ctx={cities:await http('/cities'),movies:await http('/movies')}}
  catch(e){box.innerHTML=`<div class="msg">${esc(e.message)}</div>`;return}
  const def=ADMIN[name](ctx);
  box.innerHTML=`<form id="adForm" class="adform"><h3>${name==='Seats'?'Create seats for a screen':'Add '+name.toLowerCase()}</h3>${def.html}<button class="btn" type="submit">${def.btn||'Add'}</button></form>`;
  const form=$('#adForm');
  if(def.cascade) wireCascade(form,def.cascade==='screen');
  form.onsubmit=async e=>{
    e.preventDefault();
    const f=Object.fromEntries(new FormData(form)), btn=form.querySelector('button[type=submit]');
    btn.disabled=true;
    try{
      const r=await http(def.path,{method:'POST',body:JSON.stringify(def.build(f))});
      $('#adMsg').innerHTML=`<div class="ok">${esc(def.done(r))}</div>`;
      if(def.after) await def.after();
      if(!def.noClear) form.querySelectorAll('input,textarea').forEach(i=>i.value='');
    }catch(err){
      if(/admin key/i.test(err.message)){saveAdminKey('');return adminView()}
      $('#adMsg').innerHTML=`<div class="msg">${esc(err.message)}</div>`;
    }
    btn.disabled=false;
  };
}
 
 
 