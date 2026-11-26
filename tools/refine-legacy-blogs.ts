import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import revisions from '../src/data/legacyBlogRefinements.json';

loadEnvConfig(process.cwd());
const prisma = new PrismaClient({ log: [] });
const apply = process.argv.includes('--apply');
const backupArg = process.argv.find((arg) => arg.startsWith('--backup-dir='));
const digest = (content: string) => createHash('sha256').update(content).digest('hex');

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: { slug: { in: revisions.posts.map((post) => post.slug) } },
  });

  const pending = revisions.posts.flatMap((revision) => {
    const post = posts.find((item) => item.slug === revision.slug);
    if (!post || !post.published) throw new Error(`Published post missing: ${revision.slug}`);
    if (post.title !== revision.expectedTitle) throw new Error(`Title changed; review before applying: ${post.slug}`);
    if (digest(revision.content) !== revision.contentSha256) throw new Error(`Revision checksum mismatch: ${post.slug}`);
    if (digest(post.content) === revision.contentSha256) return [];
    if (digest(post.content) !== revision.expectedContentSha256) {
      throw new Error(`Content changed since backup; review before applying: ${post.slug}`);
    }
    return [{ post, revision }];
  });

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', pending: pending.map(({ post }) => post.slug), alreadyCurrent: posts.length - pending.length }));
    return;
  }
  if (!pending.length) {
    console.log(JSON.stringify({ mode: 'apply', updated: 0, alreadyCurrent: posts.length }));
    return;
  }
  if (!backupArg) throw new Error('--backup-dir=/absolute/private/path is required with --apply');
  const backupDir = backupArg.slice('--backup-dir='.length);
  if (!path.isAbsolute(backupDir)) throw new Error('Backup directory must be an absolute path');
  const relative = path.relative(process.cwd(), path.resolve(backupDir));
  if (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)) {
    throw new Error('Store CMS backups outside the application directory');
  }
  fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  const backupFile = path.join(backupDir, `legacy-posts-before-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify({ capturedAt: new Date().toISOString(), revision: revisions.revision, posts }, null, 2), { flag: 'wx', mode: 0o600 });

  await prisma.$transaction(async (tx) => {
    for (const { post, revision } of pending) {
      // Update only the body. Preserve titles, URLs, publication dates, tags,
      // image/author fields, comments and counters; reject concurrent edits.
      const result = await tx.blogPost.updateMany({
        where: { id: post.id, slug: post.slug, title: post.title, content: post.content, published: true, updatedAt: post.updatedAt },
        data: { content: revision.content },
      });
      if (result.count !== 1) throw new Error(`Concurrent edit detected; transaction rolled back: ${post.slug}`);
    }
  });

  console.log(JSON.stringify({ mode: 'apply', updated: pending.length, backupFile }));
}

main().catch((error: unknown) => {
  // Do not serialize Prisma's connection/configuration details into logs.
  console.error(error instanceof Error && !error.name.startsWith('Prisma') ? error.message : 'Database operation failed; no connection details logged');
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
