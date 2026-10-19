/* 7주 커스텀 — 사진이 화면에 들어오면 하나씩 나타남
   - 1장 시선(#s2 .ca-fig) = 서서히 나타남(페이드인, .my-fade) · 왼쪽부터 0.15초씩 늦게
   - 2장 사람(#s3 .ca-fig) · 3장 공간(#s4 .ca-cell) = 아래에서 톡 튀어 올라옴(.my-pop) · 2장 0.12초 · 3장 0.06초씩 늦게
   - 시간·모양 = my-style.css(--my-fade-time · .my-pop)
   - --my-motion: 0(html.m0) 이거나 기기 '동작 줄이기'면 처음부터 다 보인다
   sig.js 뒤에 읽는다. */
(function () {
  var D = document, R = D.documentElement;
  function watch(sel, cls, step) {
    var figs = Array.prototype.slice.call(D.querySelectorAll(sel));
    if (!figs.length) return;
    figs.forEach(function (f) { f.classList.add(cls); });
    var io = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return;   /* 메뉴로 건너뛰어 이미 지나간 것도 보이게 */
        var f = e.target, img = f.querySelector('img');
        io.unobserve(f);
        var show = function () { setTimeout(function () { f.classList.add('my-in'); }, k++ * step); };
        if (!img || (img.complete && img.naturalWidth)) show();
        else { img.addEventListener('load', show, { once: true }); img.addEventListener('error', show, { once: true }); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    figs.forEach(function (f) { io.observe(f); });
  }
  function start() {
    if (!('IntersectionObserver' in window)) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || R.classList.contains('m0')) return;
    watch('#s2 .ca-fig', 'my-fade', 150);
    watch('#s3 .ca-fig', 'my-pop', 120);
    watch('#s4 .ca-cell', 'my-pop', 60);   /* 3장은 흩뿌린 칸(.ca-cell) 15개 */
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
