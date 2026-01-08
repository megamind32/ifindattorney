-- ============================================
-- iFind Attorney - Supabase Database Schema
-- ============================================
-- This file defines the tables for the lawyer recommendation platform

-- Practice Areas
CREATE TABLE IF NOT EXISTS practice_areas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lawyers / Law Firms
CREATE TABLE IF NOT EXISTS lawyers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  
  -- Location in Lagos
  location VARCHAR(255),          -- e.g., "Victoria Island", "Ikoyi"
  office_address TEXT,
  latitude FLOAT,
  longitude FLOAT,
  
  -- Practice Info
  practice_area_id INT REFERENCES practice_areas(id),
  bio TEXT,
  experience_years INT,
  
  -- Cost Estimates (rough ranges in NGN)
  consultation_fee_min INT,       -- Minimum consultation fee
  consultation_fee_max INT,       -- Maximum consultation fee
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lawyer Specialties (many-to-many, since lawyers can handle multiple areas)
CREATE TABLE IF NOT EXISTS lawyer_specialties (
  id SERIAL PRIMARY KEY,
  lawyer_id INT REFERENCES lawyers(id) ON DELETE CASCADE,
  practice_area_id INT REFERENCES practice_areas(id) ON DELETE CASCADE,
  UNIQUE(lawyer_id, practice_area_id)
);

-- Contact Form Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_location VARCHAR(255),
  
  -- From AI Classification
  practice_area VARCHAR(100),
  urgency VARCHAR(20),             -- 'low', 'medium', 'high'
  budget_sensitivity VARCHAR(20),  -- 'low', 'medium', 'high'
  
  -- User Message
  message TEXT,
  
  status VARCHAR(50) DEFAULT 'new',  -- 'new', 'matched', 'archived'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recommended Lawyer Matches
CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  submission_id INT REFERENCES contact_submissions(id),
  lawyer_id INT REFERENCES lawyers(id),
  
  rank INT,                        -- Ranking 1-5
  match_reason TEXT,               -- Why we recommended this lawyer
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_lawyers_practice_area ON lawyers(practice_area_id);
CREATE INDEX IF NOT EXISTS idx_lawyers_location ON lawyers(location);
CREATE INDEX IF NOT EXISTS idx_lawyer_specialties_lawyer ON lawyer_specialties(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_specialties_area ON lawyer_specialties(practice_area_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_submission ON recommendations(submission_id);

-- Add unique constraint to lawyers.email if it doesn't exist
DO $$
BEGIN
  ALTER TABLE lawyers ADD CONSTRAINT email_unique UNIQUE (email);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

-- ============================================
-- Sample Data (Lagos Lawyers)
-- ============================================

-- Insert practice areas
INSERT INTO practice_areas (name, slug, description) VALUES
  ('Employment Law', 'employment-law', 'Workplace rights, disputes, severance, hiring'),
  ('Family Law', 'family-law', 'Divorce, child custody, marriage contracts'),
  ('Property & Real Estate', 'property-law', 'Land disputes, purchases, leases'),
  ('Corporate Law', 'corporate-law', 'Business formation, mergers, compliance'),
  ('Commercial Law', 'commercial-law', 'Contracts, vendor disputes, business agreements'),
  ('Dispute Resolution', 'dispute-resolution', 'Civil litigation, arbitration, mediation'),
  ('Immigration Law', 'immigration-law', 'Visas, residency, relocation'),
  ('Intellectual Property', 'intellectual-property', 'Trademarks, copyrights, patents')
ON CONFLICT (name) DO NOTHING;

-- Insert sample lawyers (This is placeholder data. In production, lawyers self-register or are verified.)
INSERT INTO lawyers (name, email, phone, location, office_address, practice_area_id, bio, experience_years, consultation_fee_min, consultation_fee_max, is_active, is_verified) VALUES
  ('Chioma Okonkwo', 'chioma@lawfirm.ng', '+234-801-234-5678', 'Victoria Island', '45 Lekki Phase 1, VI', 1, 'Employment law specialist with 10+ years experience', 10, 50000, 100000, TRUE, TRUE),
  ('Adebayo Adeleke', 'adebayo@legalhub.ng', '+234-702-987-6543', 'Ikoyi', '12 Kuramo Street, Ikoyi', 3, 'Property & land dispute expert', 12, 75000, 150000, TRUE, TRUE),
  ('Grace Nwosu', 'grace@advocates.ng', '+234-805-456-7890', 'Surulere', '78 Oyo Street, Surulere', 2, 'Family law and personal matters', 8, 40000, 80000, TRUE, TRUE),
  ('Emeka Dike', 'emeka@corporatelaw.ng', '+234-708-234-5678', 'Lekki', '101 Admiralty Way, Lekki', 4, 'Corporate formation and governance', 15, 100000, 200000, TRUE, TRUE),
  ('Zainab Hassan', 'zainab@disputes.ng', '+234-701-345-6789', 'Lagos Island', '34 Marina Street, Lagos Island', 6, 'Civil litigation and mediation', 11, 60000, 120000, TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Link lawyers to their specialties
INSERT INTO lawyer_specialties (lawyer_id, practice_area_id) VALUES
  (1, 1),  -- Chioma: Employment
  (2, 3),  -- Adebayo: Property
  (3, 2),  -- Grace: Family
  (4, 4),  -- Emeka: Corporate
  (4, 5),  -- Emeka: Commercial
  (5, 6)   -- Zainab: Dispute Resolution
ON CONFLICT (lawyer_id, practice_area_id) DO NOTHING;

-- ============================================
-- Row Level Security (Optional)
-- ============================================
-- Enable RLS if needed for privacy:
-- ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can only view their own submissions" 
--   ON contact_submissions 
--   USING (current_user_id = id);
