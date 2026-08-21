CREATE INDEX IF NOT EXISTS idx_course_reviews_approved_created
ON course_reviews(created_at DESC, id DESC)
WHERE status = 1;

PRAGMA optimize;
