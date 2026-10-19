/* 7주 커스텀 — 장 제목('1장 시선' 등)과 제목 아래 문장(.ca-lead)이 화면에 들어오면 한 글자씩 물결치듯 떠오르며 나타남
   - 글자마다 span 으로 감싸고 --i(순서)를 준다. 간격 = my-style.css 의 --my-wave-step
   - 문장은 같은 장 제목이 다 나온 뒤 시작(--base) · 간격 = --my-wave-step-lead
   - 스크린리더는 aria-label 로 제목·문장을 한 번에 읽는다
   - --my-motion: 0(html.m0) 이거나 기기 '동작 줄이기'면 감싸지 않는다(그대로 보임)
   sig.js 뒤에 읽는다. */
(function () {
  var D = document, R = D.documentElement;
  function start() {
    var labs = Array.prototype.slice.call(D.querySelectorAll('.ca-sec .ca-label, .ca-sec .ca-lead'));
    if (!labs.length || !('IntersectionObserver' in window)) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || R.classList.contains('m0')) return;

    labs.forEach(function (h) {
      var text = h.textContent;
      h.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
      h.textContent = '';
      var i = 0;
      if (h.classList.contains('ca-lead')) {   /* 같은 장 제목 글자 수 × 제목 간격만큼 늦게 시작 */
        var lab = h.closest('.ca-head') && h.closest('.ca-head').querySelector('.ca-label');
        var n = lab ? lab.textContent.replace(/\s/g, '').length : 0;
        h.style.setProperty('--base', 'calc(' + n + ' * var(--my-wave-step))');
      }
      Array.prototype.forEach.call(text, function (ch) {
        if (/\s/.test(ch)) { h.appendChild(D.createTextNode(ch)); return; }
        var s = D.createElement('span');
        s.className = 'my-wv-c';
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', i++);
        s.textContent = ch;
        h.appendChild(s);
      });
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.bottom < 0) { e.target.classList.add('my-wave-on'); io.unobserve(e.target); } });   /* 메뉴로 건너뛰어 이미 지나간 것도 보이게 */
    }, { rootMargin: '0px 0px -10% 0px' });
    labs.forEach(function (h) { io.observe(h); });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
