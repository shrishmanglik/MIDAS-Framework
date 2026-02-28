# Prisma Schema Template

> Complete Prisma schema with common patterns: User model, authentication fields, timestamps, enums, relations, and indexing.

## Schema File -- prisma/schema.prisma

```prisma
// =============================================================================
// Prisma Schema
// Docs: https://pris.ly/d/prisma-schema
// =============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =============================================================================
// Enums
// =============================================================================

enum UserRole {
  ADMIN
  USER
  MODERATOR
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

// =============================================================================
// User & Authentication
// =============================================================================

model User {
  id            String        @id @default(uuid())
  email         String        @unique
  passwordHash  String        @map("password_hash")
  name          String
  role          UserRole      @default(USER)
  status        AccountStatus @default(ACTIVE)
  emailVerified Boolean       @default(false) @map("email_verified")
  avatarUrl     String?       @map("avatar_url")

  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  sessions Session[]
  posts    Post[]
  comments Comment[]

  // Indexes
  @@index([email])
  @@index([role])
  @@index([createdAt])
  @@map("users")
}

model Session {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  token        String   @unique
  refreshToken String   @unique @map("refresh_token")
  expiresAt    DateTime @map("expires_at")
  ipAddress    String?  @map("ip_address")
  userAgent    String?  @map("user_agent")

  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
  @@map("sessions")
}

// =============================================================================
// Content Models (example domain)
// =============================================================================

model Post {
  id          String  @id @default(uuid())
  title       String
  slug        String  @unique
  content     String
  excerpt     String?
  published   Boolean @default(false)
  authorId    String  @map("author_id")
  categoryId  String? @map("category_id")

  // Timestamps
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  publishedAt DateTime? @map("published_at")

  // Relations
  author   User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  comments Comment[]
  tags     PostTag[]

  // Indexes
  @@index([authorId])
  @@index([categoryId])
  @@index([slug])
  @@index([published, createdAt])
  @@map("posts")
}

model Category {
  id          String @id @default(uuid())
  name        String @unique
  slug        String @unique
  description String?

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  posts Post[]

  @@map("categories")
}

model Tag {
  id   String @id @default(uuid())
  name String @unique
  slug String @unique

  posts PostTag[]

  @@map("tags")
}

// Many-to-many join table
model PostTag {
  postId String @map("post_id")
  tagId  String @map("tag_id")

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@index([tagId])
  @@map("post_tags")
}

model Comment {
  id       String  @id @default(uuid())
  content  String
  postId   String  @map("post_id")
  authorId String  @map("author_id")
  parentId String? @map("parent_id")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  post    Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  author  User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies Comment[] @relation("CommentReplies")

  @@index([postId])
  @@index([authorId])
  @@index([parentId])
  @@map("comments")
}
```

## Common Patterns Reference

### Pattern: Soft Delete
```prisma
model Resource {
  id        String    @id @default(uuid())
  deletedAt DateTime? @map("deleted_at")
  // Query with: where: { deletedAt: null }
}
```

### Pattern: Polymorphic Type
```prisma
enum NotificationType {
  EMAIL
  SMS
  PUSH
}

model Notification {
  id        String           @id @default(uuid())
  type      NotificationType
  payload   Json             // Store type-specific data as JSON
  sentAt    DateTime?        @map("sent_at")
  createdAt DateTime         @default(now()) @map("created_at")
}
```

### Pattern: Unique Compound Constraint
```prisma
model TeamMember {
  id     String @id @default(uuid())
  teamId String @map("team_id")
  userId String @map("user_id")
  role   String @default("member")

  @@unique([teamId, userId])  // One membership per user per team
}
```

### Pattern: Full-Text Search Index (PostgreSQL)
```prisma
model Article {
  id      String @id @default(uuid())
  title   String
  content String

  // Use raw SQL migration for GIN index:
  // CREATE INDEX article_search_idx ON articles
  // USING GIN (to_tsvector('english', title || ' ' || content));
}
```

## Seed Script -- prisma/seed.ts

```typescript
import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.postTag.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash: await hash("admin123456", 12),
      name: "Admin User",
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  // Create regular user
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      passwordHash: await hash("user123456", 12),
      name: "Jane Doe",
      role: UserRole.USER,
      emailVerified: true,
    },
  });

  // Create categories
  const techCategory = await prisma.category.create({
    data: { name: "Technology", slug: "technology", description: "Tech articles" },
  });

  // Create tags
  const typescriptTag = await prisma.tag.create({
    data: { name: "TypeScript", slug: "typescript" },
  });

  const prismaTag = await prisma.tag.create({
    data: { name: "Prisma", slug: "prisma" },
  });

  // Create a post with tags
  const post = await prisma.post.create({
    data: {
      title: "Getting Started with Prisma",
      slug: "getting-started-prisma",
      content: "A comprehensive guide to using Prisma with PostgreSQL.",
      excerpt: "Learn how to set up and use Prisma ORM.",
      published: true,
      publishedAt: new Date(),
      authorId: admin.id,
      categoryId: techCategory.id,
      tags: {
        create: [
          { tagId: typescriptTag.id },
          { tagId: prismaTag.id },
        ],
      },
    },
  });

  // Create a comment
  await prisma.comment.create({
    data: {
      content: "Great article, very helpful!",
      postId: post.id,
      authorId: user.id,
    },
  });

  console.log("Seed data created successfully.");
  console.log(`  Admin: ${admin.email}`);
  console.log(`  User: ${user.email}`);
  console.log(`  Post: ${post.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Usage

1. Copy `schema.prisma` to your `prisma/` directory.
2. Modify models and enums to match your domain.
3. Set `DATABASE_URL` in your `.env` file.
4. Run `npx prisma migrate dev --name init` to create the initial migration.
5. Run `npx prisma db seed` to populate development data.
6. Run `npx prisma generate` to regenerate the client after schema changes.

## Naming Conventions

- Model names: PascalCase singular (`User`, `Post`, `Comment`)
- Table names: snake_case plural via `@@map("users")`
- Column names in DB: snake_case via `@map("created_at")`
- Property names in code: camelCase (`createdAt`, `authorId`)
- Enum values: UPPER_SNAKE_CASE (`ADMIN`, `ACTIVE`)
- Relation fields: camelCase, matching the related model name
