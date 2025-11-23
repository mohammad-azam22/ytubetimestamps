/**
 * Cached references for YouTube UI and state.
 * @type {HTMLElement | null}
 */
let youtubeRightControls, youtubePlayer;

/**
 * The currently active YouTube video's ID.
 * @type {string}
 */
let currentVideo = "";

/**
 * Array of all bookmarks associated with the current video.
 * @type {{time: number, desc: string}[]}
 */
let currentVideoBookmarks = [];

/**
 * Listener for messages from the extension's background/popup scripts.
 * Handles bookmark creation, playback jumping, and bookmark deletion.
 */
chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
        // A new video has been loaded, so refresh UI and stored bookmarks.
        currentVideo = videoId;
        newVideoLoaded();
    }
    else if (type === "PLAY") {
        // Jump the YouTube video to the stored timestamp.
        youtubePlayer.currentTime = value;
    }
    else if (type === "DELETE") {
        // Remove the bookmark scrubber UI and update storage.
        document.getElementById(value)?.remove();
        currentVideoBookmarks = currentVideoBookmarks.filter(b => b.time != value);

        chrome.storage.local.set({
            [currentVideo]: JSON.stringify(currentVideoBookmarks)
        });

        response(currentVideoBookmarks);
    }
});

/**
 * Handles initializing UI elements when a new video loads.
 * - Fetches existing bookmarks
 * - Injects the bookmark button if missing
 */
const newVideoLoaded = async () => {
    const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

    await fetchBookmarks();

    // Only add a bookmark button if it isn't already present
    if (!bookmarkBtnExists) {
        const bookmarkImg = document.createElement("img");
        bookmarkImg.src = chrome.runtime.getURL("assets/bookmark.png");
        bookmarkImg.style = "height: 50%;";

        const bookmarkBtn = document.createElement("button");
        bookmarkBtn.appendChild(bookmarkImg);
        bookmarkBtn.className = "ytp-button bookmark-btn";
        bookmarkBtn.style = "display: flex; align-items: center; justify-content: center;";
        bookmarkBtn.title = "Click to bookmark current timestamp";

        youtubeRightControls = document.getElementsByClassName("ytp-right-controls-left")[0];
        youtubePlayer = document.getElementsByClassName("video-stream")[0];

        youtubeRightControls.appendChild(bookmarkBtn);
        youtubeRightControls.insertBefore(bookmarkBtn, youtubeRightControls.firstChild);

        bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
};

/**
 * Loads bookmarks from storage and draws the scrubbers (markers on the progress bar).
 *
 * @returns {Promise<Array<{time: number, desc: string}>>}
 */
const fetchBookmarks = () => {
    return new Promise((resolve) => {
        chrome.storage.local.get([currentVideo], async (obj) => {
            const bookmarks = obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [];

            for (let bookmark of bookmarks) {
                // Skip if scrubber already exists
                if (document.getElementById(bookmark.time)) continue;

                const duration = await getYouTubeContentDuration();
                const progressBarWidth =
                    document.getElementsByClassName("ytp-progress-list")[0].clientWidth - 9;

                const position = (bookmark.time / duration) * progressBarWidth;

                // Create scrubber marker
                const bookmarkScrubber = document.createElement("div");
                bookmarkScrubber.id = bookmark.time;
                bookmarkScrubber.className = "bookmark-scrubber";
                bookmarkScrubber.style =
                    `top:-3px; left:-3px; position:absolute; height:10px; width:10px; 
                     background: rgb(6, 173, 192); z-index:43; transform:translateX(${position}px);`;

                document.getElementsByClassName("ytp-progress-list")[0].prepend(bookmarkScrubber);
            }

            resolve(bookmarks);
        });
    });
};

/**
 * Adds a new bookmark at the video's current timestamp.
 *
 * @param {MouseEvent} e - The click event from the bookmark button icon.
 */
const addNewBookmarkEventHandler = async (e) => {
    // Do not allow bookmarks during YouTube ads
    if (isAdPlaying()) return;

    // Visual feedback (filled bookmark icon)
    e.target.src = chrome.runtime.getURL("assets/bookmark_filled.png");
    setTimeout(() => {
        e.target.src = chrome.runtime.getURL("assets/bookmark.png");
    }, 1000);

    const duration = await getYouTubeContentDuration();
    const progressBarWidth =
        document.getElementsByClassName("ytp-progress-list")[0].clientWidth - 9;

    const position = (youtubePlayer.currentTime / duration) * progressBarWidth;

    // Create scrubber dot
    const bookmarkScrubber = document.createElement("div");
    bookmarkScrubber.style =
        `top:-3px; left:-3px; position:absolute; height:10px; width:10px; 
         background: rgb(6, 173, 192); z-index:43; transform:translateX(${position}px);`;

    bookmarkScrubber.id = youtubePlayer.currentTime;
    bookmarkScrubber.className = "bookmark-scrubber";

    document.getElementsByClassName("ytp-progress-list")[0].prepend(bookmarkScrubber);

    const currentTime = youtubePlayer.currentTime;

    // New bookmark entry
    const newBookmark = {
        time: currentTime,
        desc: "Bookmark at: " + formatTime(currentTime)
    };

    currentVideoBookmarks = await fetchBookmarks();

    // Save updated bookmark list
    chrome.storage.local.set({
        [currentVideo]: JSON.stringify(
            [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
        )
    });
};

/**
 * Converts seconds to HH:MM:SS format.
 *
 * @param {number} seconds
 * @returns {string}
 */
const formatTime = (seconds) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substring(11, 19);
};

/**
 * Detects whether a YouTube advertisement is currently playing.
 *
 * @returns {boolean}
 */
const isAdPlaying = () => {
    const player = document.querySelector(".html5-video-player");
    return player && player.classList.contains("ad-showing");
};

/**
 * Retrieves the duration of the actual YouTube video (not ads)
 * by messaging the injected script running in the page context.
 *
 * @returns {Promise<number | null>}
 */
function getYouTubeContentDuration() {
    return new Promise((resolve) => {
        const handler = (event) => {
            if (event.data?.type === "VIDEO_DURATION_RESPONSE") {
                window.removeEventListener("message", handler);
                resolve(event.data.duration || null);
            }
        };

        window.addEventListener("message", handler);

        // Ask the page for the real video duration
        window.postMessage({ type: "GET_VIDEO_DURATION" }, "*");
    });
}

/**
 * Self-invoking initialization routine.
 * - Loads UI
 * - Injects pageBridge.js (to access YouTube's internal player API)
 * - Loads existing bookmarks
 */
(async () => {
    newVideoLoaded();

    // Inject pageBridge script into YouTube's context to access player APIs
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("pageBridge.js");
    document.documentElement.appendChild(script);
    script.remove();

    await fetchBookmarks();
})();
