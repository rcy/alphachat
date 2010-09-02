function() {
  window.scrollBy(0, 100000000000000000);

  if (!GLOBAL.focus) {
    GLOBAL.unread++;
    updateTitle();
  }
}
