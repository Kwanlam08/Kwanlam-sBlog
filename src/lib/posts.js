import { marked } from 'marked';

const sources = import.meta.glob('../../_posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function value(source, key) {
  return source.match(new RegExp(`^${key}:\\s*[\\"']?([^\\n\\"']*)`, 'm'))?.[1]?.trim() ?? '';
}

function list(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*\\n((?:\\s+-\\s+.*\\n?)*)`, 'm'));
  return match ? [...match[1].matchAll(/^\s+-\s+(.+)$/gm)].map((item) => item[1].trim()) : [];
}

function image(source) {
  const match = source.match(/^image:\s*\n\s+path:\s*([^\n]+)$/m);
  return match?.[1].trim().replace(/^\/assets/, '') ?? '';
}

export function getPosts() {
  return Object.entries(sources)
    .map(([path, source]) => {
      const [, body = ''] = source.split(/^---\s*$/m).slice(1);
      const name = path.split('/').at(-1).replace(/\.md$/, '');
      const slug = name.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      return {
        slug,
        title: value(source, 'title') || slug,
        date: value(source, 'date'),
        categories: list(source, 'categories'),
        tags: list(source, 'tags'),
        image: image(source),
        body,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPost(slug) {
  return getPosts().find((post) => post.slug === slug);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));
}

export function readingTime(body) {
  return Math.max(1, Math.ceil(body.replace(/\s/g, '').length / 450));
}

export function renderMarkdown(body) {
  return marked.parse(body, { breaks: true });
}
