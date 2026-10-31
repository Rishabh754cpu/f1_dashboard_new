/* ===== EDIT THESE if your Tableau Public names differ =====
   Format on Tableau Public: <WorkbookName>/<ViewName>  (see the share > embed code) */
var TABLEAU = {
  dashboard: { name: 'F1RACEINTELLIGENCEDASHBOARD/Dashboard3', height: 1300 },
  story:     { name: 'F1RACEINTELLIGENCESTORY/Story1',        height: 900 }
};
var TABLEAU_HOST = 'https://public.tableau.com';

var D = window.F1DATA || {};
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var fmt = function (n) { return Number(n).toLocaleString('en-US'); };

/* ---------- Tableau embed ---------- */
var mounted = {};
function mountViz(key) {
  if (mounted[key]) return;
  mounted[key] = true;
  var cfg = TABLEAU[key], host = $('#host-' + key);
  var base = TABLEAU_HOST + '/static/images/' + cfg.name.split('/')[0].slice(0, 2) + '/' + cfg.name.split('/')[0] + '/' + cfg.name.split('/')[1] + '/1';
  $('#link-' + key).href = TABLEAU_HOST + '/views/' + cfg.name;
  host.innerHTML =
    "<div class='tableauPlaceholder' style='position:relative'>" +
    "<object class='tableauViz' style='display:none;'>" +
    "<param name='host_url' value='" + encodeURIComponent(TABLEAU_HOST + '/') + "'/>" +
    "<param name='embed_code_version' value='3'/><param name='site_root' value=''/>" +
    "<param name='name' value='" + cfg.name + "'/><param name='tabs' value='no'/><param name='toolbar' value='yes'/>" +
    "<param name='static_image' value='" + base + ".png'/><param name='animate_transition' value='yes'/>" +
    "<param name='display_static_image' value='yes'/><param name='display_spinner' value='yes'/>" +
    "<param name='display_overlay' value='yes'/><param name='display_count' value='yes'/>" +
    "<param name='language' value='en-US'/></object></div>";
  var holder = host.firstChild, obj = holder.querySelector('object');
  obj.style.width = '100%';
  obj.style.height = cfg.height + 'px';
  var s = document.createElement('script');
  s.src = TABLEAU_HOST + '/javascripts/api/viz_v1.js';
  obj.parentNode.insertBefore(s, obj);
}
function showViz(key, scroll) {
  $('#body-' + key).hidden = false;
  $('#empty-' + key).hidden = true;
  $('#toggle-' + key).textContent = 'Hide ' + (key === 'story' ? 'Story' : 'Dashboard');
  mountViz(key);
  if (scroll) document.getElementById(key).scrollIntoView({ behavior: 'smooth' });
}
function hideViz(key) {
  $('#body-' + key).hidden = true;
  $('#empty-' + key).hidden = false;
  $('#toggle-' + key).textContent = 'Show ' + (key === 'story' ? 'Story' : 'Dashboard');
}
$$('[data-show]').forEach(function (b) { b.addEventListener('click', function () { showViz(b.dataset.show, true); }); });
$$('[data-toggle]').forEach(function (b) {
  b.addEventListener('click', function () {
    var k = b.dataset.toggle;
    $('#body-' + k).hidden ? showViz(k, false) : hideViz(k);
  });
});
$$('#nav a').forEach(function (a) {
  a.addEventListener('click', function () {
    var id = a.getAttribute('href').slice(1);
    if (id === 'dashboard' || id === 'story') showViz(id, false);
  });
});

/* ---------- Data-driven content ---------- */
function counter(el, to) {
  var t0 = null, suffix = el.dataset.suffix || '';
  function step(t) {
    t0 = t0 || t; var p = Math.min((t - t0) / 1400, 1);
    el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3)))) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
var hs = [[D.seasons, 'Seasons analysed'], [D.results, 'Race results'], [D.drivers, 'Drivers'], [D.teams, 'Constructors']];
$('#heroStats').innerHTML = hs.map(function (x) { return "<div class='h-stat'><b data-n='" + x[0] + "'>0</b><span>" + x[1] + '</span></div>'; }).join('');
setTimeout(function () { $$('#heroStats b').forEach(function (b) { counter(b, +b.dataset.n); }); }, 500);

var champs = D.champions || [];
$('#champGrid').innerHTML = champs.map(function (c) {
  return "<div class='champ reveal'><div class='yr'>" + c.season + "</div><div class='nm'>" + c.driver + "</div><div class='tm'>" + c.team +
    "</div><div class='st'>" + c.points + ' pts · ' + c.wins + ' wins</div></div>';
}).join('');

$('#driverGrid').innerHTML = (D.drivers_top || []).map(function (d, i) {
  return "<div class='driver reveal'><span class='rk'>" + (i + 1) + '</span><h4>' + d.driver + "</h4><div class='tm'>" + d.team +
    "</div><dl><div><dt>Titles</dt><dd>" + d.titles + '</dd></div><div><dt>Wins</dt><dd>' + d.wins + '</dd></div><div><dt>Podiums</dt><dd>' + d.podiums +
    '</dd></div><div><dt>Points</dt><dd>' + fmt(d.points) + '</dd></div></dl></div>';
}).join('');

function bars(el, rows) {
  var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }));
  $(el).innerHTML = rows.map(function (r) {
    return "<div class='bar-row'><span>" + r[0] + "</span><div class='t'><i data-w='" + (r[1] / max * 100) + "'></i></div><em>" + fmt(r[1]) + '</em></div>';
  }).join('');
}
bars('#teamBars', (D.team_points || []).map(function (t) { return [t.team, t.points]; }));
bars('#titleBars', Object.keys(D.team_titles || {}).map(function (k) { return [k, D.team_titles[k]]; }).sort(function (a, b) { return b[1] - a[1]; }));

var last = champs[champs.length - 1] || {};
var wins = (D.drivers_top || []).slice().sort(function (a, b) { return b.wins - a.wins; })[0] || {};
$('#tickerInner').innerHTML = [
  '<b>' + D.first + '–' + D.last + '</b> seasons covered', '<b>' + fmt(D.races) + '</b> Grand Prix analysed',
  '<b>' + wins.driver + '</b> leads on wins with <b>' + wins.wins + '</b>', '<b>' + last.season + '</b> champion: <b>' + last.driver + '</b>',
  '<b>' + D.wet + '</b> wet races', '<b>' + D.sc + '</b> races with a Safety Car'
].map(function (t) { return '<span>' + t + '</span>'; }).join('');

var facts = [
  ['1950', 'First World Championship', 'The Formula One World Championship began in 1950 at Silverstone, Great Britain.'],
  ['2 titles', 'Two championships', 'Drivers compete for the Drivers\' Championship while teams fight for the Constructors\' Championship.'],
  ['25 pts', 'Points for a win', 'Since 2019 the winner scores 25 points; the top ten finishers score points.'],
  ['350+ km/h', 'Extreme speeds', 'F1 cars can exceed 350 km/h on the fastest straights, and brake from that speed in a few seconds.'],
  ['~2 s', 'Lightning pit stops', 'A top team changes four tyres in roughly two seconds; the record is under 2 s.'],
  ['5 g+', 'Cornering forces', 'Drivers sustain forces of 5 g or more in high-speed corners and under braking.'],
  ['3 dry', 'Tyre compounds', 'Soft, Medium and Hard are used in the dry, plus Intermediate and Wet tyres for rain.'],
  ['DRS', 'Overtaking aid', 'The Drag Reduction System opens a rear-wing flap to help a following car pass on designated straights.'],
  ['SC / VSC', 'Safety Cars', 'Safety Car and Virtual Safety Car periods bunch up or slow the field and often reshape race strategy.']
];
$('#facts').innerHTML = facts.map(function (f) {
  return "<div class='fact reveal'><b>" + f[0] + '</b><h5>' + f[1] + '</h5><p>' + f[2] + '</p></div>';
}).join('');

/* ---------- UI behaviour ---------- */
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      $$('.t i', e.target).forEach(function (i) { i.style.width = i.dataset.w + '%'; });
      io.unobserve(e.target);
    }
  });
}, { threshold: .12 });
$$('.reveal').forEach(function (el) { io.observe(el); });

var secs = $$('main,section[id]');
function onScroll() {
  var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
  $('#progress').style.width = (h > 0 ? y / h * 100 : 0) + '%';
  $('#toTop').classList.toggle('show', y > 600);
  var cur = '';
  secs.forEach(function (s) { if (s.offsetTop - 120 <= y) cur = s.id; });
  $$('#nav a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();
$('#toTop').addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });
$('#burger').addEventListener('click', function () {
  var o = $('#nav').classList.toggle('open'); this.setAttribute('aria-expanded', o);
});
$$('#nav a').forEach(function (a) { a.addEventListener('click', function () { $('#nav').classList.remove('open'); }); });
addEventListener('load', function () { setTimeout(function () { $('#preloader').classList.add('done'); }, 700); });

$('#contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var f = e.target, subj = encodeURIComponent('F1 Race Intelligence — message from ' + f.name.value);
  var body = encodeURIComponent(f.message.value + '\n\n' + f.name.value + ' (' + f.email.value + ')');
  $('#formMsg').textContent = 'Opening your email app…';
  location.href = 'mailto:chaubeyrishabh05@gmail.com?subject=' + subj + '&body=' + body;
});

/* ---------- Particles ---------- */
(function () {
  var c = $('#particles'), x = c.getContext('2d'), P = [], W, H;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  function rs() { W = c.width = innerWidth; H = c.height = innerHeight; }
  rs(); addEventListener('resize', rs);
  for (var i = 0; i < 50; i++) P.push({ x: Math.random() * 2000, y: Math.random() * 1200, r: Math.random() * 1.6 + .4, v: Math.random() * .4 + .1 });
  (function draw() {
    x.clearRect(0, 0, W, H);
    P.forEach(function (p) {
      p.y -= p.v; if (p.y < 0) { p.y = H; p.x = Math.random() * W; }
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.3); x.fillStyle = 'rgba(225,6,0,.55)'; x.fill();
    });
    requestAnimationFrame(draw);
  })();
})();
