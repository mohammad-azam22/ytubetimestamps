/**
 * Listens for updates to any browser tab. When a YouTube watch page
 * finishes loading (or its URL changes), this sends a message to the
 * content script indicating that a new video is active.
 *
 * The content script then uses this message to:
 *  - reset state
 *  - load bookmarks for the new video
 *  - update the YouTube UI (bookmark button, scrubbers, etc.)
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// Only proceed if the tab has a valid URL and it's a YouTube watch page
	if (tab.url && tab.url.includes("youtube.com/watch")) {
		const queryParameters = tab.url.split("?")[1];
		const urlParameters = new URLSearchParams(queryParameters);

		// Notify the content script of the new video
		chrome.tabs.sendMessage(tabId, {
			type: "NEW",
			videoId: urlParameters.get("v")
		});
	}
});
