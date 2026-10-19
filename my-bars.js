/* 7주 커스텀 — 위 메뉴 바 · 아래 ©2026 바가 첫 화면 사진 위에 있는지 재서 .my-on-hero 를 붙였다 뗀다(흰 글자)
   - 위 바: 사진 아래 끝이 바 아래 끝보다 아래면 사진 위
   - 아래 바: 사진 아래 끝이 바 위 끝보다 아래면 사진 위
   - 상세 화면이 열려 있으면(html.ca-lock) 사진 위가 아님
   - 어두운 장(.my-dark) 위를 지나면 .my-on-dark 를 붙인다(밝은 글자)
   색 규칙은 my-style.css. sig.js 뒤에 읽는다. */
(function () {
  var D = document, R = D.documentElement;
  function start() {
    var hero = D.querySelector('.ca-top--hero'), top = D.querySelector('.ca-gnb'), bot = D.querySelector('.ca-bar-b');
    var darks = Array.prototype.slice.call(D.querySelectorAll('.my-dark, .my-foot'));   /* 어두운 2장 · 어두운 푸터(기준이 쌓이는 자리) */
    if (!hero && !darks.length) return;
    function check() {
      var hb = hero ? hero.getBoundingClientRect().bottom : -1, lock = R.classList.contains('ca-lock');
      if (top) top.classList.toggle('my-on-hero', !lock && hb >= top.getBoundingClientRect().bottom);
      if (bot) bot.classList.toggle('my-on-hero', !lock && hb > bot.getBoundingClientRect().top);
      /* 어두운 장(.my-dark) 위면 .my-on-dark — 바 가운데 높이가 그 장 안에 있을 때 */
      [top, bot].forEach(function (b) {
        if (!b) return;
        var r = b.getBoundingClientRect(), mid = (r.top + r.bottom) / 2;
        b.classList.toggle('my-on-dark', !lock && darks.some(function (d) { var q = d.getBoundingClientRect(); return !d.classList.contains('is-lit') && q.top <= mid && q.bottom >= mid; }));
      });
    }
    var tick = false;
    function req() { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; check(); }); } }
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    new MutationObserver(req).observe(R, { attributes: true, attributeFilter: ['class'] });
    check();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
