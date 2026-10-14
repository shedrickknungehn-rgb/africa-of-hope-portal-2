# Supabase academic contract tests

`academic_migration_rollback_contract.sql` validates the academic migration and
its RPC, RLS, approval, notification, audit, roster, lesson, and material
contracts against a production-shaped Supabase database.

The harness runs inside one transaction and ends with a mandatory `ROLLBACK`.
Use a database-owner connection to a disposable or reviewed environment:

```sh
psql "$DATABASE_URL" -X -f supabase/tests/academic_migration_rollback_contract.sql
```

Inspect all `ERROR` lines and the final `test_results` table. A test runner must
fail when any result has `passed = false`.
