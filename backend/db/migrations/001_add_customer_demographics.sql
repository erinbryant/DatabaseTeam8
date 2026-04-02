-- Run once on existing databases missing birth/sex on Customer.
-- mysql -u root -p your_database < backend/db/migrations/001_add_customer_demographics.sql

ALTER TABLE customer ADD COLUMN Birth_Day TINYINT NOT NULL DEFAULT 1;
ALTER TABLE customer ADD COLUMN Birth_Month TINYINT NOT NULL DEFAULT 1;
ALTER TABLE customer ADD COLUMN Birth_Year YEAR NOT NULL DEFAULT 2000;
ALTER TABLE customer ADD COLUMN Sex CHAR(1) NOT NULL DEFAULT 'U';
