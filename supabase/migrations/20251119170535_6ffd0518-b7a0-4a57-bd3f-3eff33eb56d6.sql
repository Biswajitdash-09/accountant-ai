-- Update default credits for new users to 50
ALTER TABLE user_credits 
ALTER COLUMN total_credits SET DEFAULT 50,
ALTER COLUMN daily_free_credits SET DEFAULT 10;

-- Update existing users with less than 50 credits to 50
UPDATE user_credits 
SET total_credits = GREATEST(total_credits, 50),
    daily_free_credits = 10
WHERE total_credits < 50;