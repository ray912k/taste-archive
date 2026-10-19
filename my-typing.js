/* 7주 커스텀 — 첫 화면 관점 한 문장(h1)이 타자기로 치듯 한 글자씩 나타남 (6주 my-typing.js를 카드형에 맞춰 옮김)
   - 글자를 하나씩 감싸 두고 보이게만 바꾼다 → 문장 자리·줄바꿈·sig.js 글자 크기 맞춤은 처음부터 그대로(화면 밀림 0)
   - sig.js 가 h1 안을 .ca-h1-in 으로 한 번 감싸므로, 안쪽 글자 노드까지 찾아 감싼다
   - 속도 = my-style.css 의 --my-type-speed(한 글자) · --my-type-delay(시작 전 기다림)
   - --my-motion: 0(html.m0) 이거나 기기 '동작 줄이기'면 문장을 바로 다 보여 준다
   - 스크린리더는 h1 aria-label 로 완성 문장을 바로 읽는다
   sig.js 뒤에 읽는다. */
(function () {
  var D = document, R = D.documentElement;
  function ms(v, d) { v = (v || '').trim(); var n = parseFloat(v); if (isNaN(n)) return d; return /ms$/.test(v) ? n : n * 1000; }

  function start() {
    var h1 = D.querySelector('.my-tw');
    if (!h1) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || R.classList.contains('m0')) return;

    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    var texts = [], w = D.createTreeWalker(h1, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode()) texts.push(w.currentNode);
    var cs = [];
    texts.forEach(function (node) {
      var frag = D.createDocumentFragment();
      Array.prototype.forEach.call(node.nodeValue, function (ch) {
        if (/\s/.test(ch)) { frag.appendChild(D.createTextNode(ch)); return; }
        var s = D.createElement('span');
        s.className = 'my-tw-c';
        s.setAttribute('aria-hidden', 'true');
        s.textContent = ch;
        frag.appendChild(s);
        cs.push(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    if (!cs.length) return;

    var CS = getComputedStyle(R);
    var SPEED = ms(CS.getPropertyValue('--my-type-speed'), 75);
    var DELAY = ms(CS.getPropertyValue('--my-type-delay'), 600);
    var i = 0;
    cs[0].classList.add('my-tw-pre');   /* 시작 전: 첫 글자 앞에서 커서가 깜빡임 */

    function step() {
      if (i === 0) cs[0].classList.remove('my-tw-pre');
      if (i > 0) cs[i - 1].classList.remove('my-tw-cur');
      cs[i].classList.add('on', 'my-tw-cur');
      i++;
      if (i < cs.length) setTimeout(step, cs[i].previousSibling && cs[i].previousSibling.nodeType !== 1 ? SPEED * 1.6 : SPEED);   /* 띄어쓰기 뒤는 조금 쉬었다 */
      else h1.classList.add('my-tw-done');   /* 다 치면 커서는 끝에서 계속 깜빡임 */
    }
    setTimeout(step, DELAY);
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
