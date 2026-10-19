/* 7주 커스텀 — 3장 공간: 점선 하나가 공간 사진들 사이를 여행하듯 지나가다 3장 → 4장 즈음 화면 밖으로 빠져나감
   - 궤도는 학생이 화면 캡처에 직접 그린 선을 따른다(사진 밭 기준 비율 좌표 — 아래 UV). 사진 뒤로 지나감
   - 시작: 오른쪽 위 화면 밖 → 끝: 3장 아래, 4장 제목 위에서 왼쪽 화면 밖
   - 3장이 화면에 들어오면 저절로 처음부터 끝까지 부드럽게 그려진다(한 번 — 다른 등장 효과처럼). 선 모양은 my-style.css「3장 점선 길」
   - 점선 모양은 그대로 두고, 그려지는 효과는 같은 길의 마스크(실선)를 늘려서 낸다
   - 창 크기가 바뀌면 길을 다시 잰다. 동작 줄이기·움직임 0이면 처음부터 다 그려진 상태
   - 화면 장식이라 스크린리더는 읽지 않는다
   sig.js 뒤에 읽는다. */
(function () {
  var D = document, R = D.documentElement, NS = 'http://www.w3.org/2000/svg';
  /* 점들을 지나는 완만한 곡선 — centripetal Catmull-Rom(α = 0.5) → 3차 베지어. 점 간격이 고르지 않아도 꺾이거나 출렁이지 않음 */
  function smooth(p) {
    function dist(a, b) { return Math.max(1e-6, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1]))); }   /* 거리^0.5 */
    var d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      var d1 = dist(p0, p1), d2 = dist(p1, p2), d3 = dist(p2, p3);
      if (p0 === p1) d1 = d2; if (p3 === p2) d3 = d2;
      var c1 = [0, 1].map(function (k) { return (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) / (3 * d1 * (d1 + d2)); });
      var c2 = [0, 1].map(function (k) { return (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) / (3 * d3 * (d3 + d2)); });
      d += ' C' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }
  function start() {
    var sec = D.getElementById('s4'), field = sec && sec.querySelector('.ca-field');
    if (!field || sec.querySelector('.my-route')) return;
    var cells = Array.prototype.slice.call(field.querySelectorAll('.ca-cell'));
    if (cells.length < 3) return;
    var still = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || R.classList.contains('m0');

    var box = D.createElement('div'); box.className = 'my-route'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<svg><defs><mask id="my-route-m" maskUnits="userSpaceOnUse"><path class="my-route-reveal"/></mask></defs>'
      + '<path class="my-route-line" mask="url(#my-route-m)"/></svg>';
    sec.insertBefore(box, sec.firstChild);
    var svg = box.querySelector('svg'), line = box.querySelector('.my-route-line'), reveal = box.querySelector('.my-route-reveal'), len = 0;

    function layout() {
      /* 칸들은 등장 효과로 잠시 움직이므로(transform) 화면 위치 대신 3장 기준 원래 자리(offset)로 잰다 */
      var W = sec.offsetWidth, H = sec.offsetHeight;   /* 3장 아래로 더 내려가 화면 밖으로 빠지는 몫 */
      svg.setAttribute('width', W);
      /* 궤도 = 학생이 화면 캡처에 그려 준 선(2026-10-18). 사진 밭(.ca-field) 상자를 기준으로 한 비율(u = 가로, v = 세로)로 옮겨 두어 화면 폭이 바뀌어도 같은 모양.
         오른쪽 위 화면 밖 → 사진 밭 위를 왼쪽으로 크게 돌고 → 가운데를 가로질러 → 오른쪽에서 작은 고리 → 아래로 크게 휘어 → 왼쪽 화면 밖(4장 제목 위) */
      var fl = field.offsetLeft, ft = field.offsetTop, fw = field.offsetWidth, fh = field.offsetHeight;
      /* 손으로 그린 선을 그대로 따르면 삐뚤빼뚤해서, 모양을 지키는 꼭 필요한 점만 남김(학생 요청 — 일정하고 완만하게) */
      var UV = [[.70, -.10], [.30, -.20], [-.06, -.04], [-.15, .27], [-.05, .53], [.24, .45], [.44, .53],
        'LOOP', [.79, .645], [.86, .705], [.898, .80], [.903, .88], [.89, .96],   /* 고리 뒤 — 오른쪽으로 둥글게 부풀었다가 아래로(학생 그림) */ [.80, 1.24], [.50, 1.30], [.15, 1.22], [-.15, 1.33], [-.40, 1.60]];
      /* 사진 밭 아래(v > 1)는 비율 대신 '사진 밭 아래끝 ~ 4장 제목 위 80px' 사이에 눌러 담는다 → 화면이 넓어도 4장 제목을 넘지 않음 */
      var next = sec.nextElementSibling, lab = next && next.querySelector('.ca-label');
      var limit = lab ? (next.offsetTop - sec.offsetTop) + lab.offsetTop - 80 : ft + 1.6 * fh;
      var fb = ft + fh, below = Math.max(40, limit - fb), VMAX = .608;
      function y(v) { return v <= 1 ? ft + v * fh : fb + (v - 1) / VMAX * below; }
      /* 작은 고리 — 실제 픽셀로 동그란 원(반지름 r)을 8점으로: 위에서 오른쪽으로 미끄러져 들어가 시계 방향 한 바퀴 → 다시 위에서 오른쪽으로 빠져나감 */
      var cx = fl + .70 * fw, cy = y(.70), r = Math.max(20, Math.min(fw, fh) * .055)   /* 고리 반지름 — 사진 밭 짧은 변의 5.5%(처음 11% → 학생 요청으로 반) */, loop = [];
      loop.push([cx - 1.8 * r, cy - r]);   /* 고리 위끝과 같은 높이에서 가로로 미끄러져 들어감 */
      for (var k = 0; k <= 8; k++) { var t = -Math.PI / 2 + k / 8 * Math.PI * 2; loop.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
      /* 빠져나갈 때는 고리 위끝 높이에서 가로로 — 바로 다음 점(UV [.79, .645])이 같은 높이에서 받아 오른쪽으로 둥글게 내려감 */
      var pts = [[W + 40, ft - .5 * fh]];   /* 출발 — 오른쪽 위 화면 밖, 조금 더 위에서 */
      UV.forEach(function (q) { if (q === 'LOOP') pts = pts.concat(loop); else pts.push([fl + q[0] * fw, y(q[1])]); });
      pts.push([-40, y(1.551)]);
      var maxY = Math.max.apply(null, pts.map(function (q) { return q[1]; })) + 40;
      svg.setAttribute('height', Math.max(H, maxY)); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Math.max(H, maxY));
      var d = smooth(pts);
      line.setAttribute('d', d); reveal.setAttribute('d', d);
      len = line.getTotalLength();
      reveal.style.strokeDasharray = len + ' ' + len;
      if (!box.classList.contains('is-drawn')) reveal.style.strokeDashoffset = still ? 0 : len;
    }
    layout();
    var t = 0; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(layout, 150); });
    addEventListener('load', layout);

    if (still || !('IntersectionObserver' in window)) { box.classList.add('is-drawn'); reveal.style.strokeDashoffset = 0; return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return;
        io.disconnect();
        layout();
        setTimeout(function () { box.classList.add('is-drawn'); reveal.style.strokeDashoffset = 0; }, 30);   /* 시작 자리를 먼저 그린 뒤 늘리기 */
      });
    }, { rootMargin: '0px 0px -25% 0px' });
    io.observe(field);
  }
  /* sig.js 가 사진 밭(.ca-field)을 만든 뒤에 */
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
