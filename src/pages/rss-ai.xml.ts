import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../config';
import { buildRssItems, getPublishedPosts } from '../utils/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts('ai');
  return rss({
    title: `${SITE.title} · AI 生成`,
    description: `${SITE.description}（仅包含自动化 AI 生成并审核发布的文章）`,
    site: context.site ?? SITE.url,
    items: buildRssItems(posts),
    customData: '<language>zh-cn</language>',
  });
}
