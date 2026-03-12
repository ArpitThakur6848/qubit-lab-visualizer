# Database Schema — QubitLab Visualizer

Supabase (PostgreSQL). Keep it simple — three tables total.

---

## Tables

### `profiles`

Extends Supabase Auth's built-in `auth.users` table with app-specific data.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, references `auth.users(id)` | Same ID as the auth user |
| `display_name` | `text` | nullable | Optional display name |
| `created_at` | `timestamptz` | not null, default `now()` | |

> Supabase Auth already stores email, password hash, etc. This table only holds extra profile data. If you don't need `display_name` initially, you can skip this table and rely on `auth.users` directly.

---

### `saved_circuits`

Each row is a saved gate sequence belonging to a user.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `user_id` | `uuid` | not null, references `auth.users(id)` on delete cascade | Owner |
| `name` | `text` | not null | User-provided name (e.g., "Superposition Demo") |
| `description` | `text` | nullable | Optional notes about the circuit |
| `created_at` | `timestamptz` | not null, default `now()` | |
| `updated_at` | `timestamptz` | not null, default `now()` | Updated on save |

---

### `circuit_steps`

Each row is one gate in a circuit, ordered by `step_order`.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `circuit_id` | `uuid` | not null, references `saved_circuits(id)` on delete cascade | Parent circuit |
| `gate` | `text` | not null | Gate name: `X`, `Y`, `Z`, `H`, `S`, or `T` |
| `step_order` | `integer` | not null | 0-indexed position in the sequence |

**Composite index** on `(circuit_id, step_order)` for efficient ordered retrieval.

---

## Relationships

```
auth.users (managed by Supabase)
    │
    ├── 1:1 ── profiles (optional app-level profile data)
    │
    └── 1:N ── saved_circuits
                    │
                    └── 1:N ── circuit_steps (ordered by step_order)
```

---

## Row-Level Security (RLS) Policies

All tables have RLS enabled. Users can only access their own data.

### `profiles`

```sql
-- Users can read and update their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
```

### `saved_circuits`

```sql
-- Users can CRUD their own circuits
create policy "Users can view own circuits"
  on saved_circuits for select
  using (auth.uid() = user_id);

create policy "Users can insert own circuits"
  on saved_circuits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own circuits"
  on saved_circuits for update
  using (auth.uid() = user_id);

create policy "Users can delete own circuits"
  on saved_circuits for delete
  using (auth.uid() = user_id);
```

### `circuit_steps`

```sql
-- Users can access steps belonging to their own circuits
create policy "Users can view own circuit steps"
  on circuit_steps for select
  using (
    circuit_id in (
      select id from saved_circuits where user_id = auth.uid()
    )
  );

create policy "Users can insert own circuit steps"
  on circuit_steps for insert
  with check (
    circuit_id in (
      select id from saved_circuits where user_id = auth.uid()
    )
  );

create policy "Users can delete own circuit steps"
  on circuit_steps for delete
  using (
    circuit_id in (
      select id from saved_circuits where user_id = auth.uid()
    )
  );
```

---

## Example Queries

**Save a circuit:**

```sql
-- 1. Insert the circuit
insert into saved_circuits (user_id, name)
values (auth.uid(), 'Superposition Demo')
returning id;

-- 2. Insert the steps (using the returned circuit ID)
insert into circuit_steps (circuit_id, gate, step_order) values
  ('circuit-uuid', 'H', 0),
  ('circuit-uuid', 'T', 1),
  ('circuit-uuid', 'H', 2);
```

**Load a circuit with its steps:**

```sql
select sc.id, sc.name, sc.created_at,
       cs.gate, cs.step_order
from saved_circuits sc
join circuit_steps cs on cs.circuit_id = sc.id
where sc.id = 'circuit-uuid'
order by cs.step_order;
```

**List all circuits for the current user:**

```sql
select id, name, created_at,
       (select count(*) from circuit_steps where circuit_id = sc.id) as step_count
from saved_circuits sc
where user_id = auth.uid()
order by updated_at desc;
```

---

## Design Notes

- **Why separate `circuit_steps` instead of a JSON array?** A normalized table makes it easier to query, validate, and extend later (e.g., adding parameters to gates). For v1 with only 6 fixed gates, a JSON column would also work — but the relational approach is cleaner and more resume-friendly.
- **Why `text` for `gate` instead of an enum?** Easier to extend without migrations. Validation happens in the application layer.
- **Cascade deletes** ensure that deleting a circuit automatically removes its steps, and deleting a user removes all their data.
