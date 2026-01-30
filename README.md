# ZippyDB

Lightweight, type-safe SQL Query Builder for Node.js + PostgreSQL.

## Install

```bash
npm install zippydb
```

## Quick Start

```typescript
import { Builder, PostgresDriver } from "zippydb";

interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

const db = new Builder(
  new PostgresDriver({
    host: "localhost",
    user: "postgres",
    password: "password",
    database: "mydb",
    port: 5432,
  }),
);

// Ready to use!
const users = await db.table<User>("users").get();
```

## Basic Operations

### SELECT

```typescript
// All records
await db.table<User>("users").get();

// First record
await db.table<User>("users").first();

// With condition
await db.table<User>("users").where("age", ">", 18).get();

// Multiple conditions
await db
  .table<User>("users")
  .where("age", ">=", 21)
  .where("status", "=", "active")
  .get();

// Order & limit
await db.table<User>("users").orderBy("created_at", "desc").limit(10).get();

// Pagination
await db.table<User>("users").limit(10).offset(20).get();

// Count
await db.table<User>("users").count();

// Select specific columns
await db.table<User>("users").select("id", "name", "email").get();

// Distinct
await db.table<User>("users").distinct().get();

// Group by
await db.table<User>("users").groupBy("status").get();
```

### INSERT

```typescript
// Single record
await db.table<User>("users").create({
  name: "John",
  email: "john@example.com",
  age: 30,
});

// Multiple records
await db.table<User>("users").createMany([
  { name: "User 1", email: "user1@example.com" },
  { name: "User 2", email: "user2@example.com" },
]);
```

### UPDATE

```typescript
// Single record
await db
  .table<User>("users")
  .where("id", "=", 1)
  .update({ name: "Jane", age: 31 });

// Multiple records
await db
  .table<User>("users")
  .where("status", "=", "inactive")
  .update({ status: "active" });
```

### DELETE

```typescript
// Single record
await db.table<User>("users").where("id", "=", 5).delete();

// Multiple records
await db.table<User>("users").where("status", "=", "inactive").delete();
```

## Where Operators

```typescript
.where('age', '=', 18)           // Equal
.where('age', '!=', 18)          // Not equal
.where('age', '>', 18)           // Greater than
.where('age', '>=', 18)          // Greater than or equal
.where('age', '<', 65)           // Less than
.where('age', '<=', 65)          // Less than or equal
.where('name', 'LIKE', '%john%') // Pattern matching
```

## Query Chaining

```typescript
const users = await db
  .table<User>("users")
  .where("age", ">=", 21)
  .where("status", "=", "active")
  .orderBy("created_at", "desc")
  .limit(10)
  .offset(0)
  .select("id", "name", "email")
  .get();
```

## Complete CRUD Example

```typescript
async function main() {
  // CREATE
  const user = await db.table<User>("users").create({
    name: "Alice",
    email: "alice@example.com",
    age: 28,
  });

  // READ
  const found = await db
    .table<User>("users")
    .where("email", "=", "alice@example.com")
    .first();

  // UPDATE
  await db.table<User>("users").where("id", "=", user.id).update({ age: 29 });

  // LIST
  const all = await db.table<User>("users").orderBy("created_at", "desc").get();

  // DELETE
  await db.table<User>("users").where("id", "=", user.id).delete();
}

main();
```

## Pagination Helper

```typescript
async function paginate(page: number, perPage: number = 10) {
  const offset = (page - 1) * perPage;

  const [data, total] = await Promise.all([
    db.table<User>("users").limit(perPage).offset(offset).get(),
    db.table<User>("users").count(),
  ]);

  return {
    data,
    total,
    page,
    perPage,
    pages: Math.ceil(total / perPage),
  };
}
```

## Framework Integration

### Express.js

```typescript
import express from 'express';
import { Builder, PostgresDriver } from 'zippydb';

const app = express();
const db = new Builder(new PostgresDriver({...}));

app.get('/users', async (req, res) => {
  const users = await db.table<User>('users').get();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const user = await db.table<User>('users').create(req.body);
  res.status(201).json(user);
});

app.listen(3000);
```

### NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { Builder, PostgresDriver } from 'zippydb';

@Injectable()
export class UserService {
  private db = new Builder(new PostgresDriver({...}));

  async findAll(): Promise<User[]> {
    return this.db.table<User>('users').get();
  }

  async findById(id: number): Promise<User | null> {
    return this.db.table<User>('users')
      .where('id', '=', id)
      .first();
  }

  async create(data: Partial<User>): Promise<User> {
    return this.db.table<User>('users').create(data);
  }
}
```

## Configuration

```typescript
const driver = new PostgresDriver({
  host: "localhost",
  port: 5432,
  database: "mydb",
  user: "postgres",
  password: "password",
  ssl: false,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 30000,
  max: 20, // Max pool connections
});
```

## Security

ZippyDB uses **parameterized queries** by default - SQL injection safe.

```typescript
// ✅ SAFE - Automatically parameterized
const user = await db.table<User>("users").where("email", "=", email).first();
```

## Performance Tips

1. **Create indexes** on frequently queried columns:

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

2. **Limit results** to reduce memory:

```typescript
.limit(100)
```

3. **Select only needed columns**:

```typescript
.select('id', 'name')
```

4. **Connection pooling** is enabled by default

## Testing

```typescript
describe('User Service', () => {
  let db: Builder;

  beforeAll(() => {
    db = new Builder(new PostgresDriver({...}));
  });

  it('should fetch all users', async () => {
    const users = await db.table<User>('users').get();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should find user by email', async () => {
    const user = await db.table<User>('users')
      .where('email', '=', 'test@example.com')
      .first();
    expect(user?.email).toBe('test@example.com');
  });
});
```

## Troubleshooting

**Connection timeout?**

```typescript
const driver = new PostgresDriver({
  connectionTimeoutMillis: 30000,
  ...config,
});
```

**Type errors?**
Make sure your interface matches the table structure:

```typescript
interface User {
  id: number;
  email: string; // Must exist
}
```

**Slow queries?**

- Add indexes to filtered columns
- Use `.limit()` to reduce results
- Use `.select()` instead of SELECT \*

## Features

✅ Type-safe with TypeScript  
✅ Fluent chainable API  
✅ SQL injection protection  
✅ Connection pooling  
✅ Minimal dependencies  
✅ Production ready

## Roadmap

- [x] PostgreSQL support
- [ ] MySQL driver
- [ ] SQLite driver
- [ ] Migrations
- [ ] Joins & relationships
- [ ] Transactions
- [ ] Query caching

## Support

Email: ixlosbekerkinov.work@gmail.com

---

**Star ⭐ on [GitHub](https://github.com/ix1osbek/zippydb)**
