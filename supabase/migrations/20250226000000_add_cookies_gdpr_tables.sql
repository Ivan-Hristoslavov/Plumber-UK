-- Create cookies_policy and gdpr_policy tables for legal content
-- These tables were missing and caused save failures in AdminLegalManager

-- Create cookies_policy table
CREATE TABLE IF NOT EXISTS cookies_policy (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create gdpr_policy table
CREATE TABLE IF NOT EXISTS gdpr_policy (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE cookies_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_policy ENABLE ROW LEVEL SECURITY;

-- Allow all operations (same as terms and privacy_policy)
CREATE POLICY "Allow all on cookies_policy" ON cookies_policy FOR ALL USING (true);
CREATE POLICY "Allow all on gdpr_policy" ON gdpr_policy FOR ALL USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_cookies_policy_updated_at
    BEFORE UPDATE ON cookies_policy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_policy_updated_at
    BEFORE UPDATE ON gdpr_policy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default content if tables are empty
INSERT INTO cookies_policy (content)
SELECT '# Cookie Policy

## 1. What Are Cookies
Cookies are small text files stored on your device when you visit our website.

## 2. How We Use Cookies
- Essential cookies for site functionality
- Analytics to improve our services
- Preference cookies for your settings

## 3. Managing Cookies
You can control cookies through your browser settings.

*Last updated: ' || CURRENT_DATE || '*'
WHERE NOT EXISTS (SELECT 1 FROM cookies_policy);

INSERT INTO gdpr_policy (content)
SELECT '# GDPR Compliance

## 1. Data Protection
We comply with the General Data Protection Regulation (GDPR).

## 2. Your Rights
- Right to access your data
- Right to rectification
- Right to erasure
- Right to data portability
- Right to object

## 3. Contact
For data protection requests, contact us at your registered email.

*Last updated: ' || CURRENT_DATE || '*'
WHERE NOT EXISTS (SELECT 1 FROM gdpr_policy);
