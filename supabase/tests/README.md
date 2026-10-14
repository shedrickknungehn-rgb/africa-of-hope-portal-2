# Supabase academic contract tests

`academic_migration_rollback_contract.sql` validates the academic migration and
its RPC, RLS, approval, notification, audit, roster, lesson, and material
contracts against a production-shaped Supabase database.

The harness runs inside one transaction and ends with a mandatory `ROLLBACK`.
The wrapper fails on SQL errors or failed contract assertions. Use a
database-owner connection to a disposable or reviewed environment:

```sh
DATABASE_URL="postgresql://..." npm run test:academic:db
```

The wrapper prints the contract results and removes its temporary output file.
