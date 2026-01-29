# ⚡️ ZippyDB

**ZippyDB** is a lightweight, high-performance, and strictly type-safe SQL Query Builder for Node.js, specifically optimized for PostgreSQL. Built with TypeScript from the ground up, it provides a fluent API to interact with your database without the overhead of heavy ORMs like TypeORM or Sequelize.

---

## 🚀 Key Features

- **Strictly Type-Safe**: Full IntelliSense support with TypeScript Generics for compile-time safety
- **Fluent Interface**: Build complex queries with readable, chainable syntax
- **Zero Heavy Dependencies**: Minimal footprint (only `pg` for PostgreSQL)
- **SQL Injection Protection**: Parameterized queries (prepared statements) by default
- **Modular Architecture**: Easy to extend with custom drivers (MySQL, SQLite coming soon)
- **Production Ready**: Used in production applications handling millions of queries

---

## 📥 Installation

```bash
npm install zippydb pg
```

---

## ⚡ Quick Start

### Step 1: Define Your Interface

Create a TypeScript interface matching your database table structure:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  created_at: Date;
}
```

### Step 2: Setup Connection

```typescript
import { Builder, PostgresDriver } from 'zippydb';

const driver = new PostgresDriver({
  host: 'localhost',
  user: 'postgres',
  password: 'your_password',
  database: 'your_database',
  port: 5432,
});

const db = new Builder(driver);

// Now you're ready to query!
const users = await db.table<User>('users').get();
console.log(users);
```

---

## 📚 Complete API Reference

### SELECT Queries

**Fetch all records:**
```typescript
const allUsers = await db.table<User>('users').get();
```

**Fetch first record:**
```typescript
const user = await db.table<User>('users').first();
```

**Fetch with conditions:**
```typescript
const users = await db.table<User>('users')
  .where('age', '>', 18)
  .get();
```

**Multiple conditions:**
```typescript
const users = await db.table<User>('users')
  .where('age', '>=', 21)
  .where('status', '=', 'active')
  .get();
```

**Order by:**
```typescript
const users = await db.table<User>('users')
  .orderBy('created_at', 'desc')
  .get();
```

**Limit and offset:**
```typescript
const users = await db.table<User>('users')
  .limit(10)
  .offset(20)
  .get();
```

**Count records:**
```typescript
const totalUsers = await db.table<User>('users').count();
const activeCount = await db.table<User>('users')
  .where('status', '=', 'active')
  .count();
```

**Select specific columns:**
```typescript
const users = await db.table<User>('users')
  .select('id', 'name', 'email')
  .get();
```

---

### INSERT Operations

**Insert single record:**
```typescript
const newUser = await db.table<User>('users').create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
});
```

**Insert multiple records:**
```typescript
const users = await db.table<User>('users').createMany([
  { name: 'User 1', email: 'user1@example.com', age: 25 },
  { name: 'User 2', email: 'user2@example.com', age: 28 },
  { name: 'User 3', email: 'user3@example.com', age: 32 },
]);
```

---

### UPDATE Operations

**Update single record:**
```typescript
await db.table<User>('users')
  .where('id', '=', 1)
  .update({ name: 'Jane Doe', age: 31 });
```

**Update multiple records:**
```typescript
await db.table<User>('users')
  .where('status', '=', 'inactive')
  .update({ status: 'active' });
```

**Update with conditions:**
```typescript
await db.table<User>('users')
  .where('created_at', '<', new Date('2020-01-01'))
  .update({ archived: true });
```

---

### DELETE Operations

**Delete single record:**
```typescript
await db.table<User>('users')
  .where('id', '=', 5)
  .delete();
```

**Delete multiple records:**
```typescript
await db.table<User>('users')
  .where('status', '=', 'inactive')
  .delete();
```

**Delete with multiple conditions:**
```typescript
await db.table<User>('users')
  .where('age', '<', 18)
  .where('created_at', '<', new Date('2020-01-01'))
  .delete();
```

---

## 🔀 Advanced Features

### Where Operators

Supported comparison operators:

```typescript
.where('age', '=', 18)      // Equal
.where('age', '!=', 18)     // Not equal
.where('age', '>', 18)      // Greater than
.where('age', '>=', 18)     // Greater than or equal
.where('age', '<', 65)      // Less than
.where('age', '<=', 65)     // Less than or equal
.where('name', 'LIKE', '%john%')  // Pattern matching
```

### Chaining Queries

```typescript
const users = await db.table<User>('users')
  .where('age', '>=', 21)
  .where('status', '=', 'active')
  .orderBy('created_at', 'desc')
  .limit(10)
  .get();
```

### Distinct Records

```typescript
const uniqueEmails = await db.table<User>('users')
  .distinct()
  .get();
```

### Group By

```typescript
const grouped = await db.table<User>('users')
  .groupBy('status')
  .get();
```

---

## 🏗 Project Architecture

ZippyDB follows a modular design based on the Single Responsibility Principle:

```
src/
├── core/
│   ├── builder.ts           # Main fluent API interface
│   ├── grammar.ts           # SQL syntax compiler
│   └── query.ts             # Query builder engine
├── drivers/
│   ├── postgres.ts          # PostgreSQL implementation
│   ├── driver.interface.ts   # Abstract driver interface
│   └── pool.ts              # Connection pooling
├── interfaces/
│   ├── types.ts             # Global type definitions
│   ├── query.ts             # Query interfaces
│   └── driver.ts            # Driver interfaces
├── utils/
│   ├── helpers.ts           # Utility functions
│   └── validators.ts        # Input validation
└── index.ts                 # Public API exports
```

---

## 🔗 Framework Integration

### NestJS Example

```typescript
import { Injectable } from '@nestjs/common';
import { Builder, PostgresDriver } from 'zippydb';

@Injectable()
export class UserService {
  private db: Builder;

  constructor() {
    const driver = new PostgresDriver({
      host: 'localhost',
      user: 'postgres',
      password: 'password',
      database: 'db',
      port: 5432,
    });
    this.db = new Builder(driver);
  }

  async getAllUsers(): Promise<User[]> {
    return this.db.table<User>('users').get();
  }

  async getUserById(id: number): Promise<User | null> {
    return this.db.table<User>('users')
      .where('id', '=', id)
      .first();
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.db.table<User>('users').create(data);
  }
}
```

### Express.js Example

```typescript
import express from 'express';
import { Builder, PostgresDriver } from 'zippydb';

const app = express();
const db = new Builder(new PostgresDriver({
  host: 'localhost',
  user: 'postgres',
  password: 'password',
  database: 'db',
  port: 5432,
}));

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

### Fastify Example

```typescript
import Fastify from 'fastify';
import { Builder, PostgresDriver } from 'zippydb';

const fastify = Fastify();
const db = new Builder(new PostgresDriver({...}));

fastify.get('/users', async (request, reply) => {
  const users = await db.table<User>('users').get();
  reply.send(users);
});

fastify.listen({ port: 3000 });
```

---

## ⚙️ Configuration Options

### PostgreSQL Driver Options

```typescript
const driver = new PostgresDriver({
  host: 'localhost',           // Database host
  port: 5432,                  // Database port
  database: 'my_database',     // Database name
  user: 'postgres',            // Database user
  password: 'password',        // Database password
  ssl: false,                  // Enable SSL (optional)
  connectionTimeoutMillis: 0,  // Connection timeout
  idleTimeoutMillis: 30000,    // Idle timeout
  max: 20,                     // Max connections in pool
});
```

---

## 🔒 Security

ZippyDB uses parameterized queries (prepared statements) by default, protecting against SQL Injection attacks:

```typescript
// ❌ UNSAFE - Never do this
const sql = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ SAFE - ZippyDB handles parameterization
const user = await db.table<User>('users')
  .where('email', '=', email)
  .first();
```

All values are automatically escaped and parameterized.

---

## 📊 Performance Tips

1. **Use indexes on frequently queried columns:**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_status ON users(status);
   ```

2. **Limit result sets:**
   ```typescript
   const users = await db.table<User>('users')
     .limit(100)
     .get();
   ```

3. **Use connection pooling:** ZippyDB enables it by default

4. **Select only needed columns:**
   ```typescript
   const users = await db.table<User>('users')
     .select('id', 'name')
     .get();
   ```

---

## 🧪 Testing

Example with Jest:

```typescript
describe('User Service', () => {
  let db: Builder;

  beforeAll(() => {
    const driver = new PostgresDriver({...});
    db = new Builder(driver);
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

  it('should create new user', async () => {
    const user = await db.table<User>('users').create({
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(user.id).toBeDefined();
  });
});
```

---

## 🐛 Troubleshooting

**Issue: Connection timeout**
```typescript
// Increase connection timeout
const driver = new PostgresDriver({
  connectionTimeoutMillis: 30000,
  ...
});
```

**Issue: Type errors with where clause**
```typescript
// Make sure your interface matches the table structure
interface User {
  id: number;
  email: string;  // ✅ Must exist
}

// This will type-check
.where('email', '=', 'test@example.com')
```

**Issue: Query runs slowly**
- Check if indexes exist on filtered columns
- Limit result set size
- Avoid SELECT * when possible

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork the repository:**
   ```bash
   git clone https://github.com/ix1osbek/zippydb.git
   cd zippydb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make changes and test:**
   ```bash
   npm run build
   npm run test
   ```

5. **Commit with clear messages:**
   ```bash
   git commit -m "feat: add new feature description"
   ```

6. **Push and create Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

- No `any` types - use proper TypeScript typing
- Follow existing code style
- Add tests for new features
- Update documentation
- Run linter: `npm run lint`

---

## 📝 Examples

### Complete CRUD Example

```typescript
import { Builder, PostgresDriver } from 'zippydb';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  created_at: Date;
}

const db = new Builder(new PostgresDriver({
  host: 'localhost',
  user: 'postgres',
  password: 'password',
  database: 'myapp',
}));

async function main() {
  // CREATE
  const newUser = await db.table<User>('users').create({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 28,
  });
  console.log('Created:', newUser);

  // READ
  const user = await db.table<User>('users')
    .where('email', '=', 'alice@example.com')
    .first();
  console.log('Found:', user);

  // UPDATE
  await db.table<User>('users')
    .where('id', '=', newUser.id)
    .update({ age: 29 });
  console.log('Updated successfully');

  // LIST
  const allUsers = await db.table<User>('users')
    .orderBy('created_at', 'desc')
    .limit(10)
    .get();
  console.log('All users:', allUsers);

  // DELETE
  await db.table<User>('users')
    .where('id', '=', newUser.id)
    .delete();
  console.log('Deleted successfully');
}

main();
```

### Pagination Example

```typescript
async function getPaginatedUsers(page: number, perPage: number = 10) {
  const offset = (page - 1) * perPage;
  
  const users = await db.table<User>('users')
    .orderBy('created_at', 'desc')
    .limit(perPage)
    .offset(offset)
    .get();

  const total = await db.table<User>('users').count();

  return {
    data: users,
    total,
    page,
    perPage,
    pages: Math.ceil(total / perPage),
  };
}

// Usage
const result = await getPaginatedUsers(1, 20);
console.log(result);
```

---

## 📞 Support

- **Email:** ixlosbekerkinov.work@gmail.com

---

## 🙏 Acknowledgments

ZippyDB is inspired by popular query builders like Knex.js and Laravel's Eloquent, optimized for modern TypeScript development.

---

## 📈 Roadmap

- [x] PostgreSQL support
- [ ] MySQL driver
- [ ] SQLite driver
- [ ] Migrations system
- [ ] Relationship queries (joins, eager loading)
- [ ] Transaction support
- [ ] Query caching
- [ ] Connection pooling enhancements

---

**Made with ❤️ by the ZippyDB Team**

Star ⭐ the [GitHub repository](https://github.com/ix1osbek/zippydb) if you find it useful!