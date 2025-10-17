function isSponsoredSvg(svg) {
  if (!svg || svg.tagName.toLowerCase() !== 'svg') return false;

  const viewBox = svg.getAttribute('viewBox');
  if (viewBox !== '0 0 68 14') return false;

  const path = svg.querySelector('path');
  if (!path || path.getAttribute('d').length < 1000) return false;

  const fill = path.getAttribute('fill');
  if (fill !== '#7f869f') return false;

  return true;
}

function hideSponsoredBlocks() {
  const svgs = Array.from(document.querySelectorAll('svg'));
  const sponsoredSvgs = svgs.filter(isSponsoredSvg);

  sponsoredSvgs.forEach(svg => {
    let parent = svg;

    // Zwei Ebenen hoch gehen, oder bis zum nächsten <div>
    for (let i = 0; i < 2; i++) {
      if (parent) parent = parent.parentElement;
    }

    if (parent && parent.tagName.toLowerCase() === 'div') {
      parent.style.display = 'none';
    }
  });
}

function setup() {
  hideSponsoredBlocks();

  const observer = new MutationObserver(() => {
    hideSponsoredBlocks();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  window.addEventListener('load', setup);
} else {
  setup();
}
