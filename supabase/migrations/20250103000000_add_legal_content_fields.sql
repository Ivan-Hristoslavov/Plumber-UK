-- Add legal content fields to admin_profile table
ALTER TABLE admin_profile 
ADD COLUMN terms_and_conditions TEXT,
ADD COLUMN privacy_policy TEXT;

-- Add default content for Terms and Conditions
UPDATE admin_profile 
SET terms_and_conditions = '# Terms and Conditions

## 1. Service Agreement

By booking our plumbing services, you agree to these terms and conditions.

## 2. Service Provision

- We provide emergency and scheduled plumbing services
- Emergency response time: 45 minutes
- Standard service hours: 8:00 AM - 6:00 PM
- Emergency services available 24/7

## 3. Pricing and Payment

- Emergency call-out: £120
- Standard hourly rate: £80
- Payment due upon completion of work
- We accept cash, card, and bank transfer

## 4. Cancellation Policy

- Free cancellation up to 2 hours before scheduled appointment
- Late cancellations may incur a £50 fee
- Emergency call-outs cannot be cancelled

## 5. Warranty

- All work guaranteed for 12 months
- Parts warranty as per manufacturer terms
- Emergency repairs: 30-day warranty

## 6. Liability

- We are fully insured and Gas Safe registered
- Maximum liability limited to cost of service
- We are not liable for pre-existing issues

## 7. Contact Information

For questions about these terms, contact us at info@fixmyleak.com

**Last updated: January 2025**'
WHERE terms_and_conditions IS NULL;

-- Add default content for Privacy Policy
UPDATE admin_profile 
SET privacy_policy = '# Privacy Policy

## 1. Information We Collect

We collect information you provide when:
- Booking our services
- Contacting us for quotes
- Submitting reviews
- Using our website

## 2. Personal Information

We may collect:
- Name and contact details
- Service address
- Payment information
- Service history
- Communication records

## 3. How We Use Your Information

We use your information to:
- Provide plumbing services
- Process payments
- Send service confirmations
- Improve our services
- Comply with legal obligations

## 4. Data Storage and Security

- Data stored securely in the UK
- Encrypted transmission
- Limited access to authorized personnel
- Regular security updates

## 5. Data Sharing

We do not sell your personal information. We may share data with:
- Payment processors (Stripe)
- Service providers (email, SMS)
- Legal authorities when required

## 6. Your Rights

You have the right to:
- Access your personal data
- Request data correction
- Request data deletion
- Opt out of marketing communications

## 7. Cookies and Tracking

Our website uses cookies for:
- Functionality
- Analytics
- User experience improvement

## 8. Contact Us

For privacy questions, contact us at info@fixmyleak.com

**Last updated: January 2025**'
WHERE privacy_policy IS NULL; 