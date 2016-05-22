chrome.commands.onCommand.addListener(function(command) {
  chrome.tabs.create({ url: chrome.extension.getURL('src/newtab.html') });
});
