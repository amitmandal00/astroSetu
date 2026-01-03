-- Clear test submissions from contact_submissions table
-- Run this in Supabase SQL Editor to clear old test submissions

-- Option 1: Delete all submissions from the last hour (for testing)
DELETE FROM contact_submissions 
WHERE created_at >= NOW() - INTERVAL '1 hour';

-- Option 2: Delete all submissions from a specific IP (replace with your IP)
-- DELETE FROM contact_submissions 
-- WHERE ip_address = 'YOUR_IP_ADDRESS_HERE';

-- Option 3: Delete all test submissions (be careful in production!)
-- DELETE FROM contact_submissions 
-- WHERE email LIKE '%test%' OR email LIKE '%@example.com%';

-- Option 4: Delete all submissions older than 1 day
-- DELETE FROM contact_submissions 
-- WHERE created_at < NOW() - INTERVAL '1 day';

-- After running, verify the count:
SELECT COUNT(*) as remaining_submissions 
FROM contact_submissions 
WHERE created_at >= NOW() - INTERVAL '1 hour';

