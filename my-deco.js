/* 7주 커스텀 — 1장 시선 사진 뒤 꾸미기 종이
   배치 = 학생 첨부 스케치(종이가 사진 뒤로 겹쳐 문구 쪽으로 펼쳐짐 · 사진 귀퉁이 클립)
   질감 = 학생 첨부 종이 사진(오트밀 손찢은 종이 · 구멍 난 세이지 종이 · 크림 메모지 · 마스킹테이프) — 이미지는 쓰지 않고 CSS로 그린다
   - 종이마다 바깥 .my-pc(자리·움직임·그림자) 안에 .my-pp(종이 면)를 넣는다. 찢긴 가장자리는 .my-pp 에만 잘라서 그림자가 살아 있게
   - 문구 칸 폭(--my-note-w)은 세 문구 중 가장 긴 줄에 맞춰 같은 폭으로 정한다 → 종이도 그 폭만큼 문구 쪽으로 뻗는다
   - 맨 오른쪽 카드는 좌우를 뒤집는다(문구가 화면 밖으로 나가지 않게)
   - 문구 아래에 More(상세 열기)를 옮겨 붙인다
   - 화면 장식이라 스크린리더는 읽지 않는다(aria-hidden). 폰·호버 없는 기기에선 숨김
   sig.js 뒤에 읽는다. */
(function () {
  var D = document;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  /* 찢은 가장자리 — sides: 찢을 변(t 위 · r 오른쪽 · b 아래 · l 왼쪽), j: 찢김 깊이(%), n: 한 변의 점 수(많을수록 잘게) */
  function torn(j, sides, n) {
    var p = [], i;
    function o(side) { return sides.indexOf(side) > -1 ? rnd(0, j) : 0; }
    for (i = 0; i <= n; i++) p.push((i / n * 100) + '% ' + o('t') + '%');
    for (i = 1; i <= n; i++) p.push((100 - o('r')) + '% ' + (i / n * 100) + '%');
    for (i = n - 1; i >= 0; i--) p.push((i / n * 100) + '% ' + (100 - o('b')) + '%');
    for (i = n - 1; i >= 1; i--) p.push(o('l') + '% ' + (i / n * 100) + '%');
    return 'polygon(' + p.join(',') + ')';
  }
  var CLIP = '<svg viewBox="0 0 30 80" aria-hidden="true"><defs><linearGradient id="my-clip-g" x1="0" x2="1"><stop offset="0" stop-color="#9C9893"/><stop offset=".5" stop-color="#D8D5D0"/><stop offset="1" stop-color="#8E8A85"/></linearGradient></defs>'
    + '<path d="M11 22 V58 a6.5 6.5 0 0 0 13 0 V14 a9.5 9.5 0 0 0 -19 0 V60 a12 12 0 0 0 24 0 V26" fill="none" stroke="url(#my-clip-g)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var NOTE = 'var(--my-s2-gap) + var(--my-note-w)';   /* 사진 오른쪽 끝에서 문구 칸 끝까지 */
  /* 자리(사진 상자 기준 — 사진 폭 100%) · 기울기 · 늦게 시작 · 찢김 */
  var BACK = [
    { k: 'oat',   l: '-4%',  t: '12%', w: 'calc(104% + ' + NOTE + ' + 40px)', h: '96%', r: -2,   d: 0,   j: 1.1, s: 'trbl', n: 70 },
    { k: 'sage',  l: '-9%',  t: '3%',  w: '118%',                              h: '92%', r: -3.5, d: 90,  j: 0,   s: '',     n: 0 },
    { k: 'cream', l: '12%',  t: '-2%', w: 'calc(88% + ' + NOTE + ' + 28px)',  h: '64%', r: -2,   d: 180, j: 0,   s: '',     n: 0 }
  ];
  var TOP = [
    { k: 'tape',  l: 'calc(100% + var(--my-s2-gap) + var(--my-note-w) * .55)', t: '-5%', w: '96px', h: '28px', r: 5, d: 330, j: 7, s: 'lr', n: 10 },
    { k: 'clip',  l: '4%',   t: '-9%', w: '13%', h: '26%', r: -32, d: 380, j: 0, s: '', n: 0 }
  ];
  function layer(list, top, flip) {
    var box = D.createElement('div');
    box.className = 'my-deco' + (top ? ' is-top' : '');
    box.setAttribute('aria-hidden', 'true');
    list.forEach(function (o) {
      var s = D.createElement('span'), left = flip ? 'calc(100% - (' + o.l + ') - (' + o.w + '))' : o.l;
      s.className = 'my-pc ' + o.k;
      s.style.cssText = 'left:' + left + ';top:' + o.t + ';width:' + o.w + ';height:' + o.h + ';--r:' + (flip ? -o.r : o.r) + 'deg;--d:' + o.d + 'ms' + (flip ? ';--o:92%' : '');
      if (o.k === 'clip') { s.innerHTML = CLIP; if (flip) s.firstChild.style.transform = 'scaleX(-1)'; }
      else { var pp = D.createElement('i'); pp.className = 'my-pp'; if (o.j) pp.style.clipPath = torn(o.j, o.s, o.n); s.appendChild(pp); }
      box.appendChild(s);
    });
    return box;
  }
  /* 문구 칸 폭 = 세 문구 중 가장 긴 줄(줄은 <br>에서만 바뀜) */
  function noteW() {
    var s2 = D.getElementById('s2'); if (!s2) return;
    var max = 0;
    Array.prototype.forEach.call(s2.querySelectorAll('.my-quote'), function (q) {
      var old = q.style.width; q.style.width = 'max-content';
      max = Math.max(max, q.getBoundingClientRect().width);
      q.style.width = old;
    });
    if (max) s2.style.setProperty('--my-note-w', Math.ceil(max + 8) + 'px');
  }
  function start() {
    var cards = Array.prototype.slice.call(D.querySelectorAll('#s2 .ca-card'));
    cards.forEach(function (c, i) {
      var f = c.querySelector('.ca-figs'); if (!f || f.querySelector('.my-deco')) return;
      var flip = i === cards.length - 1 && cards.length > 1;
      /* 문구와 More(sig.js 가 만든 상세 열기 버튼)를 한 묶음(.my-note)으로 — More 는 카드 안에 그대로 있어 누르면 상세가 열린다 */
      var q = c.querySelector('.my-quote'), more = c.querySelector('.ca-more');
      if (q && !q.parentNode.classList.contains('my-note')) {
        var note = D.createElement('div'); note.className = 'my-note';
        q.parentNode.insertBefore(note, q); note.appendChild(q);
        if (more) note.appendChild(more);
      }
      f.insertBefore(layer(BACK, false, flip), f.firstChild);
      f.appendChild(layer(TOP, true, flip));
    });
    noteW();
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(noteW);
    addEventListener('resize', noteW);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
