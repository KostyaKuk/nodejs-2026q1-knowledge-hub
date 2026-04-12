import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.article.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      login: 'admin@knowledge.com',
      password: 'admin123',
      role: 'ADMIN',
    },
  });

  const editor = await prisma.user.create({
    data: {
      login: 'editor@knowledge.com',
      password: 'editor123',
      role: 'EDITOR',
    },
  });

  console.log(`✅ Created users`);

  const technology = await prisma.category.create({
    data: {
      name: 'Technology',
      description: 'Articles about programming, software, and tech innovations',
    },
  });

  const science = await prisma.category.create({
    data: {
      name: 'Science',
      description: 'Scientific discoveries, research, and experiments',
    },
  });

  const business = await prisma.category.create({
    data: {
      name: 'Business',
      description: 'Entrepreneurship, management, and business strategies',
    },
  });

  console.log(`✅ Created categories`);

  await prisma.tag.createMany({
    data: [
      { name: 'nodejs' },
      { name: 'nestjs' },
      { name: 'typescript' },
      { name: 'javascript' },
      { name: 'database' },
    ],
  });
  console.log('✅ Created 5 tags');

  const article1 = await prisma.article.create({
    data: {
      title: 'Getting Started with NestJS',
      content: 'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications.',
      status: 'PUBLISHED',
      authorId: editor.id,
      categoryId: technology.id,
      tags: {
        connect: [
          { name: 'nodejs' },
          { name: 'nestjs' },
          { name: 'typescript' },
        ],
      },
    },
  });

  const article2 = await prisma.article.create({
    data: {
      title: 'React 19 New Features',
      content: 'React 19 introduces new hooks and performance improvements.',
      status: 'DRAFT',
      authorId: editor.id,
      categoryId: technology.id,
      tags: {
        connect: [{ name: 'javascript' }],
      },
    },
  });

  const article3 = await prisma.article.create({
    data: {
      title: 'Understanding PostgreSQL Indexes',
      content: 'A deep dive into PostgreSQL indexing strategies for better query performance.',
      status: 'PUBLISHED',
      authorId: admin.id,
      categoryId: science.id,
      tags: {
        connect: [{ name: 'database' }],
      },
    },
  });

  const article4 = await prisma.article.create({
    data: {
      title: 'Building Scalable Microservices',
      content: 'Learn how to build and deploy microservices with Node.js.',
      status: 'ARCHIVED',
      authorId: admin.id,
      categoryId: business.id,
      tags: {
        connect: [{ name: 'nodejs' }],
      },
    },
  });

  const article5 = await prisma.article.create({
    data: {
      title: 'TypeScript Best Practices',
      content: 'Essential TypeScript patterns and best practices for large projects.',
      status: 'DRAFT',
      authorId: editor.id,
      categoryId: science.id,
      tags: {
        connect: [{ name: 'typescript' }],
      },
    },
  });
  console.log(`✅ Created articles`);

  await prisma.comment.createMany({
    data: [
      {
        content: 'Excellent article! Very helpful for beginners.',
        articleId: article1.id,
        authorId: admin.id,
      },
      {
        content: 'Thanks for sharing this comprehensive guide.',
        articleId: article1.id,
        authorId: editor.id,
      },
      {
        content: 'Looking forward to more content like this!',
        articleId: article3.id,
        authorId: editor.id,
      },
    ],
  });
  console.log('✅ Created 3 comments');

  console.log('\n🌱 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });