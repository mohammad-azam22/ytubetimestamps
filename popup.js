import { getActiveTabURL } from "./utils.js";

/**
 * Creates a new bookmark DOM element and appends it to the bookmark list.
 *
 * @param {HTMLElement} bookmarkElement - The container where bookmarks are displayed.
 * @param {{time: number, desc: string}} bookmark - Bookmark data containing timestamp and description.
 */
const addNewBookmark = (bookmarkElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlsElement = document.createElement("div");

    // Title text (bookmark description)
    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    controlsElement.className = "bookmark-controls";

    // Root bookmark element
    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    // Interactive buttons for bookmark actions
    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    // Build the element structure
    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarkElement.appendChild(newBookmarkElement);
};

/**
 * Renders all bookmarks for the current video.
 *
 * @param {Array<{time: number, desc: string}>} currentBookmarks - List of stored bookmarks.
 */
const viewBookmarks = (currentBookmarks = []) => {
    const bookmarkElement = document.getElementById("bookmarks");
    bookmarkElement.innerHTML = ``;

    if (currentBookmarks.length > 0) {
        currentBookmarks.forEach(bookmark =>
            addNewBookmark(bookmarkElement, bookmark)
        );
    } else {
        bookmarkElement.innerHTML = `<i>No bookmarks to show.</i>`;
    }
};

/**
 * Sends a message to the content script to play the video at the bookmark time.
 *
 * @param {Event} e - Click event for the play icon.
 */
const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    });
};

/**
 * Deletes a bookmark from the DOM and notifies the content script.
 *
 * @param {Event} e - Click event for the delete icon.
 */
const onDelete = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

    // Remove bookmark from popup display
    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    // Notify content script to remove bookmark from storage
    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime
    });
};

/**
 * Creates a bookmark control button (play/delete) and attaches a click handler.
 *
 * @param {"play" | "delete"} src - The icon name (from assets).
 * @param {(e: Event) => void} eventListener - Handler for click events.
 * @param {HTMLElement} controlParentElement - Parent container for control icons.
 */
const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");

    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);

    controlParentElement.appendChild(controlElement);
};

/**
 * Initializes the popup by checking the active YouTube video
 * and loading bookmarks for that video from storage.
 */
document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    // Verify the page is a YouTube watch page with a valid video ID
    if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
        chrome.storage.local.get([currentVideo], data => {
            const currentVideoBookmarks =
                data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

            viewBookmarks(currentVideoBookmarks);
        });
    } else {
        // Not a YouTube watch page — show fallback message
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = `<div class="title">This is not a YouTube video page.</div>`;
    }
});
