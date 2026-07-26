/* ============================================================
   Polytechnic Helpdesk Notification Portal — script.js
   ============================================================ */

(function () {
  "use strict";

  // ---- Category color tokens (pill bg / pill text / row accent) ----
  const CATEGORY_STYLES = {
    "IS Codes":          { bg: "#e6f7f5", text: "#0f6d61", accent: "#0f9d8c" },
    "Class Routines":    { bg: "#eef4fb", text: "#1e5fa8", accent: "#1e5fa8" },
    "Study Materials":   { bg: "#f1ecfa", text: "#5b3fa0", accent: "#7c5cbf" },
    "Announcement":      { bg: "#fdf1de", text: "#7a4f0a", accent: "#e8a33d" },
    "Newsletter":        { bg: "#fbe9f1", text: "#9c2f5e", accent: "#c2477a" },
    "Notice":            { bg: "#eef1f5", text: "#3c4a5e", accent: "#5b6b83" },
    "Answer Key":        { bg: "#e6f6ea", text: "#145a29", accent: "#2fa84f" },
    "Academic Calender": { bg: "#ecefFb", text: "#33409c", accent: "#4a5fc1" },
    "Result":            { bg: "#fdece9", text: "#a83a26", accent: "#e0563f" },
    "PYQs":              { bg: "#e3f4f6", text: "#12626f", accent: "#1c8fa0" }
  };
  const FALLBACK_PALETTE = ["#0f9d8c", "#1e5fa8", "#7c5cbf", "#e8a33d", "#c2477a", "#5b6b83"];
  function styleFor(category) {
    if (CATEGORY_STYLES[category]) return CATEGORY_STYLES[category];
    let hash = 0;
    for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash);
    const accent = FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length];
    return { bg: "#f2f4f7", text: "#3c4a5e", accent };
  }

  // ---- State ----
  let allData = [];
  let filtered = [];
  let currentPage = 1;
  let pageSize = 10;
  let sortKey = "isoDate";
  let sortDir = "desc";

  // Pinning is admin-controlled only: set "isPinned": true on an entry in
  // notification.json to have it float to the top for every visitor.
  // There is no visitor-facing pin control.
  function isPinned(item) {
    return !!item.isPinned;
  }

  // ---- DOM refs ----
  const tableBody = document.getElementById("tableBody");
  const resultCount = document.getElementById("resultCount");
  const showingText = document.getElementById("showingText");
  const pagination = document.getElementById("pagination");
  const emptyState = document.getElementById("emptyState");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");
  const searchSuggestions = document.getElementById("searchSuggestions");
  const pageSizeSelect = document.getElementById("pageSize");
  const applyBtn = document.getElementById("applyFilters");
  const resetBtn = document.getElementById("resetFilters");
  const emptyResetBtn = document.getElementById("emptyReset");
  const liveClock = document.getElementById("liveClock");

  // ---- Helpers ----
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(escapedText, rawTerm) {
    if (!rawTerm) return escapedText;
    const re = new RegExp("(" + escapeRegExp(rawTerm) + ")", "ig");
    return escapedText.replace(re, "<mark>$1</mark>");
  }

  function relativeTime(isoDate) {
    const then = new Date(isoDate + "T00:00:00");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((today - then) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays > 1) return diffDays + " days ago";
    if (diffDays === -1) return "Tomorrow";
    return "in " + Math.abs(diffDays) + " days";
  }

  function populateCategoryOptions() {
    const cats = Array.from(new Set(allData.map((d) => d.category))).sort();
    cats.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  }

  function compute() {
    const term = searchInput.value.trim().toLowerCase();
    const cat = categoryFilter.value;

    filtered = allData.filter((item) => {
      if (cat && item.category !== cat) return false;
      if (term && !(item.title.toLowerCase().includes(term) || item.category.toLowerCase().includes(term))) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      const pa = isPinned(a) ? 0 : 1;
      const pb = isPinned(b) ? 0 : 1;
      if (pa !== pb) return pa - pb;

      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  function renderTable() {
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    resultCount.textContent = total;
    emptyState.hidden = total !== 0;
    tableBody.parentElement.parentElement.style.display = total === 0 ? "none" : "";

    tableBody.innerHTML = pageItems.map((item) => {
      const style = styleFor(item.category);
      const linksHtml = item.links.map((l) =>
        `<a class="link-btn" href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>`
      ).join("");
      const newBadge = item.isNew ? '<span class="new-badge">NEW</span>' : "";
      const pinned = isPinned(item);
      const pinnedBadge = pinned ? '<span class="pinned-badge">PINNED</span>' : "";

      return `
        <tr class="${pinned ? "is-pinned" : ""}" style="--accent:${style.accent}">
          <td class="col-sl" data-label="Sl. No">${item.slNo}</td>
          <td class="col-title" data-label="Notification" style="border-left-color:${style.accent}">${escapeHtml(item.title)}</td>
          <td data-label="Category"><span class="category-pill" style="background:${style.bg};color:${style.text}">${escapeHtml(item.category)}</span></td>
          <td class="date-cell" data-label="Date Published">${item.date}<span class="relative-time">${relativeTime(item.isoDate)}</span></td>
          <td class="flags-cell" data-label="Flags">${newBadge}${pinnedBadge}</td>
          <td class="col-link" data-label="Link"><div class="link-cell">${linksHtml}</div></td>
        </tr>`;
    }).join("");

    showingText.textContent = total === 0
      ? "Showing 0 of 0 entries"
      : `Showing ${start + 1} to ${Math.min(start + pageSize, total)} of ${total} entries`;

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    pagination.innerHTML = "";

    const makeBtn = (label, page, opts = {}) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "page-btn" + (opts.active ? " active" : "");
      btn.textContent = label;
      btn.disabled = !!opts.disabled;
      btn.addEventListener("click", () => {
        currentPage = page;
        renderTable();
      });
      return btn;
    };

    pagination.appendChild(makeBtn("Previous", currentPage - 1, { disabled: currentPage <= 1 }));

    const windowSize = 1;
    const pages = new Set([1, totalPages]);
    for (let p = currentPage - windowSize; p <= currentPage + windowSize; p++) {
      if (p >= 1 && p <= totalPages) pages.add(p);
    }
    const sortedPages = Array.from(pages).sort((a, b) => a - b);

    let prev = 0;
    sortedPages.forEach((p) => {
      if (p - prev > 1) {
        const span = document.createElement("span");
        span.className = "page-ellipsis";
        span.textContent = "…";
        pagination.appendChild(span);
      }
      pagination.appendChild(makeBtn(String(p), p, { active: p === currentPage }));
      prev = p;
    });

    pagination.appendChild(makeBtn("Next", currentPage + 1, { disabled: currentPage >= totalPages }));
  }

  function applyAndRender() {
    compute();
    renderTable();
  }

  function updateSortIcons() {
    document.querySelectorAll("th.sortable").forEach((th) => {
      const icoSpan = th.querySelector(".sort-ico");
      icoSpan.className = "sort-ico";
      if (th.dataset.key === sortKey) {
        icoSpan.classList.add(sortDir === "asc" ? "asc" : "desc");
      }
    });
  }

  // ---- Event wiring ----
  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      if (sortKey === key) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDir = "asc";
      }
      updateSortIcons();
      applyAndRender();
    });
  });

  let searchTimer = null;
  let activeSuggestionIndex = -1;

  function renderSuggestions(term) {
    if (!term) {
      searchSuggestions.hidden = true;
      searchSuggestions.innerHTML = "";
      return;
    }
    const matches = allData
      .filter((d) => d.title.toLowerCase().includes(term) || d.category.toLowerCase().includes(term))
      .slice(0, 6);

    if (matches.length === 0) {
      searchSuggestions.hidden = true;
      searchSuggestions.innerHTML = "";
      return;
    }

    activeSuggestionIndex = -1;
    searchSuggestions.innerHTML = matches.map((m) => `
      <li data-slno="${m.slNo}">
        <span class="s-title">${highlight(escapeHtml(m.title), term)}</span>
        <span class="s-cat">${escapeHtml(m.category)}</span>
      </li>`).join("");
    searchSuggestions.hidden = false;
  }

  function pickSuggestion(slNo) {
    const item = allData.find((d) => d.slNo === slNo);
    if (!item) return;
    searchInput.value = item.title;
    searchSuggestions.hidden = true;
    searchSuggestions.innerHTML = "";
    currentPage = 1;
    applyAndRender();
  }

  searchSuggestions.addEventListener("mousedown", (e) => {
    // mousedown (not click) fires before the input's blur, so the
    // suggestion can be read before the dropdown would otherwise close.
    const li = e.target.closest("li");
    if (!li) return;
    e.preventDefault();
    pickSuggestion(parseInt(li.dataset.slno, 10));
  });

  searchInput.addEventListener("keydown", (e) => {
    const items = Array.from(searchSuggestions.querySelectorAll("li"));
    if (searchSuggestions.hidden || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, items.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
    } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      pickSuggestion(parseInt(items[activeSuggestionIndex].dataset.slno, 10));
      return;
    } else if (e.key === "Escape") {
      searchSuggestions.hidden = true;
      return;
    } else {
      return;
    }
    items.forEach((el, i) => el.classList.toggle("active", i === activeSuggestionIndex));
  });

  searchInput.addEventListener("blur", () => {
    // slight delay so a mousedown on a suggestion is still processed
    setTimeout(() => { searchSuggestions.hidden = true; }, 120);
  });

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim()) renderSuggestions(searchInput.value.trim().toLowerCase());
  });

  searchInput.addEventListener("input", () => {
    renderSuggestions(searchInput.value.trim().toLowerCase());
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentPage = 1;
      applyAndRender();
    }, 200);
  });

  categoryFilter.addEventListener("change", () => { currentPage = 1; applyAndRender(); });
  applyBtn.addEventListener("click", () => { currentPage = 1; applyAndRender(); });

  pageSizeSelect.addEventListener("change", () => {
    pageSize = parseInt(pageSizeSelect.value, 10);
    currentPage = 1;
    applyAndRender();
  });

  function clearFilters() {
    categoryFilter.value = "";
    searchInput.value = "";
    currentPage = 1;
    applyAndRender();
  }
  resetBtn.addEventListener("click", clearFilters);
  emptyResetBtn.addEventListener("click", clearFilters);

  // ---- Live clock ----
  function tickClock() {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-GB", {
      weekday: "short", day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    });
    liveClock.textContent = fmt.format(now);
  }
  tickClock();
  setInterval(tickClock, 1000);

  // ---- Init ----
  fetch("notification.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load notification.json");
      return res.json();
    })
    .then((data) => {
      allData = data;
      populateCategoryOptions();
      updateSortIcons();
      applyAndRender();
    })
    .catch((err) => {
      tableBody.innerHTML = `<tr><td colspan="6" style="padding:24px;text-align:center;color:#a83a26;">
        Could not load notification.json — ${escapeHtml(err.message)}.
        If you opened this file directly (file://), please serve it via GitHub Pages or a local server instead.
      </td></tr>`;
      resultCount.textContent = "0";
    });
})();
