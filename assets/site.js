(() => {
  'use strict';
  const base = document.body.dataset.base;
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('#guide-list .guide-card')];
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    let count = 0;
    cards.forEach(card => { card.hidden = button.dataset.filter !== '全部' && card.dataset.category !== button.dataset.filter; if (!card.hidden) count += 1; });
    document.getElementById('guide-count').textContent = `${count} 篇攻略`;
  }));
  const results = document.getElementById('search-results');
  if (!results) return;
  const q = (new URLSearchParams(location.search).get('q') || '').trim().slice(0, 100);
  const input = document.getElementById('search-input');
  input.value = q;
  const status = document.getElementById('search-status');
  if (!q) return;
  status.textContent = '正在查找相关文章…';
  fetch(`${base}assets/search-index.json`, {credentials: 'omit'})
    .then(response => { if (!response.ok) throw new Error('index unavailable'); return response.json(); })
    .then(index => {
      const found = window.ShengyuSearch(index, q);
      status.textContent = `“${q}”找到 ${found.length} 篇相关文章`;
      if (!found.length) {
        const box = document.createElement('div'); box.className = 'search-empty';
        const title = document.createElement('strong'); title.textContent = '暂时没有对应文章';
        const tip = document.createElement('p'); tip.textContent = '试试缩短关键词，或使用任务、NPC与道具的名称。';
        box.append(title, tip); results.append(box); return;
      }
      found.forEach(article => {
        const card = document.createElement('a'); card.className = 'guide-card'; card.href = article.path;
        const top = document.createElement('span'); top.className = 'card-top'; top.textContent = article.category;
        const title = document.createElement('h3'); title.textContent = article.title;
        const summary = document.createElement('p'); summary.textContent = article.summary;
        const foot = document.createElement('span'); foot.className = 'card-foot'; foot.textContent = `${article.date} · ${article.status || '玩法攻略'}`;
        card.append(top, title, summary, foot); results.append(card);
      });
    }).catch(() => {
      status.textContent = '搜索资料暂时未加载成功，可以从攻略目录继续阅读。';
      const link = document.createElement('a'); link.className = 'button'; link.href = `${base}guides/`; link.textContent = '查看全部攻略 →'; results.append(link);
    });
})();
