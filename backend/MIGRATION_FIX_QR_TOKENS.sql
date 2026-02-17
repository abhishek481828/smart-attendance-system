-- Migration to fix qr_tokens table and prevent multiple rows per session
-- Run this SQL to enforce unique constraint on sessionId

-- Step 1: Remove duplicate rows, keeping only the most recent for each session
DELETE FROM qr_tokens
WHERE id NOT IN (
  SELECT DISTINCT ON ("sessionId") id
  FROM qr_tokens
  ORDER BY "sessionId", "updatedAt" DESC
);

-- Step 2: Add unique constraint on sessionId
ALTER TABLE qr_tokens
ADD CONSTRAINT unique_session_qr UNIQUE ("sessionId");

-- Verify the fix
-- SELECT "sessionId", COUNT(*) as count 
-- FROM qr_tokens 
-- GROUP BY "sessionId" 
-- HAVING COUNT(*) > 1;
-- Should return 0 rows
