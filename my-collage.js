/* 7주 커스텀 — 사진을 누르면 열리는 상세 화면의 사진을 콜라주처럼 배치(학생 첨부 무드보드 레퍼런스 세 장의 배치)
   - 크기가 다른 사진을 겹쳐 놓고, 첫 사진은 흰 테두리 액자, 사이사이에 옅은 색 면(사이트 갈색을 옅게 — 색은 my-style.css)
   - 장 안의 순서에 따라 구성이 셋 중 하나: 1번째(하늘) A · 2번째(손) B · 3번째(길) C, 4번째부터 다시 A…
     A = 첫 레퍼런스(액자 왼쪽 위 · 가운데 넓은 사진 · 오른쪽 세로 둘)
     B = 둘째 레퍼런스(액자 가운데 왼쪽 · 오른쪽 세로 · 아래 넓은 사진 · 왼쪽 아래 세로)
     C = 셋째 레퍼런스(액자 왼쪽 위 · 왼쪽 아래 아주 넓은 사진 · 오른쪽 세로 둘)
   - sig.js 가 상세를 열 때마다 사진(.ca-d-grid figure)을 새로 만들므로, 바뀔 때마다 자리를 다시 준다(MutationObserver)
   - 자리 = 콜라주 상자 기준 %(x · y · 폭 · 높이 · 겹침 순서). 사진이 1~2장인 상세는 따로 정한 자리
   - 사진에 마우스를 올리면 잘리지 않은 원본 비율로 커지고(나머지는 흐림 — my-style.css), 누르면 화면 가득 크게 보기
   - 폰(768px 이하)은 원래 배치 그대로(my-style.css 가 넓은 화면에서만 적용) — 크게 보기는 폰에서도 됨
   sig.js 뒤에 읽는다. */
(function () {
  var D = document;
  /* 사진 3장 이상 — 구성 A · B · C (5장 기준, 적으면 앞에서부터) */
  var V = [
    { f: [[9, 4, 24, 44, 4], [65, 8, 22, 50, 4], [27, 38, 42, 40, 3], [61, 54, 26, 44, 5], [11, 58, 20, 38, 4]],
      b: [[37, 25, 12, 12, 'd'], [89, 48, 8, 14, 'm'], [16, 50, 22, 32, 'm'], [47, 80, 12, 10, 'l']] },
    { f: [[14, 6, 22, 46, 4], [60, 20, 18, 42, 4], [31, 46, 36, 32, 3], [8, 52, 18, 42, 4], [70, 64, 22, 30, 3]],
      b: [[36, 3, 17, 40, 'l'], [80, 8, 6, 14, 'd'], [31, 82, 5, 14, 'd'], [86, 40, 8, 18, 'm']] },
    { f: [[8, 3, 22, 48, 4], [57, 5, 18, 44, 4], [9, 46, 45, 34, 3], [57, 54, 18, 44, 4], [80, 22, 13, 30, 3]],
      b: [[29, 17, 14, 38, 'd'], [76, 40, 13, 16, 'm'], [14, 76, 30, 20, 'd'], [88, 62, 6, 12, 'l']] }
  ];
  /* 사진 1~2장 */
  var S = {
    1: { f: [[28, 4, 44, 88, 3]], b: [[18, 58, 12, 16, 'm'], [74, 16, 9, 12, 'l']] },
    2: { f: [[8, 6, 34, 72, 3], [50, 20, 36, 74, 4]], b: [[42, 6, 10, 11, 'd'], [88, 62, 7, 13, 'm'], [3, 68, 12, 18, 'l']] }
  };
  function at() {   /* 지금 상세가 장 안 몇 번째 카드인지 — 상세 머리 번호 [01] 에서 읽는다 */
    var n = D.querySelector('.ca-detail .ca-d-n'), m = n && n.textContent.match(/\d+/);
    return m ? +m[0] - 1 : 0;
  }
  function lay(grid) {
    var figs = Array.prototype.filter.call(grid.children, function (e) { return e.tagName === 'FIGURE'; });
    var n = Math.min(figs.length, 5);
    grid.classList.toggle('my-collage', n > 0);
    Array.prototype.forEach.call(grid.querySelectorAll('.my-blk'), function (e) { e.remove(); });
    if (!n) return;
    var k = at() % V.length, v = S[n] || V[k];
    grid.dataset.my = S[n] ? 's' + n : 'v' + k;
    figs.forEach(function (f, i) {
      var s = v.f[i];
      if (!s) { f.style.display = 'none'; return; }   /* 6장째부터는 숨김(시스템 상한 5장) */
      f.style.cssText = '--x:' + s[0] + '%;--y:' + s[1] + '%;--w:' + s[2] + '%;--h:' + s[3] + '%;--z:' + s[4];
      f.classList.toggle('my-frame', i === 0);
    });
    v.b.forEach(function (b) {
      var e = D.createElement('span');
      e.className = 'my-blk is-' + b[4]; e.setAttribute('aria-hidden', 'true');
      e.style.cssText = '--x:' + b[0] + '%;--y:' + b[1] + '%;--w:' + b[2] + '%;--h:' + b[3] + '%';
      grid.appendChild(e);
    });
  }
  /* 호버 — 잘린 칸 대신 원본 비율로: 칸 가운데를 기준으로 높이는 칸의 1.1배, 폭은 원본 비율대로(상자 밖으로는 안 나가게) */
  function orig(f, on) {
    if (!f.dataset.slot) f.dataset.slot = f.style.cssText;
    if (!on) { f.style.cssText = f.dataset.slot; f.classList.remove('is-orig'); return; }
    var img = f.querySelector('img'), box = f.parentNode.getBoundingClientRect();
    if (!img || !img.naturalWidth || !box.width) return;
    var r = img.naturalWidth / img.naturalHeight, fs = getComputedStyle(f);
    var x = parseFloat(fs.left), y = parseFloat(fs.top), w = parseFloat(fs.width), h = parseFloat(fs.height);
    var pad = f.classList.contains('my-frame') ? 20 : 0;
    var nh = Math.min(h * 1.1, box.height), nw = (nh - pad) * r + pad;
    if (nw > box.width * .62) { nw = box.width * .62; nh = (nw - pad) / r + pad; }
    var nx = Math.max(0, Math.min(box.width - nw, x + w / 2 - nw / 2)), ny = Math.max(0, Math.min(box.height - nh, y + h / 2 - nh / 2));
    f.style.setProperty('--x', nx + 'px'); f.style.setProperty('--y', ny + 'px');
    f.style.setProperty('--w', nw + 'px'); f.style.setProperty('--h', nh + 'px');
    f.classList.add('is-orig');
  }
  /* 크게 보기 — 콜라주 사진을 누르면 화면 가득 원본. 누르기·Esc 로 닫고 ← → 로 넘긴다 */
  var lb = null, lbImgs = [], lbAt = 0;
  function lbShow(i) {
    lbAt = (i + lbImgs.length) % lbImgs.length;
    var src = lbImgs[lbAt];
    var im = lb.querySelector('img'); im.src = src.getAttribute('src'); im.alt = src.alt || '';
    lb.querySelector('.my-lb-p').hidden = lb.querySelector('.my-lb-n').hidden = lbImgs.length < 2;
  }
  function lbOpen(grid, img) {
    if (!lb) {
      lb = D.createElement('div'); lb.className = 'my-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', '사진 크게 보기');
      lb.innerHTML = '<img alt=""><button type="button" class="my-lb-x">Close ×</button><button type="button" class="my-lb-p" aria-label="이전 사진">←</button><button type="button" class="my-lb-n" aria-label="다음 사진">→</button>';
      lb.addEventListener('click', function (e) {
        if (e.target.closest('.my-lb-p')) lbShow(lbAt - 1);
        else if (e.target.closest('.my-lb-n')) lbShow(lbAt + 1);
        else lbClose();
      });
      D.body.appendChild(lb);
    }
    lbImgs = Array.prototype.filter.call(grid.querySelectorAll('figure img'), function (m) { return m.closest('figure').style.display !== 'none'; });
    lbShow(Math.max(0, lbImgs.indexOf(img)));
    lb.classList.add('is-on');
    lb.querySelector('.my-lb-x').focus({ preventScroll: true });
  }
  function lbClose() { if (lb) lb.classList.remove('is-on'); }
  /* 크게 보기가 열려 있으면 Esc·← → 를 먼저 받아 상세 화면(sig.js)으로 넘기지 않는다 */
  addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('is-on')) return;
    if (e.key === 'Escape') lbClose();
    else if (e.key === 'ArrowLeft') lbShow(lbAt - 1);
    else if (e.key === 'ArrowRight') lbShow(lbAt + 1);
    else return;
    e.preventDefault(); e.stopImmediatePropagation();
  }, true);

  function start() {
    var grid = D.querySelector('.ca-detail .ca-d-grid');
    if (!grid) return;
    var wide = matchMedia('(min-width: 769px) and (hover: hover)');
    grid.addEventListener('mouseover', function (e) {
      if (!wide.matches || !grid.classList.contains('my-collage')) return;
      var f = e.target.closest('figure'); if (!f || f.contains(e.relatedTarget)) return;
      orig(f, true);
    });
    grid.addEventListener('mouseout', function (e) {
      var f = e.target.closest('figure'); if (!f || f.contains(e.relatedTarget)) return;
      if (f.dataset.slot) orig(f, false);
    });
    grid.addEventListener('click', function (e) {
      var img = e.target.closest('figure') && e.target.closest('figure').querySelector('img');
      if (img && grid.classList.contains('my-collage')) { e.stopPropagation(); lbOpen(grid, img); }
    });
    var mo = new MutationObserver(function () { mo.disconnect(); lay(grid); mo.observe(grid, { childList: true }); });
    mo.observe(grid, { childList: true });
    lay(grid);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
