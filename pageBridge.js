/**
 * Listens for messages from other scripts (e.g., content scripts)
 * requesting the current video's duration. This is needed because
 * YouTube's player API is only accessible from the page context,
 * not directly from an extension's content script.
 *
 * When a message of type "GET_VIDEO_DURATION" is received:
 *  - It attempts to access the YouTube player (`movie_player`)
 *  - Reads the duration via player.getDuration() if available
 *  - Sends back a "VIDEO_DURATION_RESPONSE" message containing the duration
 */
window.addEventListener("message", (event) => {
    // Ignore unrelated messages
    if (event.data?.type === "GET_VIDEO_DURATION") {
        const player = document.getElementById("movie_player");
        let duration = null;

        try {
            // YouTube's player object exposes getDuration() only after it's ready
            if (player && typeof player.getDuration === "function") {
                duration = player.getDuration();
            }
        } catch (e) {
            // Player API might not be ready or may throw; fail silently
        }

        // Respond back to the page/content script with the duration
        window.postMessage(
            {
                type: "VIDEO_DURATION_RESPONSE",
                duration
            },
            "*"
        );
    }
});
