// background.js - minimal, injiziert content.js, nutzt browser.* (Firefox-friendly) mit Fallback zu chrome.*

const BROWSER = (typeof browser !== 'undefined') ? browser : chrome;

// Helper: inject content.js into a tab if URL matches startpage
function maybeInject(tabId, changeInfo, tab) {
  try {
    const url = tab && tab.url ? tab.url : '';
    if (changeInfo.status === 'complete' && /https?:\/\/(www\.)?startpage\.com/.test(url)) {
      // browser.tabs.executeScript / chrome.tabs.executeScript
      const details = { file: 'content.js' };
      if (BROWSER.tabs && BROWSER.tabs.executeScript) {
        BROWSER.tabs.executeScript(tabId, details, () => {
          // ignore errors (e.g., if frame navigation prevented injection)
          if (BROWSER.runtime && BROWSER.runtime.lastError) {
            console.warn('Injection error:', BROWSER.runtime.lastError);
          } else {
            console.log('Injected content.js into', url);
          }
        });
      } else if (chrome.tabs && chrome.tabs.executeScript) {
        chrome.tabs.executeScript(tabId, details, () => {
          if (chrome.runtime.lastError) {
            console.warn('Injection error:', chrome.runtime.lastError);
          } else {
            console.log('Injected content.js into', url);
          }
        });
      }
    }
  } catch (e) {
    console.error('maybeInject error', e);
  }
}

BROWSER.tabs.onUpdated.addListener(maybeInject);

// Optional: inject into all matching existing tabs on install
BROWSER.runtime.onInstalled.addListener(() => {
  BROWSER.tabs.query({url: ["*://*.startpage.com/*", "*://startpage.com/*"]}, tabs => {
    for (const t of tabs) {
      try {
        if (BROWSER.tabs && BROWSER.tabs.executeScript) {
          BROWSER.tabs.executeScript(t.id, { file: 'content.js' });
        } else if (chrome.tabs && chrome.tabs.executeScript) {
          chrome.tabs.executeScript(t.id, { file: 'content.js' });
        }
      } catch (e) {
        console.warn('onInstalled injection failed for tab', t.id, e);
      }
    }
  });
});
