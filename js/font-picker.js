/* ---------------------------------------------------------------------
   font-picker.js — visual font picker that replaces the look of the
   #headingFont / #bodyFont selects. The <select> elements stay in the DOM
   (hidden) and remain the source of truth: committing a font sets
   select.value and dispatches a bubbling `change` event, exactly like the
   native control did, so app.js / persistence / undo need no changes.

   app.js calls syncFontPickers() from render() so programmatic changes
   (shuffle, swap, undo, session restore) update the trigger labels.
------------------------------------------------------------------------ */

(function () {
  const CATEGORIES = [
    { key: 'all', label: 'All' },
    { key: 'serif', label: 'Serif' },
    { key: 'sans', label: 'Sans' },
    { key: 'display', label: 'Display' },
    { key: 'slab', label: 'Slab' },
    { key: 'mono', label: 'Mono' },
  ];
  const FALLBACK_SAMPLE = 'Aa Bb Cc 123';

  const pickers = [];
  let openPicker = null;

  const esc = s => escapeHtml(s);   // app.js
  function primaryFamily(font) { return font.name; }

  /* ---- font loading: the bundled fonts/fonts.css (#localFonts) plus any Google
     Fonts fallback <link>s app.js injected; wait for them, then ask the browser to
     fetch the actual face when a card is seen. ---- */
  function stylesheetsReady() {
    const links = Array.from(document.querySelectorAll('#localFonts, link[href*="fonts.googleapis.com/css2"]'));
    return Promise.all(links.map(l => new Promise(resolve => {
      if (l.sheet) return resolve();
      l.addEventListener('load', resolve, { once: true });
      l.addEventListener('error', resolve, { once: true });
    })));
  }
  const loaded = new Map();
  function loadFont(font) {
    if (loaded.has(font.name)) return loaded.get(font.name);
    const timeout = new Promise(r => setTimeout(r, 5000));
    const p = Promise.race([
      stylesheetsReady().then(() => document.fonts.load(`16px "${primaryFamily(font)}"`)).catch(() => {}),
      timeout,
    ]);
    loaded.set(font.name, p);
    return p;
  }

  /* ---- live preview (temporary, never touches app state) ---- */
  function previewFont(role, font) {
    const card = document.getElementById('previewCard');
    const sh = document.getElementById('fontSpecimenHeading');
    const sb = document.getElementById('fontSpecimenBody');
    if (role === 'heading') {
      if (card) card.style.setProperty('--font-heading', font.css);
      if (sh) sh.style.fontFamily = font.css;
    } else {
      if (card) card.style.setProperty('--font-body', font.css);
      if (sb) sb.style.fontFamily = font.css;
    }
  }
  function restorePreview(role) {
    if (typeof state === 'undefined') return;
    previewFont(role, role === 'heading' ? state.headingFont : state.bodyFont);
  }

  /* ---- sample text ---- */
  function brandSample() {
    const el = document.getElementById('brandName');
    return (el && el.value.trim()) || FALLBACK_SAMPLE;
  }
  function bodySample() {
    const el = document.getElementById('tagline');
    return (el && el.value.trim()) || FALLBACK_SAMPLE;
  }

  class FontPicker {
    constructor(select, role) {
      this.select = select;
      this.role = role;
      this.category = 'all';
      this.query = '';
      this.visible = [];
      this.activeIndex = -1;
      this.isOpen = false;
      this.build();
    }

    build() {
      const sel = this.select;
      sel.classList.add('fp-native');
      sel.tabIndex = -1;
      sel.setAttribute('aria-hidden', 'true');

      const labelText = (sel.closest('label')?.querySelector('span')?.textContent || 'Font').trim();
      this.labelText = labelText;

      this.trigger = document.createElement('button');
      this.trigger.type = 'button';
      this.trigger.className = 'fp-trigger';
      this.trigger.setAttribute('aria-haspopup', 'listbox');
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.setAttribute('aria-label', labelText);
      this.triggerName = document.createElement('span');
      this.triggerName.className = 'fp-trigger-name';
      this.trigger.appendChild(this.triggerName);
      sel.insertAdjacentElement('afterend', this.trigger);

      this.panel = document.createElement('div');
      this.panel.className = 'fp-panel';
      this.panel.hidden = true;
      this.panel.innerHTML = `
        <div class="fp-head">
          <input type="text" class="fp-search" placeholder="Search fonts" aria-label="Search ${esc(labelText)}"
                 role="combobox" aria-expanded="true" aria-autocomplete="list" autocomplete="off" spellcheck="false" />
          <div class="fp-chips" role="group" aria-label="Category">
            ${CATEGORIES.map(c => `<button type="button" class="fp-chip" data-cat="${c.key}" aria-pressed="${c.key === 'all'}">${c.label}</button>`).join('')}
          </div>
        </div>
        <div class="fp-list" role="listbox" aria-label="${esc(labelText)}"></div>
        <div class="fp-empty" hidden>No fonts match.</div>`;
      document.body.appendChild(this.panel);
      this.search = this.panel.querySelector('.fp-search');
      this.list = this.panel.querySelector('.fp-list');
      this.empty = this.panel.querySelector('.fp-empty');
      this.listId = `fp-list-${this.role}`;
      this.list.id = this.listId;
      this.search.setAttribute('aria-controls', this.listId);

      this.buildCards();
      this.bind();
      this.sync();
    }

    buildCards() {
      this.cards = FONTS.map((font, i) => {
        const card = document.createElement('div');
        card.className = 'fp-card is-loading';
        card.id = `fp-${this.role}-${i}`;
        card.setAttribute('role', 'option');
        card.dataset.index = String(i);
        card.innerHTML = `
          <div class="fp-card-meta"><span class="fp-card-name">${esc(font.name)}</span><span class="fp-card-cat">${esc(font.category)}</span></div>
          <div class="fp-sample fp-sample-${this.role}" style="font-family:${esc(font.css)}"></div>`;
        this.list.appendChild(card);
        return card;
      });
      this.io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          const card = en.target;
          this.io.unobserve(card);
          const font = FONTS[Number(card.dataset.index)];
          loadFont(font).then(() => card.classList.remove('is-loading'));
        });
      }, { root: this.list, rootMargin: '120px' });
    }

    refreshSamples() {
      const text = this.role === 'heading' ? brandSample() : bodySample();
      this.list.querySelectorAll('.fp-sample').forEach(el => { el.textContent = text; });
    }

    bind() {
      this.trigger.addEventListener('click', () => this.isOpen ? this.close(true) : this.open());
      this.trigger.addEventListener('keydown', e => {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          this.open();
        }
      });

      this.search.addEventListener('input', () => {
        this.query = this.search.value.trim().toLowerCase();
        this.applyFilter(true);
      });
      this.panel.querySelectorAll('.fp-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          this.category = chip.dataset.cat;
          this.panel.querySelectorAll('.fp-chip').forEach(c =>
            c.setAttribute('aria-pressed', String(c === chip)));
          this.applyFilter(true);
          this.search.focus();
        });
      });

      // Keep panel keystrokes away from the global Space-to-shuffle shortcut.
      this.panel.addEventListener('keydown', e => {
        e.stopPropagation();
        this.onKey(e);
      });

      let lastX = -1, lastY = -1;
      this.list.addEventListener('mousemove', e => {
        // Ignore synthetic moves caused by scrolling under a still cursor.
        if (e.clientX === lastX && e.clientY === lastY) return;
        lastX = e.clientX; lastY = e.clientY;
        const card = e.target.closest('.fp-card');
        if (card && !card.hidden) this.setActive(this.visible.indexOf(Number(card.dataset.index)), false);
      });
      this.list.addEventListener('mouseleave', () => {
        if (this.isOpen) { this.setActive(-1, false); restorePreview(this.role); }
      });
      this.list.addEventListener('click', e => {
        const card = e.target.closest('.fp-card');
        if (card) this.commit(Number(card.dataset.index));
      });
    }

    onKey(e) {
      switch (e.key) {
        case 'Escape':
          e.preventDefault(); this.close(true); break;
        case 'Tab':
          this.close(false); break;
        case 'ArrowDown':
          e.preventDefault(); this.setActive(Math.min(this.activeIndex + 1, this.visible.length - 1), true); break;
        case 'ArrowUp':
          e.preventDefault(); this.setActive(Math.max(this.activeIndex - 1, 0), true); break;
        case 'PageDown':
          e.preventDefault(); this.setActive(Math.min(this.activeIndex + 5, this.visible.length - 1), true); break;
        case 'PageUp':
          e.preventDefault(); this.setActive(Math.max(this.activeIndex - 5, 0), true); break;
        case 'Home':
          if (document.activeElement !== this.search || !this.search.value) { e.preventDefault(); this.setActive(0, true); }
          break;
        case 'End':
          if (document.activeElement !== this.search || !this.search.value) { e.preventDefault(); this.setActive(this.visible.length - 1, true); }
          break;
        case 'Enter':
          e.preventDefault();
          if (this.activeIndex >= 0) this.commit(this.visible[this.activeIndex]);
          break;
        default:
          // Type-to-search: printable keys pressed anywhere in the panel
          // (e.g. focus on a chip) go to the search box.
          if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && document.activeElement !== this.search) {
            this.search.focus();
          }
      }
    }

    applyFilter(resetActive) {
      const q = this.query;
      this.visible = [];
      FONTS.forEach((f, i) => {
        const match = (this.category === 'all' || f.category === this.category) &&
          (!q || f.name.toLowerCase().includes(q) || f.category.includes(q));
        this.cards[i].hidden = !match;
        if (match) this.visible.push(i);
      });
      this.empty.hidden = this.visible.length > 0;
      if (resetActive) {
        this.list.scrollTop = 0;
        this.setActive(q && this.visible.length ? 0 : -1, false);
        if (this.activeIndex < 0) restorePreview(this.role);
      }
      this.observeVisible();
    }

    observeVisible() {
      this.visible.forEach(i => {
        const c = this.cards[i];
        if (c.classList.contains('is-loading')) this.io.observe(c);
      });
    }

    setActive(visIndex, scroll) {
      this.activeIndex = visIndex;
      this.cards.forEach(c => c.classList.remove('is-active'));
      if (visIndex < 0 || visIndex >= this.visible.length) {
        this.activeIndex = -1;
        this.search.removeAttribute('aria-activedescendant');
        return;
      }
      const card = this.cards[this.visible[visIndex]];
      card.classList.add('is-active');
      this.search.setAttribute('aria-activedescendant', card.id);
      if (scroll) card.scrollIntoView({ block: 'nearest' });
      previewFont(this.role, FONTS[this.visible[visIndex]]);
    }

    currentIndex() { return Number(this.select.value); }

    sync() {
      const font = FONTS[this.currentIndex()];
      if (!font) return;
      this.triggerName.textContent = font.name;
      this.triggerName.style.fontFamily = font.css;
      this.trigger.setAttribute('aria-label', `${this.labelText}: ${font.name}`);
      this.cards.forEach((c, i) => c.setAttribute('aria-selected', String(i === this.currentIndex())));
    }

    position() {
      const r = this.trigger.getBoundingClientRect();
      const margin = 8;
      const width = Math.min(Math.max(r.width, 340), window.innerWidth - margin * 2);
      let left = Math.min(Math.max(r.left, margin), window.innerWidth - width - margin);
      const below = window.innerHeight - r.bottom - margin;
      const above = r.top - margin;
      const placeBelow = below >= 320 || below >= above;
      const maxH = Math.max(220, Math.min(460, (placeBelow ? below : above) - 4));
      Object.assign(this.panel.style, {
        left: left + 'px',
        width: width + 'px',
        maxHeight: maxH + 'px',
        top: placeBelow ? (r.bottom + 4) + 'px' : 'auto',
        bottom: placeBelow ? 'auto' : (window.innerHeight - r.top + 4) + 'px',
      });
    }

    open() {
      if (openPicker && openPicker !== this) openPicker.close(false);
      openPicker = this;
      this.isOpen = true;
      this.query = '';
      this.category = 'all';
      this.search.value = '';
      this.panel.querySelectorAll('.fp-chip').forEach(c =>
        c.setAttribute('aria-pressed', String(c.dataset.cat === 'all')));
      this.refreshSamples();
      this.panel.hidden = false;
      this.trigger.setAttribute('aria-expanded', 'true');
      this.position();
      this.applyFilter(false);
      const cur = this.visible.indexOf(this.currentIndex());
      this.setActive(-1, false);
      this.search.focus({ preventScroll: true });
      if (cur >= 0) {
        this.cards[this.currentIndex()].scrollIntoView({ block: 'center' });
      }
      this.observeVisible();
    }

    close(returnFocus) {
      if (!this.isOpen) return;
      this.isOpen = false;
      if (openPicker === this) openPicker = null;
      this.panel.hidden = true;
      this.trigger.setAttribute('aria-expanded', 'false');
      restorePreview(this.role);
      if (returnFocus) this.trigger.focus();
    }

    commit(fontIndex) {
      const changed = String(fontIndex) !== this.select.value;
      this.select.value = String(fontIndex);
      this.close(true);
      if (changed) this.select.dispatchEvent(new Event('change', { bubbles: true }));
      this.sync();
    }
  }

  document.addEventListener('mousedown', e => {
    if (!openPicker) return;
    if (openPicker.panel.contains(e.target) || openPicker.trigger.contains(e.target)) return;
    openPicker.close(false);
  });
  window.addEventListener('resize', () => { if (openPicker) openPicker.position(); });
  document.addEventListener('scroll', e => {
    if (!openPicker || openPicker.panel.contains(e.target)) return;
    openPicker.position();
  }, true);

  window.loadFontFamily = loadFont;
  window.syncFontPickers = function () { pickers.forEach(p => p.sync()); };

  function initFontPickers() {
    [['headingFont', 'heading'], ['bodyFont', 'body']].forEach(([id, role]) => {
      const sel = document.getElementById(id);
      if (sel) pickers.push(new FontPicker(sel, role));
    });
  }
  window.initFontPickers = initFontPickers;
})();
