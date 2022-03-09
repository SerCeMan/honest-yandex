import {Article, loadArticles} from "./articles";

// Let's show Yandex how to make news honest.
//
// Let us praise the momentous burden
// that the people’s leader assumes, in tears.
// Let us praise the twilight burden of power,
// its weight too great to be borne.
// Time, whoever has a heart
// will hear your ship going down.

function honestifyNews(newsArticles: Article[]) {
    const newsLists = document.getElementsByClassName('list news__list');
    if (!newsLists.length) {
        return;
    }
    const newsList = newsLists[0]

    for (let i = 0; i < newsList.childNodes.length; i++) {
        const newsNode = newsList.childNodes[i] as Element;
        const replacement = newsArticles[i];


        // Update the news title
        const contentNode = newsNode.getElementsByClassName('news__item-content')[0];
        contentNode.textContent = replacement.title

        // Update the article URL
        const link = newsNode.getElementsByClassName('list__item-content')[0] as HTMLLinkElement
        link.href = replacement.link

        // Replace the icon with the one from the source
        const iconNode = newsNode.getElementsByClassName('news__agency-icon')[0] as HTMLDivElement
        const source = replacement.source
        iconNode.title = source.title
        iconNode.style.backgroundImage = `url("${source.icon}")`

        // Remove all "show similar" icons
        let addMoreElements = newsNode.getElementsByClassName('news__extra-content-arrow-button');
        for (let j = 0; j < addMoreElements.length; j++) {
            addMoreElements[j].remove()
        }
    }
}

function upgradeMoreButton(articles: Article[]) {
    const showMoreButtons = document.getElementsByClassName('news__arrow-button-text');
    if (!showMoreButtons.length) {
        return;
    }
    const button = showMoreButtons[0];
    button.addEventListener('click', (e) => {
        console.log("making news honest")
        // The below 0 timeout is a hack to delay the update of the list, and push honestifying
        // to the end of the event loop.
        // TODO: find a clean way to add an update listener to the list of news
        //  to avoid reacting on a button lick.
        setTimeout(() => { honestifyNews(articles)}, 0)
    })
}

async function main() {
    const articles = await loadArticles();

    console.log(articles)
    honestifyNews(articles)
    upgradeMoreButton(articles)
}

main();
