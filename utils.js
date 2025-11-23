/**
 * Returns the currently active tab in the user's focused window.
 *
 * @returns {Promise<chrome.tabs.Tab>} The active browser tab.
 *
 * @example
 * const activeTab = await getActiveTabURL();
 * console.log(activeTab.url);
 */
export async function getActiveTabURL() {
    const queryOptions = { active: true, currentWindow: true };

    // chrome.tabs.query returns an array, but we only need the first result
    const [tab] = await chrome.tabs.query(queryOptions);

    return tab;
}
