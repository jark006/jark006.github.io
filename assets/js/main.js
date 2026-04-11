// ============================================================
// Blog — Interactive features (vanilla JS + Alpine.js)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initTOC();
  initCodeCopy();
  initLightbox();
});

// -----------------------------------------------------------
// Scroll-based fade-in animations (IntersectionObserver)
// -----------------------------------------------------------
function initScrollAnimations() {
  const items = document.querySelectorAll('.fade-in');
  if (items.length === 0) return;

  const revealItem = (item) => {
    item.classList.add('visible');
  };

  const isInViewport = (item) => {
    const rect = item.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealItem(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px 50px 0px' }
  );

  items.forEach((item) => {
    if (isInViewport(item)) {
      revealItem(item);
      return;
    }

    observer.observe(item);
  });
}

// -----------------------------------------------------------
// Table of Contents — generate + scroll spy
// -----------------------------------------------------------
function initTOC() {
  const article = document.getElementById('post-content');
  if (!article) return;

  const headings = article.querySelectorAll('h2, h3');
  if (headings.length === 0) return;

  // Build TOC
  const tocData = [];
  headings.forEach((h, i) => {
    if (!h.id) h.id = 'heading-' + i;
    tocData.push({
      el: h,
      id: h.id,
      text: h.textContent,
      level: h.tagName.toLowerCase() === 'h2' ? 2 : 3,
    });
  });

  // Sidebar TOC
  const sidebar = document.querySelector('.toc-sidebar');
  if (sidebar) {
    const tocContent = buildTOCHTML(tocData);
    sidebar.innerHTML = '<div class="toc-title">目录</div>' + tocContent;

    // Click to scroll
    sidebar.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // Mobile TOC
  const mobileToc = document.querySelector('.mobile-toc');
  if (mobileToc) {
    mobileToc.innerHTML = buildTOCHTML(tocData);
    mobileToc.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // Scroll spy — highlight active heading
  const tocLinks = document.querySelectorAll('.toc-sidebar a, .mobile-toc a');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          tocLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    },
    { rootMargin: '-80px 0px -66% 0px', threshold: 0 }
  );

  tocData.forEach((item) => observer.observe(item.el));
}

function buildTOCHTML(tocData) {
  let html = '<ul class="toc-list">';
  let currentLevel = 2;

  tocData.forEach((item, index) => {
    // Open nested list for h3 if previous was h2
    if (item.level === 3 && currentLevel === 2) {
      html += '<ul class="toc-sublist">';
    }
    // Close nested list if going back from h3 to h2
    if (item.level === 2 && currentLevel === 3) {
      html += '</ul>';
    }

    html += '<li class="toc-item toc-item--level-' + item.level + '">';
    html += '<a href="#' + item.id + '">' + item.text + '</a>';
    html += '</li>';

    currentLevel = item.level;
  });

  // Close any remaining open nested list
  if (currentLevel === 3) {
    html += '</ul>';
  }

  html += '</ul>';
  return html;
}

// -----------------------------------------------------------
// Code block copy buttons
// -----------------------------------------------------------
function initCodeCopy() {
  const blocks = document.querySelectorAll('pre > code');
  if (blocks.length === 0) return;

  blocks.forEach((code) => {
    const pre = code.parentElement;

    // Only wrap if not already wrapped
    if (pre.parentElement.classList.contains('code-block-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    // Copy button
    const btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制代码');

    btn.addEventListener('click', () => {
      let text;

      // If the code block uses Rouge with line numbers, only copy the .rouge-code cell
      const rougeTable = code.querySelector('table.rouge-table');
      if (rougeTable) {
        const rougeCodeCell = rougeTable.querySelector('.rouge-code pre, .rouge-code code');
        text = rougeCodeCell ? rougeCodeCell.textContent.replace(/\n$/, '') : code.textContent.replace(/\n$/, '');
      } else {
        text = code.textContent.replace(/\n$/, '');
      }

      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '已复制';
        btn.classList.add('copied');
        showToast('已复制到剪贴板');
        setTimeout(() => {
          btn.textContent = '复制';
          btn.classList.remove('copied');
        }, 2000);
      });
    });

    wrapper.appendChild(btn);
  });
}

// -----------------------------------------------------------
// Toast notification (for copy feedback)
// -----------------------------------------------------------
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// -----------------------------------------------------------
// Lightbox for post images
// -----------------------------------------------------------
function initLightbox() {
  const article = document.getElementById('post-content');
  if (!article) return;

  const images = article.querySelectorAll('img');
  if (images.length === 0) return;

  // Use Alpine's lightbox component
  images.forEach((img) => {
    img.addEventListener('click', () => {
      const lb = Alpine.$data(document.querySelector('.lightbox'));
      if (lb) {
        lb.show(img.src, img.alt);
      }
    });
  });
}

// Make showToast globally accessible
window.showToast = showToast;
