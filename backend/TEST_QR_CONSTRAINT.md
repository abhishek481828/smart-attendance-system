# Testing QR Token Unique Constraint

## Prerequisites
- Application code already updated with `@OneToOne` and `upsert()` logic
- Database cleanup completed (ran `CLEANUP_QR_TOKENS.sql`)

---

## Test Procedure

### 1. **Start Backend Server**
```bash
cd backend
npm run start:dev
```

### 2. **Start a Session**
- Login as a teacher
- Create/select a class
- Click "Start Session"
- Note the session ID from the response or database

### 3. **Let QR Refresh for 20-30 Seconds**
The frontend calls `/session/:sessionId/qr-token` every 5 seconds automatically.

- **Expected behavior:**
  - QR code updates visually every 5 seconds
  - New token string displayed
  - No errors in console

### 4. **Check Database in Real-Time**

#### Option A: Supabase Dashboard
1. Open Supabase dashboard
2. Navigate to Table Editor → `qr_tokens` table
3. Click refresh button every 5-10 seconds
4. Observe:
   - ✅ Only **1 row** for your session
   - ✅ `token` column keeps changing
   - ✅ `expiresAt` keeps updating
   - ✅ `updatedAt` timestamp increments
   - ✅ Total row count = **1** (not growing)

#### Option B: SQL Query (Run periodically)
```sql
-- Monitor the QR token for your session
SELECT 
    id,
    "sessionId",
    LEFT(token, 20) || '...' as token_preview,
    "expiresAt",
    "updatedAt",
    NOW() - "updatedAt" as seconds_since_update
FROM qr_tokens
WHERE "sessionId" = 'YOUR_SESSION_ID_HERE'
ORDER BY "updatedAt" DESC;
```

Run this query 4-5 times with 5 second intervals:
- `token_preview` should change
- `updatedAt` should be within last 5 seconds
- Same row ID (not creating new rows)

### 5. **Verify Total Row Count**
```sql
SELECT COUNT(*) as total_rows FROM qr_tokens;
```

**Expected after 30 seconds:**
- If 1 active session → **1 row total**
- If 3 active sessions → **3 rows total**
- Row count = Active session count

### 6. **Test Constraint Enforcement (Optional)**
Try to manually insert a duplicate:

```sql
-- This should FAIL with unique constraint violation
INSERT INTO qr_tokens ("sessionId", token, "expiresAt")
VALUES (
    'YOUR_SESSION_ID_HERE',  -- Same session
    'duplicate-token',
    NOW() + INTERVAL '5 seconds'
);
```

**Expected error:**
```
ERROR: duplicate key value violates unique constraint "unique_session_qr"
DETAIL: Key ("sessionId")=(xxx) already exists.
```

---

## Success Criteria

✅ **Before Fix (Problem):**
- 100+ rows after 10 minutes
- New row every 5 seconds
- Database growing infinitely

✅ **After Fix (Expected):**
- **1 row** per active session
- Token updates in-place
- No new rows created
- Database stable

---

## Troubleshooting

### If you see multiple rows for same session:
1. Verify application code uses `@OneToOne` (not `@ManyToOne`)
2. Verify service uses `.upsert()` with `['session']` conflict key
3. Verify unique constraint exists in database
4. Re-run cleanup SQL
5. Restart backend server

### If constraint doesn't exist:
```sql
-- Manually add unique constraint
ALTER TABLE qr_tokens
ADD CONSTRAINT unique_session_qr UNIQUE ("sessionId");
```

### If upsert fails:
- Check that session object is passed correctly (not just `{ id: sessionId }`)
- Verify TypeORM version supports `upsert()` operation
- Check database logs for constraint violations

---

## Summary

**One session → One row → Always updated → No growth**

This is the expected behavior after the fix.
