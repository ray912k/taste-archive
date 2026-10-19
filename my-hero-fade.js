/* 7주 커스텀 — 첫 화면 공간 사진 15장을 무작위 순서로 fade out · fade in (6주 my-hero-fade.js를 카드형에 맞춰 옮김)
   - 순서 = 페이지를 열 때마다 15장 전부 섞음. 첫 장도 무작위(섞인 첫 장이 다 불러와지면 바로 바꿈)
   - 한 장 머무는 시간·전환 시간 = my-style.css 의 --my-hero-stay · --my-hero-fade
   - 큰 사진을 한꺼번에 부르지 않는다: 지금 사진이 보이는 동안 다음 한 장만 미리 불러온다
   - --my-motion: 0(html.m0) 이거나 기기 '동작 줄이기'면 첫 장에 멈춘다
   sig.js 뒤에 읽는다. */
(function () {
  var D = document, R = D.documentElement;
  function sec(v, d) { v = (v || '').trim(); var n = parseFloat(v); if (isNaN(n)) return d; return /ms$/.test(v) ? n : n * 1000; }

  function start() {
    var fig = D.querySelector('.my-hf');
    if (!fig) return;
    var imgs = Array.prototype.slice.call(fig.querySelectorAll('img'));
    if (imgs.length < 2) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || R.classList.contains('m0')) return;   /* 첫 장에 멈춤 */

    var CS = getComputedStyle(R);
    var STAY = sec(CS.getPropertyValue('--my-hero-stay'), 3000);
    var FADE = sec(CS.getPropertyValue('--my-hero-fade'), 1200);
    var shown = imgs[0];   /* HTML에서 먼저 보이는 장 */
    for (var i = imgs.length - 1; i > 0; i--) {   /* 15장 전부 섞기 */
      var j = Math.floor(Math.random() * (i + 1)), t = imgs[i]; imgs[i] = imgs[j]; imgs[j] = t;
    }

    function load(im) {   /* data-src → src (한 장만) */
      var s = im.getAttribute('data-src');
      if (s && !im.getAttribute('src')) { im.setAttribute('src', s); im.removeAttribute('data-src'); }
    }
    function ready(im) { return im.complete && im.naturalWidth > 0; }
    function whenReady(im, ok, bad) {
      if (ready(im)) { ok(); return; }
      var done = function () { off(); ok(); }, fail = function () { off(); bad(); };
      function off() { im.removeEventListener('load', done); im.removeEventListener('error', fail); }
      im.addEventListener('load', done); im.addEventListener('error', fail);
    }

    var at = 0;
    function next() {
      var n = (at + 1) % imgs.length, im = imgs[n];
      load(im);
      whenReady(im, function () {
        fig.classList.add('is-run');   /* 첫 전환부터 --my-hero-fade 시간으로 */
        imgs[at].classList.remove('is-cur');
        im.classList.add('is-cur');
        at = n;
        load(imgs[(at + 1) % imgs.length]);   /* 그다음 한 장만 미리 */
        setTimeout(next, STAY + FADE);
      }, function () {   /* 못 불러온 사진은 빼고 계속 */
        imgs.splice(n, 1); if (n < at) at--;
        if (imgs.length > 1) next();
      });
    }

    /* 섞인 첫 장으로 시작 — 다 불러온 뒤 전환 없이 바꾼다(빈 화면 0) */
    load(imgs[0]);
    whenReady(imgs[0], function () {
      if (imgs[0] !== shown) { shown.classList.remove('is-cur'); imgs[0].classList.add('is-cur'); }
      load(imgs[1]);
      setTimeout(next, STAY);
    }, function () {
      imgs.splice(0, 1);
      if (imgs.indexOf(shown) > 0) { imgs.splice(imgs.indexOf(shown), 1); imgs.unshift(shown); }
      if (imgs.length > 1) { load(imgs[1]); setTimeout(next, STAY); }
    });
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
