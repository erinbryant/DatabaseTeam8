-- Migration: Add Lost_Status column to package table
-- Purpose: Track lost/damaged packages for customer notifications

ALTER TABLE `package` 
ADD COLUMN `Lost_Status` ENUM('active', 'lost', 'notified') DEFAULT 'active' AFTER `Status_Code`;

-- Add index for efficient querying
CREATE INDEX `idx_lost_status` ON `package` (`Lost_Status`, `Recipient_ID`);
