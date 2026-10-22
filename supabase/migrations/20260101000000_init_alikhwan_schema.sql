-- ==============================================================================
-- আল-ইখওয়ান ইসলামী সমাজ কল্যাণ সংস্থা — বৃত্তি পরীক্ষা ২০২৬
-- Supabase PostgreSQL Database Schema & Row Level Security (RLS) Migration
-- ==============================================================================

-- 1. Create custom ENUM types
CREATE TYPE applicant_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'waived');
CREATE TYPE notice_category AS ENUM ('জরুরি', 'সাধারণ', 'ফলাফল', 'সিলেবাস');

-- 2. Exam Settings Table (Singleton Configuration)
CREATE TABLE IF NOT EXISTS exam_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_application_open BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  exam_date DATE NOT NULL,
  exam_time TEXT NOT NULL,
  exam_centers TEXT[] NOT NULL DEFAULT ARRAY['গল্লাসাঙ্গন সরকারি প্রাথমিক বিদ্যালয় কেন্দ্র'],
  is_fee_required BOOLEAN NOT NULL DEFAULT true,
  fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  contact_phone TEXT NOT NULL DEFAULT '০১৭০০-০০০০০০',
  contact_email TEXT NOT NULL DEFAULT 'info@al-ikhwan-bd.org',
  syllabus_summary TEXT,
  admit_instructions TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Applicants Table
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_no TEXT NOT NULL UNIQUE,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT NOT NULL DEFAULT 'ছাত্র',
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  alt_mobile TEXT,
  email TEXT,
  school_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  present_address TEXT NOT NULL,
  permanent_address TEXT NOT NULL,
  division TEXT NOT NULL DEFAULT 'সিলেট',
  district TEXT NOT NULL DEFAULT 'মৌলভীবাজার',
  upazila TEXT NOT NULL DEFAULT 'বড়লেখা',
  photo_url TEXT NOT NULL,
  signature_url TEXT NOT NULL,
  declaration_accepted BOOLEAN NOT NULL DEFAULT false,
  status applicant_status NOT NULL DEFAULT 'submitted',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  payment_method TEXT,
  transaction_id TEXT,
  payment_date DATE,
  admit_card_issued BOOLEAN NOT NULL DEFAULT false,
  admit_card_no TEXT UNIQUE,
  roll_number TEXT UNIQUE,
  exam_center TEXT,
  exam_date DATE,
  exam_time TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for lightning-fast lookups and high traffic
CREATE INDEX IF NOT EXISTS idx_applicants_app_no ON applicants (application_no);
CREATE INDEX IF NOT EXISTS idx_applicants_mobile ON applicants (mobile);
CREATE INDEX IF NOT EXISTS idx_applicants_roll ON applicants (roll_number);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants (status);
CREATE INDEX IF NOT EXISTS idx_applicants_class ON applicants (class_name);
CREATE INDEX IF NOT EXISTS idx_applicants_school ON applicants (school_name);

-- 4. Notices Table
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category notice_category NOT NULL DEFAULT 'সাধারণ',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Payment Receipts Table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no TEXT NOT NULL UNIQUE,
  application_no TEXT NOT NULL REFERENCES applicants(application_no) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  status TEXT NOT NULL DEFAULT 'সফল'
);

-- 6. Audit Logs Table (Administrative accountability)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT NOT NULL,
  performed_by TEXT NOT NULL DEFAULT 'অ্যাডমিন',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applicants_updated_at
BEFORE UPDATE ON applicants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_settings_updated_at
BEFORE UPDATE ON exam_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Notices & Exam Settings: Everyone can read
CREATE POLICY "Public can view notices"
  ON notices FOR SELECT
  USING (true);

CREATE POLICY "Public can view exam settings"
  ON exam_settings FOR SELECT
  USING (true);

-- Applicants: Public can submit their own application
CREATE POLICY "Anyone can submit application"
  ON applicants FOR INSERT
  WITH CHECK (true);

-- Applicants: Public can only view their own record if matching app_no or roll
CREATE POLICY "Applicant can view own application status"
  ON applicants FOR SELECT
  USING (
    auth.role() = 'authenticated' OR
    application_no = current_setting('request.jwt.claims', true)::json->>'app_no'
  );

-- Admin has full access to manage everything
CREATE POLICY "Admin full access applicants"
  ON applicants FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access notices"
  ON notices FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access settings"
  ON exam_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access receipts"
  ON receipts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access audit logs"
  ON audit_logs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
