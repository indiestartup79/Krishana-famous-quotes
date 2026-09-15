/**
 * Quoteverse - Plain Vanilla JavaScript Frontend
 * Handles fetching, filtering, live search, random quotes, and clipboard actions.
 */

(function () {
  'use strict';

  // --- State ---
  const state = {
    currentQuote: null,
    activeCategory: 'all',
    selectedAuthor: '',
    searchQuery: '',
    displayedQuotes: [],
    categories: [],
    authors: [],
    searchDebounceTimer: null
  };

  // --- DOM Elements ---
  const el = {
    heroCard: document.getElementById('hero-card'),
    heroText: document.getElementById('hero-text'),
    heroAuthor: document.getElementById('hero-author'),
    heroCategory: document.getElementById('hero-category'),
    heroQuoteId: document.getElementById('hero-quote-id'),
    heroTags: document.getElementById('hero-tags'),
    btnNextRandom: document.getElementById('btn-next-random'),
    btnCopyQuote: document.getElementById('btn-copy-quote'),
    copyBtnText: document.getElementById('copy-btn-text'),
    btnShareTwitter: document.getElementById('btn-share-twitter'),
    
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    authorSelect: document.getElementById('author-select'),
    categoryPillsContainer: document.getElementById('category-pills-container'),
    btnResetFilters: document.getElementById('btn-reset-filters'),
    
    resultsCount: document.getElementById('results-count'),
    activeFilterSummary: document.getElementById('active-filter-summary'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnRandomFromResults: document.getElementById('btn-random-from-results'),
    quotesGrid: document.getElementById('quotes-grid'),
    emptyState: document.getElementById('empty-state'),
    btnClearAllEmpty: document.getElementById('btn-clear-all-empty'),
    
    headerStats: document.getElementById('header-stats'),
    categoriesCountBadge: document.getElementById('categories-count-badge'),
    toast: document.getElementById('toast')
  };

  // --- API Client ---
  async function apiGet(endpoint, params = {}) {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        query.set(k, v);
      }
    }
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // --- Toast Notification ---
  let toastTimer = null;
  function showToast(message) {
    if (!el.toast) return;
    el.toast.textContent = message;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.remove('show');
    }, 2400);
  }

  // --- Clipboard Helper ---
  async function copyQuoteToClipboard(quoteObj) {
    if (!quoteObj) return;
    const textToCopy = `"${quoteObj.quote}" — ${quoteObj.author}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('Quote copied to clipboard! 📋');
    } catch (err) {
      console.error('Failed to copy quote:', err);
      showToast('Could not copy to clipboard.');
    }
  }

  // --- Render Hero Quote ---
  function renderHeroQuote(quote) {
    if (!quote) return;
    state.currentQuote = quote;

    // Smooth subtle transition
    el.heroCard.style.opacity = '0.4';
    el.heroCard.style.transform = 'translateY(4px)';

    setTimeout(() => {
      el.heroText.textContent = `"${quote.quote}"`;
      el.heroAuthor.textContent = quote.author;
      el.heroCategory.textContent = quote.category;
      el.heroQuoteId.textContent = `Quote #${quote.id}`;

      // Set category styling class
      el.heroCategory.className = `category-pill cat-${quote.category}`;

      // Render tags
      el.heroTags.innerHTML = '';
      if (Array.isArray(quote.tags)) {
        quote.tags.forEach(tag => {
          const span = document.createElement('span');
          span.className = 'tag-item';
          span.textContent = `#${tag}`;
          el.heroTags.appendChild(span);
        });
      }

      el.heroCard.style.opacity = '1';
      el.heroCard.style.transform = 'translateY(0)';
    }, 150);
  }

  // --- Render Category Pills ---
  function renderCategoryPills(categories) {
    const fragment = document.createDocumentFragment();

    // Calculate total quotes
    const totalQuotes = categories.reduce((sum, c) => sum + c.count, 0);

    // Update 'All' chip count
    const allChip = el.categoryPillsContainer.querySelector('[data-category="all"]');
    if (allChip) {
      allChip.innerHTML = `All <span class="chip-count">(${totalQuotes})</span>`;
    }

    // Append category chips
    categories.forEach(c => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cat-chip';
      btn.dataset.category = c.category;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.innerHTML = `${c.category} <span class="chip-count">(${c.count})</span>`;
      fragment.appendChild(btn);
    });

    el.categoryPillsContainer.appendChild(fragment);

    if (el.categoriesCountBadge) {
      el.categoriesCountBadge.textContent = `${categories.length} Categories`;
    }
  }

  // --- Populate Authors Dropdown ---
  function populateAuthorSelect(authors) {
    const fragment = document.createDocumentFragment();
    authors.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.author;
      opt.textContent = `${item.author} (${item.count})`;
      fragment.appendChild(opt);
    });
    el.authorSelect.appendChild(fragment);
  }

  // --- Render Quotes Grid ---
  function renderQuotesGrid(quotes) {
    state.displayedQuotes = quotes;
    el.quotesGrid.innerHTML = '';

    if (!quotes || quotes.length === 0) {
      el.quotesGrid.hidden = true;
      el.emptyState.hidden = false;
      el.resultsCount.textContent = '0 quotes found';
      el.btnRandomFromResults.disabled = true;
      if (el.btnExportCsv) el.btnExportCsv.disabled = true;
      return;
    }

    el.quotesGrid.hidden = false;
    el.emptyState.hidden = true;
    el.btnRandomFromResults.disabled = false;
    if (el.btnExportCsv) el.btnExportCsv.disabled = false;
    el.resultsCount.textContent = `Showing ${quotes.length} quote${quotes.length === 1 ? '' : 's'}`;

    const fragment = document.createDocumentFragment();

    quotes.forEach(quote => {
      const card = document.createElement('article');
      card.className = 'quote-card';

      card.innerHTML = `
        <div class="card-top">
          <span class="card-cat cat-${quote.category}">${escapeHtml(quote.category)}</span>
          <span class="quote-id-tag">#${quote.id}</span>
        </div>
        <blockquote class="card-quote-text">
          "${escapeHtml(quote.quote)}"
        </blockquote>
        <div class="card-bottom">
          <span class="card-author-name">— ${escapeHtml(quote.author)}</span>
          <button type="button" class="card-copy-btn" title="Copy this quote to clipboard">📋 Copy</button>
        </div>
      `;

      // Copy button on individual card
      const copyBtn = card.querySelector('.card-copy-btn');
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await copyQuoteToClipboard(quote);
        copyBtn.textContent = '✓ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = '📋 Copy';
          copyBtn.classList.remove('copied');
        }, 1500);
      });

      // Clicking card sets it as the hero quote
      card.addEventListener('click', () => {
        renderHeroQuote(quote);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      fragment.appendChild(card);
    });

    el.quotesGrid.appendChild(fragment);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Update Filter Summary Label ---
  function updateFilterSummary() {
    const parts = [];
    if (state.activeCategory && state.activeCategory !== 'all') {
      parts.push(`Category: "${state.activeCategory}"`);
    } else {
      parts.push('All Categories');
    }
    if (state.selectedAuthor) {
      parts.push(`Author: "${state.selectedAuthor}"`);
    }
    if (state.searchQuery) {
      parts.push(`Search: "${state.searchQuery}"`);
    }
    el.activeFilterSummary.textContent = parts.join(' • ');
  }

  // --- Fetch Operations ---
  async function fetchRandomQuote(opts = {}) {
    try {
      const params = {};
      if (opts.category && opts.category !== 'all') {
        params.category = opts.category;
      }
      if (opts.author) {
        params.author = opts.author;
      }
      const quote = await apiGet('/api/quotes/random', params);
      renderHeroQuote(quote);
    } catch (err) {
      console.warn('Could not fetch filtered random quote, falling back to global random:', err);
      try {
        const fallbackQuote = await apiGet('/api/quotes/random');
        renderHeroQuote(fallbackQuote);
      } catch (e) {
        showToast('Error loading random quote.');
      }
    }
  }

  async function loadQuotes() {
    try {
      const params = {
        search: state.searchQuery,
        category: state.activeCategory === 'all' ? '' : state.activeCategory,
        author: state.selectedAuthor
      };
      const data = await apiGet('/api/quotes', params);
      renderQuotesGrid(data.quotes);
      updateFilterSummary();
    } catch (err) {
      console.error('Error fetching quotes:', err);
      showToast('Failed to fetch quotes.');
    }
  }

  // --- Export to CSV ---
  function exportToCsv() {
    const quotesToExport = state.displayedQuotes || [];
    if (quotesToExport.length === 0) {
      showToast('No quotes to export.');
      return;
    }

    // CSV Header row
    const headers = ['ID', 'Quote', 'Author', 'Category', 'Tags'];

    // Escape and format CSV rows
    const rows = quotesToExport.map(q => {
      const id = q.id;
      const quote = `"${(q.quote || '').replace(/"/g, '""')}"`;
      const author = `"${(q.author || '').replace(/"/g, '""')}"`;
      const category = `"${(q.category || '').replace(/"/g, '""')}"`;
      const tags = `"${((q.tags || []).join('; ')).replace(/"/g, '""')}"`;
      return [id, quote, author, category, tags].join(',');
    });

    // Prepend UTF-8 BOM so Excel opens special characters cleanly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const categoryTag = state.activeCategory !== 'all' ? state.activeCategory.toLowerCase() : 'all';
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `quotes-${categoryTag}-${dateStr}.csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported ${quotesToExport.length} quotes to ${filename} 📥`);
  }

  // --- Event Handlers & Bindings ---
  function setupEventListeners() {
    // Export CSV button
    if (el.btnExportCsv) {
      el.btnExportCsv.addEventListener('click', exportToCsv);
    }

    // New Random Quote button
    el.btnNextRandom.addEventListener('click', () => {
      fetchRandomQuote({
        category: state.activeCategory,
        author: state.selectedAuthor
      });
    });

    // Copy Quote button (Hero)
    el.btnCopyQuote.addEventListener('click', () => {
      copyQuoteToClipboard(state.currentQuote);
    });

    // Share Twitter / X
    el.btnShareTwitter.addEventListener('click', () => {
      if (!state.currentQuote) return;
      const text = `"${state.currentQuote.quote}" — ${state.currentQuote.author}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    // Live search input
    el.searchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      state.searchQuery = val;
      el.clearSearchBtn.hidden = val.length === 0;

      clearTimeout(state.searchDebounceTimer);
      state.searchDebounceTimer = setTimeout(() => {
        loadQuotes();
      }, 250);
    });

    // Clear search button
    el.clearSearchBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      state.searchQuery = '';
      el.clearSearchBtn.hidden = true;
      el.searchInput.focus();
      loadQuotes();
    });

    // Author dropdown change
    el.authorSelect.addEventListener('change', (e) => {
      state.selectedAuthor = e.target.value;
      loadQuotes();
    });

    // Category pills click delegation
    el.categoryPillsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.cat-chip');
      if (!chip) return;

      const category = chip.dataset.category;
      if (!category) return;

      // Update active styling
      el.categoryPillsContainer.querySelectorAll('.cat-chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-checked', 'true');

      state.activeCategory = category;
      loadQuotes();

      // Also refresh the hero quote to match selected category
      if (category !== 'all') {
        fetchRandomQuote({ category });
      }
    });

    // Pick random from filtered results
    el.btnRandomFromResults.addEventListener('click', () => {
      if (state.displayedQuotes.length === 0) return;
      const randomIdx = Math.floor(Math.random() * state.displayedQuotes.length);
      const chosenQuote = state.displayedQuotes[randomIdx];
      renderHeroQuote(chosenQuote);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Reset filters
    function resetAllFilters() {
      state.activeCategory = 'all';
      state.selectedAuthor = '';
      state.searchQuery = '';

      el.searchInput.value = '';
      el.clearSearchBtn.hidden = true;
      el.authorSelect.value = '';

      el.categoryPillsContainer.querySelectorAll('.cat-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.category === 'all');
        c.setAttribute('aria-checked', c.dataset.category === 'all' ? 'true' : 'false');
      });

      loadQuotes();
      fetchRandomQuote();
    }

    el.btnResetFilters.addEventListener('click', resetAllFilters);
    el.btnClearAllEmpty.addEventListener('click', resetAllFilters);

    // Keyboard shortcut: Space for new random quote
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
          return; // Don't trigger when user is typing in form fields
        }
        e.preventDefault();
        fetchRandomQuote({
          category: state.activeCategory,
          author: state.selectedAuthor
        });
      }
    });
  }

  // --- Initializer ---
  async function init() {
    setupEventListeners();

    try {
      // Fetch metadata in parallel
      const [categoriesData, authorsData, randomQuote] = await Promise.all([
        apiGet('/api/categories'),
        apiGet('/api/authors'),
        apiGet('/api/quotes/random')
      ]);

      state.categories = categoriesData.categories;
      state.authors = authorsData.authors;

      renderCategoryPills(state.categories);
      populateAuthorSelect(state.authors);
      renderHeroQuote(randomQuote);

      // Load initial quotes grid (all 100 quotes)
      await loadQuotes();
    } catch (err) {
      console.error('Initialization error:', err);
      showToast('Failed to initialize quotes application.');
    }
  }

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
