import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'posts'>;
export type PostSource = 'manual' | 'ai';

/**
 * Strip optional `YYYY-MM-DD-` prefix and `.md` extension from `post.id`
 * so filenames like `2026-11-18-my-post.md` map cleanly to `/posts/my-post/`.
 */
export function getPostSlug(post: BlogPost): string {
  return post.id
    .replace(/\.md$/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

export async function getPublishedPosts(source?: PostSource): Promise<BlogPost[]> {
  const posts = await getCollection('posts', ({ data }) => {
    if (data.draft) return false;
    if (source && data.source !== source) return false;
    return true;
  });
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getSourceMeta(source: PostSource): {
  label: string;
  shortLabel: string;
  className: string;
  description: string;
} {
  if (source === 'ai') {
    return {
      label: 'AI 生成',
      shortLabel: 'AI',
      className: 'source-badge source-ai',
      description: '由自动化工作流基于仓库提交记录或技术资料整理生成，经人工审核发布',
    };
  }
  return {
    label: '手写原创',
    shortLabel: '手写',
    className: 'source-badge source-manual',
    description: '作者亲手撰写与实机记录',
  };
}

export function getRelatedPosts(current: BlogPost, allPosts: BlogPost[], limit = 3): BlogPost[] {
  const currentSlug = getPostSlug(current);
  const currentTags = new Set(current.data.tags.map((t) => t.toLowerCase()));

  return allPosts
    .filter((p) => getPostSlug(p) !== currentSlug)
    .map((p) => {
      const overlap = p.data.tags.reduce(
        (acc, t) => acc + (currentTags.has(t.toLowerCase()) ? 1 : 0),
        0
      );
      return { post: p, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap || b.post.data.date.getTime() - a.post.data.date.getTime())
    .slice(0, limit)
    .map((item) => item.post);
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function estimateReadingTime(body: string | undefined): { minutes: number; words: number } {
  const text = (body ?? '').replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
  const cjkChars = (text.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) ?? []).length;
  const latinWords = (text.replace(/[\u4e00-\u9fff\u3040-\u30ff]/g, ' ').match(/[A-Za-z0-9_]+/g) ?? []).length;
  const totalUnits = cjkChars + latinWords;
  const minutes = Math.max(1, Math.ceil(totalUnits / 360));
  return { minutes, words: totalUnits };
}

export function extractExcerpt(body: string | undefined, maxLen = 150): string {
  if (!body) return '';
  const plain = body
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~>-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1).trimEnd()}…`;
}

export function getAllTags(posts: BlogPost[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

export function buildRssItems(posts: BlogPost[]) {
  return posts.map((post) => ({
    title: post.data.title,
    pubDate: post.data.date,
    description: post.data.summary ?? extractExcerpt(post.body, 160),
    link: `/posts/${getPostSlug(post)}/`,
    categories: [post.data.source, ...post.data.tags],
  }));
}
