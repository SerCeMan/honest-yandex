import {fetchArticlesFromRss} from "./articles";

// The job of the background worker is to load all articles form RSS, and save them.

async function main() {
    // TODO: cache articles to avoid loading them every time.
    const articles = await fetchArticlesFromRss();
    await chrome.storage.sync.set({'articles': articles});
    console.log('news articles saved');
}

main()

