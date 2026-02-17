-- ============================================================
-- QR Token Cleanup and Verification Script
-- Run these queries in order to clean legacy data
-- ============================================================

-- ============================================================
-- STEP 1: Delete all old QR token rows
-- ============================================================
-- This removes all legacy QR tokens that accumulated before the fix
-- Safe to run because QR tokens are transient (expire in 5 seconds)

DELETE FROM qr_tokens;

-- Verify deletion
SELECT COUNT(*) as total_qr_tokens FROM qr_tokens;
-- Expected: 0 rows


-- ============================================================
-- STEP 2: Verify no duplicate session rows exist
-- ============================================================
-- This query finds sessions with multiple QR tokens (should be none)

SELECT "sessionId", COUNT(*) as duplicate_count
FROM qr_tokens
GROUP BY "sessionId"
HAVING COUNT(*) > 1;

-- Expected result: 0 rows (empty result set)


-- ============================================================
-- STEP 3: Verify unique constraint exists on sessionId
-- ============================================================
-- Check if the unique constraint is properly enforced

SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'qr_tokens' 
    AND kcu.column_name = 'sessionId'
    AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY');

-- Expected: At least 1 row showing UNIQUE constraint on sessionId
-- Example result:
-- constraint_name          | constraint_type | column_name | table_name
-- -------------------------+-----------------+-------------+------------
-- unique_session_qr        | UNIQUE          | sessionId   | qr_tokens
-- or
-- REL_xxxxxxxxxxxx         | UNIQUE          | sessionId   | qr_tokens


-- ============================================================
-- Alternative: Check constraint using pg_catalog (PostgreSQL)
-- ============================================================
SELECT
    conname as constraint_name,
    contype as constraint_type,
    conrelid::regclass as table_name
FROM pg_constraint
WHERE conrelid = 'qr_tokens'::regclass
    AND contype = 'u';  -- 'u' = unique constraint

-- Expected: Shows unique constraint on qr_tokens


-- ============================================================
-- STEP 4: Monitor QR token behavior after cleanup
-- ============================================================
-- Run this query multiple times (every 10 seconds) to verify behavior

SELECT 
    id,
    "sessionId",
    LEFT(token, 16) || '...' as token_preview,
    "expiresAt",
    "updatedAt",
    NOW() as current_time
FROM qr_tokens
ORDER BY "updatedAt" DESC;

-- Expected behavior:
-- - Only 1 row per sessionId
-- - token changes every ~5 seconds
-- - expiresAt changes every ~5 seconds  
-- - updatedAt timestamp increases
-- - Total COUNT never grows beyond number of active sessions


-- ============================================================
-- Count total rows over time (monitoring query)
-- ============================================================
SELECT 
    COUNT(*) as total_rows,
    COUNT(DISTINCT "sessionId") as unique_sessions,
    NOW() as checked_at
FROM qr_tokens;

-- Expected: total_rows = unique_sessions (1:1 ratio)
