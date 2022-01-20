chrome.commands.onCommand.addListener(function(command) {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/newtab.html') });
});
