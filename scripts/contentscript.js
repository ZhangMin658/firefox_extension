"use strict";
var injectedScripts = ["scripts/lodash.min.js", "scripts/inline.js"];
!function e() {
    return window.document && window.document.head ? void function t(e) {
        var i = e.shift();
        if (i) {
            var n = document.createElement("script");
            n.src = chrome.runtime.getURL(i + "?t=" + Date.now()), n.onload = t.bind(this, e), document.head.appendChild(n)
        }
    }(injectedScripts) : setTimeout(e, 10)
}();
var CHROME_EXT_DEFAULT_EVENT_NAME99 = "chrome-ext-activecalleb-99";
window.addEventListener(CHROME_EXT_DEFAULT_EVENT_NAME99, function (e) {
    var t = e.detail;
    t.host && console.log("a message from host", t)
});
//# sourceMappingURL=contentscript.js.map
