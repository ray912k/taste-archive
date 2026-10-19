/* 7주 커스텀 — 2장 사람 상세 화면을 신문 기사 한 면으로(학생 첨부 신문 레퍼런스)
   - 카드 안 <template class="my-news"> 에 신문 면(A·B·C 세 구성)을 넣어 두고,
     상세가 열리거나 Prev/Next 로 바뀔 때 지금 카드에 신문이 있으면 상세 안에 붙이고(.ca-detail.is-news) 원래 콜라주·글은 숨긴다
   - 지금 카드 = 상세 머리 이름(.ca-d-t)과 같은 이름의 카드(.ca-name)
   - 모양은 my-style.css「2장 상세 · 신문」
   sig.js · my-collage.js 뒤에 읽는다. */
(function () {
  var D = document;
  function cardByName(name) {
    var hit = null;
    Array.prototype.some.call(D.querySelectorAll('main .ca-card'), function (c) {
      var n = c.querySelector('.ca-name');
      if (n && n.textContent.trim() === name) { hit = c; return true; }
      return false;
    });
    return hit;
  }
  function start() {
    var dl = D.querySelector('.ca-detail'); if (!dl) return;
    var inner = dl.querySelector('.ca-d-in'), title = dl.querySelector('.ca-d-t'), now = '';
    function sync() {
      var name = title ? title.textContent.trim() : '';
      if (name === now && dl.classList.contains('is-on')) return;
      now = name;
      var old = inner.querySelector('.my-news-page'); if (old) old.remove();
      var c = name && cardByName(name), tpl = c && c.querySelector('template.my-news');
      dl.classList.toggle('is-news', !!tpl);
      if (!tpl) return;
      var page = D.createElement('div'); page.className = 'my-news-page';
      page.appendChild(tpl.content.cloneNode(true));
      inner.insertBefore(page, inner.firstChild);
    }
    new MutationObserver(sync).observe(title, { childList: true, characterData: true, subtree: true });
    new MutationObserver(function () { if (!dl.classList.contains('is-on')) now = ''; else sync(); }).observe(dl, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
