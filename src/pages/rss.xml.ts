import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../config';
import { extractExcerpt, getPostSlug, getPublishedPosts } from '../utils/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary ?? extractExcerpt(post.body, 160),
      link: `/posts/${getPostSlug(post)}/`,
    })),
    customData: '<language>zh-cn</language>',
  });
}
