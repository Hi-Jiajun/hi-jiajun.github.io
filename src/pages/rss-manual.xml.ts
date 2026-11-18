import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../config';
import { buildRssItems, getPublishedPosts } from '../utils/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts('manual');
  return rss({
    title: `${SITE.title} · 手写原创`,
    description: `${SITE.description}（仅包含作者手写原创文章）`,
    site: context.site ?? SITE.url,
    items: buildRssItems(posts),
    customData: '<language>zh-cn</language>',
  });
}
