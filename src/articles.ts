import meduzaIcon from './icons/meduza.ico';
import mediazonaIcon from './icons/mediazona.ico';
import currentTimeIcon from './icons/current-time.ico';
import theVillageIcon from './icons/the-village.ico';
import Parser from "rss-parser";

// When adding more sources, make sure to update the "host_permissions" section
// of the manifest to avoid CORS errors when loading the RSS feed.
type SourceId =
    'currenttime' |
    'mediazona' |
    'meduza' |
    'thevillage'

// The list of actual news sources, the bloody legends that continued working even
// when the government awarded them with the painful badge of honor - "Foreign Agent".
// As if this wasn't enough, most of the links below are sadly blocked by internet providers.
//
// If you're reading this, make sure to donate some money to these legends to make sure
// that they can continue publishing high quality news.
const sources: Source[] = [
    {
        id: 'currenttime',
        title: 'Настоящее Время',
        icon: currentTimeIcon,
        rssUrl: 'https://www.currenttime.tv/api/zg$ip_e_tpp_'
    },
    {
        id: 'mediazona',
        title: 'Mediazona',
        icon: mediazonaIcon,
        rssUrl: 'https://zona.media/rss'
    },
    {
        id: 'meduza',
        title: 'Meduza',
        icon: meduzaIcon,
        rssUrl: 'https://meduza.io/rss/news'
    },
    {
        id: 'thevillage',
        title: 'The Village',
        icon: theVillageIcon,
        rssUrl: 'https://www.the-village.ru/api/spaces/2/rss.xml'
    },
]

function sourceById(sourceId: SourceId): Source {
    const source = sources.find(source => source.id === sourceId);
    if (!source) {
        throw Error('unknown source: ' + sourceId)
    }
    return source;
}

export interface Source {
    id: SourceId;
    title: string;
    icon: any;
    rssUrl: string;
}

export interface Article {
    source: Source;
    title: string;
    link: string;
    pubDate: number;
}

interface News {
    sourceId: SourceId
    title: string;
    link: string;
    pubDate: number;
}

type ParsedRSS = { [p: string]: any } & Parser.Output<{ [p: string]: any }>

export async function loadArticles(): Promise<Article[]> {
    const items = await chrome.storage.sync.get(['articles']);
    const news = items['articles'] as News[]
    return news.map(newsItem => ({...newsItem, source: sourceById(newsItem.sourceId)}))
}

export async function fetchArticlesFromRss(): Promise<News[]> {
    const promises: { source: Source, promise: Promise<ParsedRSS> }[] = []
    for (let source of sources) {
        const parser = new Parser();
        promises.push({source: source, promise: parser.parseURL(source.rssUrl)})
    }

    const news: News[] = []
    for (let {source, promise} of promises) {
        try {
            const feed = await promise;
            for (let item of feed.items.slice(0, 5)) {
                if (item.title && item.link && item.pubDate) {
                    news.push({
                        sourceId: source.id,
                        title: item.title,
                        link: item.link,
                        pubDate: new Date(item.pubDate).getTime()
                    });
                }
            }
        } catch (e) {
            console.error(`failed to fetch '${source.id}' feed`, e)
        }
    }
    // show new first
    news.sort((news1, news2) => news2.pubDate - news1.pubDate)
    return news
}