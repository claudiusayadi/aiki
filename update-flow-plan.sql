-- Update Flow plan with Paystack plan code
-- Run this in your database

-- First, let's check the current Flow plan
SELECT id, slug, name, is_subscription, metadata 
FROM plans 
WHERE slug = 'flow';

-- Update the Flow plan to include the paystack_plan_code in metadata
UPDATE plans 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb), 
  '{paystack_plan_code}', 
  '"PLN_YOUR_FLOW_PLAN_CODE_HERE"'::jsonb
)
WHERE slug = 'flow';

-- Verify the update
SELECT id, slug, name, is_subscription, metadata 
FROM plans 
WHERE slug = 'flow';
