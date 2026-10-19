/* 7주 커스텀 — 어두운 장(.my-dark, 지금은 2장) 위·아래 경계를 손으로 찢은 종이처럼(학생 첨부 레퍼런스)
   - 모눈종이가 어두운 종이 위에 놓여 찢긴 모양: 모눈종이 가장자리를 따라 흰 섬유가 드러나고(폭이 들쭉날쭉한 흰 띠), 보풀이 일며, 그 아래 어두운 종이 위로 그림자가 진다
   - 모양: 큰 물결 → 작은 굴곡 → 잔 떨림을 겹친 부드러운 노이즈(지그재그 아님). 보풀은 SVG 변위 필터(feDisplacementMap)
   - 실제 화면 폭에 맞춰 그려 늘어나지 않게 하고, 창 크기가 바뀌면 같은 모양(같은 씨앗)으로 다시 그린다
   - 아래 경계는 찢지 않는다. 대신 스크롤해서 다음 장으로 넘어가면 어두운 바탕이 사라지며 모눈종이로 바뀐다(.is-lit — my-style.css). 색 · 높이 = my-style.css 의 --my-dark · --my-tear-paper · --my-tear-h
   - 화면 장식이라 스크린리더는 읽지 않는다
   sig.js 뒤에 읽는다. */
(function () {
  var D = document, NS = 'http://www.w3.org/2000/svg', uid = 0;
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  /* 1차원 값 노이즈(코사인 보간) — 간격 s 마다 무작위 값, 사이는 부드럽게 */
  function noise(r, len, s) {
    var n = Math.ceil(len / s) + 2, v = [];
    for (var i = 0; i < n; i++) v.push(r() * 2 - 1);
    return function (x) { var p = x / s, i = Math.floor(p), f = (1 - Math.cos((p - i) * Math.PI)) / 2; return v[i] * (1 - f) + v[i + 1] * f; };
  }
  function draw(box) {
    var W = Math.max(320, Math.round(box.clientWidth)), H = Math.max(20, Math.round(box.clientHeight)), r = rng(+box.dataset.seed);
    /* 경계선 = 큰 물결 + 굴곡 + 잔 떨림 */
    var o = [[220, H * .16], [70, H * .07], [22, H * .03], [6, H * .012]].map(function (a) { return { f: noise(r, W, a[0]), a: a[1] }; });
    var band = noise(r, W, 90), band2 = noise(r, W, 17);
    /* 겹 순서(위 경계 기준): 위쪽 = 모눈종이(비워 둠 — 페이지가 그대로 보임) / 찢긴 흰 섬유 띠 / 그 아래 어두운 종이.
       모눈종이가 어두운 종이 위에 놓인 것이라 그림자는 흰 띠 아래, 어두운 쪽으로 진다 */
    var base = H * .5, top = [], low = [];
    for (var x = 0; x <= W; x += 2) {
      var y = base; o.forEach(function (k) { y += k.f(x) * k.a; });
      var b = H * .05 + H * .11 * (band(x) * .5 + .5) + H * .025 * band2(x);   /* 흰 섬유 띠 폭 */
      top.push([x, y - Math.max(1.2, b)]); low.push([x, y]);
    }
    function line(pts) { return pts.map(function (p) { return p[0] + ',' + p[1].toFixed(2); }).join(' L'); }
    var dk = 'M0,' + H + ' L' + line(low.map(function (p) { return [p[0], p[1] - 1.5]; })) + ' L' + W + ',' + H + ' Z';   /* 흰 띠 밑으로 1.5px 겹쳐 틈이 안 보이게 */
    var rim = 'M' + line(top) + ' L' + line(low.slice().reverse()) + ' Z';
    var sheet = 'M0,0 L' + line(low) + ' L' + W + ',0 Z';   /* 그림자를 드리우는 위쪽 종이(흰 띠까지) */
    var id = box.dataset.uid, svg = box.querySelector('svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML =
      '<defs>'
      + '<clipPath id="tc' + id + '"><path d="' + dk + '"/></clipPath>'
      + '<filter id="ts' + id + '" x="-2%" y="-20%" width="104%" height="160%">'
      +   '<feGaussianBlur in="SourceAlpha" stdDeviation="2.6"/><feOffset dy="3.5" result="o"/>'
      +   '<feFlood flood-color="#140B08" flood-opacity=".55"/><feComposite in2="o" operator="in"/>'
      + '</filter>'
      + '<filter id="tw' + id + '" x="-2%" y="-60%" width="104%" height="220%">'
      +   '<feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="' + id + '" result="n"/>'
      +   '<feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G"/>'
      + '</filter>'
      + '</defs>'
      + '<path class="my-tear-dark" d="' + dk + '"/>'
      + '<g clip-path="url(#tc' + id + ')"><path filter="url(#ts' + id + ')" d="' + sheet + '"/></g>'
      + '<path class="my-tear-paper" filter="url(#tw' + id + ')" d="' + rim + '"/>';
  }
  function tear(where) {
    var box = D.createElement('div');
    box.className = 'my-tear is-' + where; box.setAttribute('aria-hidden', 'true');
    box.dataset.uid = ++uid; box.dataset.seed = Math.floor(Math.random() * 1e9);
    var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('preserveAspectRatio', 'none');
    box.appendChild(svg);
    return box;
  }
  function start() {
    var boxes = [];
    Array.prototype.forEach.call(D.querySelectorAll('.my-dark'), function (s) {
      if (s.querySelector(':scope > .my-tear')) return;
      var a = tear('top');   /* 아래 경계는 찢김 대신 그라데이션(my-style.css .my-dark::after) — 2026-10-18 학생 요청 */
      s.insertBefore(a, s.firstChild); boxes.push(a);
    });
    function all() { boxes.forEach(draw); }
    all();
    /* 스크롤 색 바꾸기 — 어두운 장 아래끝이 화면 위에서 30% 위로 올라가면 .is-lit (처음 55% → 학생 요청으로 더 늦게) */
    var darks = Array.prototype.slice.call(D.querySelectorAll('.my-dark'));
    function lit() { darks.forEach(function (s) { s.classList.toggle('is-lit', s.getBoundingClientRect().bottom < innerHeight * .3); }); }
    addEventListener('scroll', lit, { passive: true });   /* 장 하나 재기라 매번 바로 해도 가볍다 */
    addEventListener('resize', lit);
    lit();
    var t = 0; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(all, 150); });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
