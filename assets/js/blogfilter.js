document.addEventListener('DOMContentLoaded', () => {
    const filterBar     = document.querySelector('.blog-filter-bar');
    const filterButtons = filterBar ? filterBar.querySelectorAll('.blog-filter-btn') : [];
    const articles      = document.querySelectorAll('.article-tile-link');
    const content       = document.querySelector('.content');
    const MAX_VISIBLE   = 5;

    if (!content || !articles.length) return;

    let currentFilter = 'all';

    const showMoreLabel = content.dataset.showMore || 'Mehr anzeigen';

    const showMoreBtn = document.createElement('button');
    showMoreBtn.id = 'blog-show-more-btn';
    showMoreBtn.type = 'button';
    showMoreBtn.textContent = showMoreLabel;
    showMoreBtn.classList.add('blog-filter-btn', 'blog-show-more-btn');
    showMoreBtn.style.display = 'none';
    content.appendChild(showMoreBtn);

    function applyFilter(filter) {
        currentFilter = filter;

        filterButtons.forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.filter === filter);
        });

        const matching = [];

        articles.forEach(article => {
            const raw = article.dataset.category || "";
            const categories = raw.split(',').map(c => c.trim());
            const matches = filter === 'all' || categories.includes(filter);

            if (matches) {
                matching.push(article);
            }

            article.classList.toggle('blog-item-hidden', !matches);
        });

        matching.forEach((article, index) => {
            article.classList.toggle('blog-item-hidden', index >= MAX_VISIBLE);
        });

        if (matching.length > MAX_VISIBLE) {
            showMoreBtn.style.removeProperty('display');
        } else {
            showMoreBtn.style.display = 'none';
        }
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter || 'all';
            applyFilter(filter);
        });
    });

    showMoreBtn.addEventListener('click', () => {
        articles.forEach(article => {
            const raw = article.dataset.category || "";
            const categories = raw.split(',').map(c => c.trim());
            const matches =
                currentFilter === 'all' ||
                categories.includes(currentFilter);

            if (matches) {
                article.classList.remove('blog-item-hidden');
            }
        });

        showMoreBtn.style.display = 'none';
    });

    applyFilter('all');
});
