-- Optional: remove Sarah Chen demo seed from existing live accounts
-- Run once in Supabase SQL Editor if users already loaded sample data.

-- Reset demo profile names back to signup metadata is not automatic;
-- Update your own row in Table Editor → profiles → full_name

DELETE FROM timeline_events
WHERE title IN (
  'Annual Physical Exam',
  'COVID-19 Vaccination (Booster)',
  'Lupus Flare — Rheumatology Visit',
  'Appendectomy'
);

DELETE FROM medications
WHERE name IN ('Hydroxychloroquine', 'Prednisone', 'Vitamin D3');

DELETE FROM emergency_contacts
WHERE name IN ('Michael Chen', 'Dr. Emily Watson');

UPDATE profiles
SET
  full_name = 'New User',
  date_of_birth = NULL,
  blood_type = NULL,
  allergies = '{}',
  chronic_illnesses = '{}'
WHERE full_name = 'Sarah Chen';
