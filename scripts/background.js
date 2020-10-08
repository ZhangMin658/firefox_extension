"use strict";
chrome.runtime.onInstalled.addListener(function (e) {
    console.log("previousVersion", e.previousVersion)
}), chrome.tabs.onUpdated.addListener(function (e) {
    chrome.pageAction.show(e)
});
//# sourceMappingURL=background.js.map