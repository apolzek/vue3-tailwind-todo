CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  "date" DATE NOT NULL,
  "time" TIME NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activities_category_idx ON activities (category);
CREATE INDEX IF NOT EXISTS activities_date_idx ON activities ("date");
CREATE INDEX IF NOT EXISTS activities_tags_idx ON activities USING GIN (tags);

INSERT INTO activities (id, title, description, category, "date", "time", location, status, tags) VALUES
  ('seed-1', 'Morning Standup',    'Daily team sync meeting',      'Work',     CURRENT_DATE,             '09:00', 'Zoom',           'completed', ARRAY['meeting']),
  ('seed-2', 'Gym Session',        'Upper body workout',           'Health',   CURRENT_DATE,             '18:00', 'Fitness Center', 'pending',   ARRAY['priority']),
  ('seed-3', 'Project Planning',   'Plan next sprint tasks',       'Work',     CURRENT_DATE + 1,         '14:00', 'Office',         'pending',   ARRAY['meeting','deadline']),
  ('seed-4', 'Read Clean Code',    'Read chapter 3',               'Learning', CURRENT_DATE + 1,         '20:00', 'Home',           'pending',   ARRAY[]::text[]),
  ('seed-5', 'Team Lunch',         'Team building lunch',          'Work',     CURRENT_DATE + 2,         '12:30', 'Restaurant',     'pending',   ARRAY['meeting']),
  ('seed-6', 'Grocery Shopping',   'Weekly groceries',             'Personal', CURRENT_DATE,             '17:00', 'Supermarket',    'pending',   ARRAY['errand']),
  ('seed-7', 'Yoga Class',         '30 min yoga',                  'Health',   CURRENT_DATE + 1,         '07:00', 'Home',           'pending',   ARRAY[]::text[]),
  ('seed-8', 'Finish Vue Course',  'Complete composition API',     'Learning', CURRENT_DATE + 3,         '21:00', 'Home',           'pending',   ARRAY['deadline']),
  ('seed-9', 'Call Mom',           'Weekly catch-up call',         'Personal', CURRENT_DATE,             '19:30', NULL,             'pending',   ARRAY['priority']),
  ('seed-10','Submit Tax Forms',   'Deadline approaching',         'Personal', CURRENT_DATE + 2,         '10:00', NULL,             'pending',   ARRAY['deadline','priority'])
ON CONFLICT (id) DO NOTHING;
