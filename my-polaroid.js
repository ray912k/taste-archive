/* 7주 커스텀 — 4장 물건: 노트 위 폴라로이드 넘기기(커버플로 대신)
   - 카드마다 첫 사진을 흰 테두리 폴라로이드로 만들고(아래 흰 칸에 물건 이름), 가운데 한 장은 크게 · 양옆 한 장씩은 작게 뒤에 겹쳐 기울임
   - 3.5초마다 앞 사진이 옆으로 밀려나고 다음 사진이 앞으로(마우스를 올리거나 키보드 초점이 있거나 다른 탭을 보면 멈춤)
   - ← → 버튼 · "02 / 05" · 옆 사진 누르면 그쪽으로 · 가운데 사진 누르면 상세(원래 카드로 — sig.js)
   - 사진 아래 노트 가로줄(32px) 위에 언제·어떻게(.ca-when)를 적는다 · 왼쪽 칸(제목 아래)에 물건 목록(번호 · 이름 · 고른 이유, 지금 물건 진하게, 누르면 이동)
   - 사진에 마우스를 올리면 그 물건의 두 번째 사진으로 바뀐다
   - 폴라로이드는 줄노트 한 장(.my-note-sheet — 클립으로 끼운 모양)에 담아 화면 오른쪽에, 장 제목은 페이지 위 원래 자리
   - 노트가 화면에 들어오면 저절로 떠오르고, 이어서 클립이 내려와 노트를 끼운다(.is-in — 한 번)
   - 원래 카드 줄(.ca-track · 번호 목록)은 화면에서만 숨긴다. 모양은 my-style.css「4장 폴라로이드」
   - --my-motion: 0(html.m0) 이거나 기기 '동작 줄이기'면 자동 넘김 없음
   sig.js 뒤에 읽는다. */
(function () {
  var D = document, R = D.documentElement;
  var TILT = [-2.2, 1.6, -1.2, 2.4, -1.8, 1.2];   /* 사진마다 조금씩 다른 기울기(도) */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function start() {
    var sec = D.getElementById('s5'); if (!sec || sec.querySelector('.my-pl')) return;
    var items = Array.prototype.slice.call(sec.querySelectorAll('.ca-track .ca-card')).map(function (c) {
      var imgs = c.querySelectorAll('.ca-fig img'), img = imgs[0], img2 = imgs[1];
      return { card: c, src: img && img.getAttribute('src'), alt: img ? img.alt : '', src2: img2 && img2.getAttribute('src'), alt2: img2 ? img2.alt : '',
        name: ((c.querySelector('.ca-name') || {}).textContent || '').trim(), when: ((c.querySelector('.ca-when') || {}).textContent || '').trim(), why: ((c.querySelector('.ca-why') || {}).textContent || '').trim() };
    }).filter(function (o) { return o.src; });
    if (items.length < 2) return;
    var N = items.length, at = 0, timer = 0, paused = false;

    var box = D.createElement('div'); box.className = 'my-pl';
    box.innerHTML = '<div class="my-pl-stage" role="list"></div>'
      + '<p class="my-pl-when" aria-live="polite"><span class="my-pl-why"></span></p>'
      + '<div class="my-pl-nav"><button type="button" class="my-pl-btn" data-go="-1" aria-label="이전 물건">←</button>'
      + '<span class="my-pl-count"></span>'
      + '<button type="button" class="my-pl-btn" data-go="1" aria-label="다음 물건">→</button></div>';
    var stage = box.querySelector('.my-pl-stage');
    var els = items.map(function (o, i) {
      var b = D.createElement('button'); b.type = 'button'; b.className = 'my-pl-item'; b.setAttribute('role', 'listitem');
      b.setAttribute('aria-label', o.name + ' — 자세히');
      b.style.setProperty('--tilt', TILT[i % TILT.length] + 'deg');
      b.innerHTML = '<span class="my-pl-tape" aria-hidden="true"></span><span class="my-pl-pic"><img src="' + o.src + '" alt="">'
        + (o.src2 ? '<img class="my-pl-img2" src="' + o.src2 + '" alt="" loading="lazy">' : '') + '</span><span class="my-pl-name"></span>';
      var im = b.querySelectorAll('img'); im[0].alt = o.alt; if (im[1]) im[1].alt = o.alt2;   /* 마우스를 올리면 두 번째 사진(my-style.css) */
      b.querySelector('.my-pl-name').textContent = o.name;
      b.addEventListener('click', function () {
        if (i === at) { var open = o.card.querySelector('.ca-open'); if (open) open.click(); }
        else go(i);
      });
      stage.appendChild(b); return b;
    });
    /* 줄노트 한 장(.my-note-sheet) 안에 폴라로이드를 넣어 제목 오른쪽에 둔다 — 제목은 다른 장처럼 페이지 위 원래 자리 */
    var sheet = D.createElement('div'); sheet.className = 'my-note-sheet';
    sheet.appendChild(box);
    var head = sec.querySelector('.ca-head');
    head.parentNode.insertBefore(sheet, head.nextSibling);
    sec.classList.add('has-pl');

    /* 왼쪽 칸(제목 아래) 물건 목록 — 번호 · 이름 · 언제·어떻게. 지금 앞에 나온 물건은 진하게, 누르면 그 사진으로 */
    var list = D.createElement('ol'); list.className = 'my-pl-list';
    var lis = items.map(function (o, i) {
      var li = D.createElement('li'), b = D.createElement('button');
      b.type = 'button'; b.innerHTML = '<span class="my-pl-no"></span><span class="my-pl-li"><b></b><small></small></span>';
      b.querySelector('.my-pl-no').textContent = pad(i + 1); b.querySelector('b').textContent = o.name; b.querySelector('small').textContent = o.why;   /* 목록 = 고른 이유 */
      b.addEventListener('click', function () { go(i); });
      b.addEventListener('mouseenter', function () { paused = true; }); b.addEventListener('mouseleave', function () { paused = false; });
      li.appendChild(b); list.appendChild(li); return li;
    });
    head.appendChild(list);

    /* 한 줄 설명을 노트 가로줄(32px 간격) 위에 놓기 — 노트 위끝에서 설명 위끝까지를 32의 배수로 */
    var when = box.querySelector('.my-pl-when');
    function snap() {
      when.style.marginTop = '';
      var off = when.getBoundingClientRect().top - sheet.getBoundingClientRect().top;
      when.style.marginTop = (parseFloat(getComputedStyle(when).marginTop) + ((32 - off % 32) % 32) + 6) + 'px';   /* +6 = 32px 줄 안에서 글자 밑선이 가로줄 바로 위에 앉는 자리 */
    }
    function render() {
      els.forEach(function (el, i) {
        var d = i - at; if (d > N / 2) d -= N; if (d < -N / 2) d += N;
        el.dataset.d = Math.abs(d) > 1 ? 'far' : d;
        el.tabIndex = Math.abs(d) > 1 ? -1 : 0;
      });
      when.querySelector('.my-pl-why').textContent = items[at].when;   /* 노트 가로줄 위 — 언제·어떻게 */
      lis.forEach(function (li, i) { li.classList.toggle('is-on', i === at); li.firstChild.setAttribute('aria-current', i === at ? 'true' : 'false'); });
      box.querySelector('.my-pl-count').textContent = pad(at + 1) + ' / ' + pad(N);
    }
    function go(i) { at = (i + N) % N; render(); }
    Array.prototype.forEach.call(box.querySelectorAll('.my-pl-btn'), function (b) { b.addEventListener('click', function () { go(at + +b.dataset.go); }); });

    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tick() { clearTimeout(timer); if (reduce || R.classList.contains('m0')) return; timer = setTimeout(function () { if (!paused && !D.hidden) go(at + 1); tick(); }, 3500); }
    box.addEventListener('mouseenter', function () { paused = true; });
    box.addEventListener('mouseleave', function () { paused = false; });
    box.addEventListener('focusin', function (e) { if (e.target.matches(':focus-visible')) paused = true; });
    box.addEventListener('focusout', function () { paused = false; });
    render(); tick();
    /* 노트 등장 · 클립 끼우기 — 다른 장의 등장 효과처럼, 노트가 화면에 들어오면 한 번 저절로(.my-ready → .is-in, 모양은 my-style.css).
       메뉴로 건너뛰어 이미 지나간 경우도 끝 상태로. 동작 줄이기·움직임 0이면 처음부터 끝 상태 */
    if (!(reduce || R.classList.contains('m0')) && 'IntersectionObserver' in window) {
      sheet.classList.add('my-ready');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return;
          sheet.classList.add('is-in'); io.disconnect();
        });
      }, { rootMargin: '0px 0px -18% 0px' });
      io.observe(sheet);
    }
    snap(); addEventListener('load', snap); addEventListener('resize', snap);
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(snap);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
