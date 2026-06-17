document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.tools-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.tool-card'));
  if (!cards.length) return;

  const filterBar = document.querySelector('.tools-filter-bar');
  const filterButtons = filterBar
    ? Array.from(filterBar.querySelectorAll('.tools-filter-btn'))
    : [];

  // Suche vorerst deaktiviert
  // const searchInput = document.querySelector('[data-tools-search]');

  let currentFilter = 'all';

  function matchesFilter(card) {
    const typeRaw = (card.dataset.toolType || '').toLowerCase();
    if (currentFilter === 'all') return true;

    const types = typeRaw.split(',').map(t => t.trim());
    return types.includes(currentFilter);
  }

  function matchesSearch(card) {
    return true;

    /*
    if (!currentSearch) return true;

    const searchData = (card.dataset.toolSearch || '').toLowerCase();
    const fallbackText = card.textContent.toLowerCase();
    const haystack = (searchData || fallbackText);

    return haystack.includes(currentSearch);
    */
  }

  function applyFilterAndSearch() {
    const visibleCards = [];

    cards.forEach(card => {
      const isMatch = matchesFilter(card) && matchesSearch(card);
      card.classList.toggle('tool-card-hidden', !isMatch);
      if (isMatch) visibleCards.push(card);
    });

    equalizeToolHeights(visibleCards);
  }

  function equalizeToolHeights(visibleCards) {
    const sourceCards = (visibleCards && visibleCards.length)
      ? visibleCards
      : cards;

    const titleEls = [];
    const bodyEls = [];

    sourceCards.forEach(card => {
      const title = card.querySelector('.tool-card__title');
      const body = card.querySelector('.tool-card__body');
      if (title) titleEls.push(title);
      if (body) bodyEls.push(body);
    });

    titleEls.forEach(el => {
      el.style.height = '';
    });
    bodyEls.forEach(el => {
      el.style.height = '';
    });

    let maxTitleHeight = 0;
    let maxBodyHeight = 0;

    titleEls.forEach(el => {
      const h = el.offsetHeight;
      if (h > maxTitleHeight) maxTitleHeight = h;
    });

    bodyEls.forEach(el => {
      const h = el.offsetHeight;
      if (h > maxBodyHeight) maxBodyHeight = h;
    });

    titleEls.forEach(el => {
      el.style.height = maxTitleHeight + 'px';
    });

    bodyEls.forEach(el => {
      el.style.height = maxBodyHeight + 'px';
    });
  }

  function updateActiveFilterButtons(filter) {
    filterButtons.forEach(btn => {
      const btnFilter = (btn.dataset.filter || 'all').toLowerCase();
      const isActive = btnFilter === filter;
      btn.classList.toggle('is-active', isActive);
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = (btn.dataset.filter || 'all').toLowerCase();
      currentFilter = filter;

      updateActiveFilterButtons(currentFilter);
      applyFilterAndSearch();
    });
  });

  updateActiveFilterButtons(currentFilter);
  applyFilterAndSearch();

  /*
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value.trim().toLowerCase();
      applyFilterAndSearch();
    });
  }
  */

  window.addEventListener('load', () => {
    equalizeToolHeights();
  });

  window.addEventListener('resize', () => {
    equalizeToolHeights();
  });
});