import type { APIRoute } from 'astro';
import { extractExcerpt, formatDate, getPostSlug, getPublishedPosts } from '../utils/posts';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const payload = posts.map((post) => ({
    slug: getPostSlug(post),
    title: post.data.title,
    date: formatDate(post.data.date),
    source: post.data.source,
    tags: post.data.tags,
    summary: post.data.summary ?? extractExcerpt(post.body, 140),
    content: (post.body ?? '')
      .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ' '))
      .replace(/[#>*_`[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  }));

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
