PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE course_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sigle TEXT UNIQUE,  -- "UNIQUE KEY" no es válido en SQLite; solo usa UNIQUE
    likes INTEGER DEFAULT 0,
    superlikes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,

    votes_low_workload INTEGER DEFAULT 0,
    votes_medium_workload INTEGER DEFAULT 0,
    votes_high_workload INTEGER DEFAULT 0,

    votes_mandatory_attendance INTEGER DEFAULT 0,
    votes_optional_attendance INTEGER DEFAULT 0,

    avg_weekly_hours REAL DEFAULT 0.0,
    sort_index INTEGER DEFAULT 0
);
CREATE TABLE course_reviews ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_sigle TEXT NOT NULL,

    like_dislike INTEGER CHECK (like_dislike IN (0, 1, 2)),
    workload_vote INTEGER CHECK (workload_vote IN (0, 1, 2)),
    attendance_type INTEGER CHECK (attendance_type IN (0, 1)),  -- Solo 0 (mandatory) y 1 (optional)

    weekly_hours INTEGER CHECK (weekly_hours >= 0),

    year_taken INTEGER,
    semester_taken INTEGER CHECK (semester_taken IN (1, 2, 3)), -- 1: Spring, 2: Summer, 3: TAV

    comment_path TEXT, --url al documento de la review que es en un bucket de R2

    status INTEGER DEFAULT 0, -- 0: pending, 1: approved, 2: reported, 3: hidden

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, votes INTEGER DEFAULT 0,

    FOREIGN KEY (course_sigle) REFERENCES course_summary(sigle)
);
CREATE TABLE blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  organization_id INTEGER NOT NULL,
  organization_name TEXT NOT NULL,
  title TEXT NOT NULL,
  period_time TEXT NOT NULL,
  readtime INTEGER NOT NULL,
  tags TEXT, -- tag1,tag2,tag3,...
  content_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  organization_id INTEGER NOT NULL,
  organization_name TEXT NOT NULL,
  faculty TEXT NOT NULL,
  title TEXT NOT NULL,
  period_time TEXT NOT NULL,
  readtime INTEGER NOT NULL,
  code TEXT NOT NULL,
  qualification INTEGER CHECK (qualification >= 0 AND qualification <= 5),
  content_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_vote_review (
    user_id INTEGER NOT NULL,
    review_id INTEGER NOT NULL,
    vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, review_id),
    FOREIGN KEY (review_id) REFERENCES course_reviews(id)
);
DELETE FROM sqlite_sequence;
CREATE INDEX idx_course_summary_likes ON course_summary(likes DESC);
CREATE INDEX idx_course_summary_superlikes ON course_summary(superlikes DESC);
CREATE INDEX idx_course_summary_dislikes ON course_summary(dislikes DESC);
CREATE INDEX idx_course_summary_avg_weekly_hours ON course_summary(avg_weekly_hours DESC);
CREATE INDEX idx_course_summary_sort_index ON course_summary(sort_index DESC);
CREATE INDEX idx_course_summary_mandatory_attendance ON course_summary(votes_mandatory_attendance DESC);
CREATE INDEX idx_course_summary_optional_attendance ON course_summary(votes_optional_attendance DESC);
CREATE INDEX idx_course_summary_superlikes_likes ON course_summary(superlikes DESC, likes DESC);
CREATE INDEX idx_course_summary_sort_index_id ON course_summary(sort_index DESC, id DESC);
CREATE INDEX idx_course_summary_sigle_id ON course_summary(sigle, id DESC);
CREATE INDEX idx_course_reviews_course_sigle ON course_reviews(course_sigle);
CREATE INDEX idx_course_reviews_user_id ON course_reviews(user_id);
CREATE INDEX idx_course_reviews_sigle_updated ON course_reviews(course_sigle, updated_at DESC);
CREATE INDEX idx_course_reviews_like_dislike ON course_reviews(like_dislike DESC);
CREATE INDEX idx_course_reviews_workload_vote ON course_reviews(workload_vote DESC);
CREATE INDEX idx_course_reviews_attendance_type ON course_reviews(attendance_type DESC);
CREATE INDEX idx_course_reviews_year_semester ON course_reviews(year_taken DESC, semester_taken DESC);
CREATE INDEX idx_course_reviews_visible_updated
ON course_reviews(course_sigle, updated_at DESC)
WHERE status != 3;
CREATE INDEX idx_course_reviews_status_updated
ON course_reviews(course_sigle, status, updated_at DESC);
CREATE INDEX idx_course_reviews_sigle_comprehensive 
ON course_reviews(course_sigle, like_dislike, workload_vote, attendance_type, weekly_hours);
CREATE INDEX idx_course_reviews_sigle_like ON course_reviews(course_sigle, like_dislike);
CREATE INDEX idx_course_reviews_sigle_workload ON course_reviews(course_sigle, workload_vote);
CREATE INDEX idx_course_reviews_sigle_attendance ON course_reviews(course_sigle, attendance_type);
CREATE TRIGGER update_recommendations_updated_at
    AFTER UPDATE ON recommendations
    FOR EACH ROW
    BEGIN
        UPDATE recommendations
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
CREATE TRIGGER update_blogs_updated_at
    AFTER UPDATE ON blogs
    FOR EACH ROW
    BEGIN
        UPDATE blogs
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
CREATE TRIGGER trg_course_reviews_after_insert
AFTER INSERT ON course_reviews
FOR EACH ROW
BEGIN
  UPDATE course_summary
  SET
    likes = stats.likes_count,
    superlikes = stats.superlikes_count,
    dislikes = stats.dislikes_count,
    votes_low_workload = stats.votes_low,
    votes_medium_workload = stats.votes_medium,
    votes_high_workload = stats.votes_high,
    votes_mandatory_attendance = stats.votes_mandatory,
    votes_optional_attendance = stats.votes_optional,
    avg_weekly_hours = stats.avg_hours,
    sort_index = stats.sort_idx
  FROM (
    SELECT 
      -- Conteos de likes/dislikes
      SUM(CASE WHEN like_dislike = 1 THEN 1 ELSE 0 END) AS likes_count,
      SUM(CASE WHEN like_dislike = 2 THEN 1 ELSE 0 END) AS superlikes_count,
      SUM(CASE WHEN like_dislike = 0 THEN 1 ELSE 0 END) AS dislikes_count,
      
      -- Conteos de workload
      SUM(CASE WHEN workload_vote = 0 THEN 1 ELSE 0 END) AS votes_low,
      SUM(CASE WHEN workload_vote = 1 THEN 1 ELSE 0 END) AS votes_medium,
      SUM(CASE WHEN workload_vote = 2 THEN 1 ELSE 0 END) AS votes_high,
      
      -- Conteos de attendance
      SUM(CASE WHEN attendance_type = 0 THEN 1 ELSE 0 END) AS votes_mandatory,
      SUM(CASE WHEN attendance_type = 1 THEN 1 ELSE 0 END) AS votes_optional,
      
      -- Promedio de horas semanales
      AVG(CASE WHEN weekly_hours IS NOT NULL THEN weekly_hours * 1.0 ELSE NULL END) AS avg_hours,
      
      -- Cálculo del sort_index optimizado
      CASE
        WHEN COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END) = 0 THEN 0
        ELSE (SUM(CASE like_dislike WHEN 1 THEN 1 WHEN 2 THEN 2 ELSE 0 END) * 100.0 /
              COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END)) *
              COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END) /
              (COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END) + 10)
      END
      + 3 * SUM(CASE WHEN workload_vote = 0 THEN 1 ELSE 0 END)
      + 2 * SUM(CASE WHEN workload_vote = 1 THEN 1 ELSE 0 END)
      + 1 * SUM(CASE WHEN workload_vote = 2 THEN 1 ELSE 0 END) AS sort_idx
      
    FROM course_reviews 
    WHERE course_sigle = NEW.course_sigle
  ) AS stats
  WHERE sigle = NEW.course_sigle;
END;
CREATE TRIGGER trg_course_reviews_after_delete
AFTER DELETE ON course_reviews
FOR EACH ROW
BEGIN
  UPDATE course_summary
  SET
    likes = stats.likes_count,
    superlikes = stats.superlikes_count,
    dislikes = stats.dislikes_count,
    votes_low_workload = stats.votes_low,
    votes_medium_workload = stats.votes_medium,
    votes_high_workload = stats.votes_high,
    votes_mandatory_attendance = stats.votes_mandatory,
    votes_optional_attendance = stats.votes_optional,
    avg_weekly_hours = stats.avg_hours,
    sort_index = stats.sort_idx
  FROM (
    SELECT 
      -- Conteos de likes/dislikes
      SUM(CASE WHEN like_dislike = 1 THEN 1 ELSE 0 END) AS likes_count,
      SUM(CASE WHEN like_dislike = 2 THEN 1 ELSE 0 END) AS superlikes_count,
      SUM(CASE WHEN like_dislike = 0 THEN 1 ELSE 0 END) AS dislikes_count,
      
      -- Conteos de workload
      SUM(CASE WHEN workload_vote = 0 THEN 1 ELSE 0 END) AS votes_low,
      SUM(CASE WHEN workload_vote = 1 THEN 1 ELSE 0 END) AS votes_medium,
      SUM(CASE WHEN workload_vote = 2 THEN 1 ELSE 0 END) AS votes_high,
      
      -- Conteos de attendance
      SUM(CASE WHEN attendance_type = 0 THEN 1 ELSE 0 END) AS votes_mandatory,
      SUM(CASE WHEN attendance_type = 1 THEN 1 ELSE 0 END) AS votes_optional,
      
      -- Promedio de horas semanales
      AVG(CASE WHEN weekly_hours IS NOT NULL THEN weekly_hours * 1.0 ELSE NULL END) AS avg_hours,
      
      -- Cálculo del sort_index optimizado
      CASE
        WHEN COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END) = 0 THEN 0
        ELSE (SUM(CASE like_dislike WHEN 1 THEN 1 WHEN 2 THEN 2 ELSE 0 END) * 100.0 /
              COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END)) *
              COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END) /
              (COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END) + 10)
      END
      + 3 * SUM(CASE WHEN workload_vote = 0 THEN 1 ELSE 0 END)
      + 2 * SUM(CASE WHEN workload_vote = 1 THEN 1 ELSE 0 END)
      + 1 * SUM(CASE WHEN workload_vote = 2 THEN 1 ELSE 0 END) AS sort_idx
      
    FROM course_reviews 
    WHERE course_sigle = OLD.course_sigle
  ) AS stats
  WHERE sigle = OLD.course_sigle;
END;
CREATE TRIGGER trg_course_reviews_after_update
AFTER UPDATE ON course_reviews
FOR EACH ROW
BEGIN
  -- Actualiza el resumen de course_summary con una sola consulta
  UPDATE course_summary
  SET
    likes = stats.likes_count,
    superlikes = stats.superlikes_count,
    dislikes = stats.dislikes_count,
    votes_low_workload = stats.votes_low,
    votes_medium_workload = stats.votes_medium,
    votes_high_workload = stats.votes_high,
    votes_mandatory_attendance = stats.votes_mandatory,
    votes_optional_attendance = stats.votes_optional,
    avg_weekly_hours = stats.avg_hours,
    sort_index = stats.sort_idx
  FROM (
    SELECT 
      -- Conteos de likes/dislikes
      SUM(CASE WHEN like_dislike = 1 THEN 1 ELSE 0 END) AS likes_count,
      SUM(CASE WHEN like_dislike = 2 THEN 1 ELSE 0 END) AS superlikes_count,
      SUM(CASE WHEN like_dislike = 0 THEN 1 ELSE 0 END) AS dislikes_count,
      
      -- Conteos de workload
      SUM(CASE WHEN workload_vote = 0 THEN 1 ELSE 0 END) AS votes_low,
      SUM(CASE WHEN workload_vote = 1 THEN 1 ELSE 0 END) AS votes_medium,
      SUM(CASE WHEN workload_vote = 2 THEN 1 ELSE 0 END) AS votes_high,
      
      -- Conteos de attendance
      SUM(CASE WHEN attendance_type = 0 THEN 1 ELSE 0 END) AS votes_mandatory,
      SUM(CASE WHEN attendance_type = 1 THEN 1 ELSE 0 END) AS votes_optional,
      
      -- Promedio de horas semanales
      AVG(CASE WHEN weekly_hours IS NOT NULL THEN weekly_hours * 1.0 ELSE NULL END) AS avg_hours,
      
      -- Cálculo del sort_index optimizado
      CASE
        WHEN COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END) = 0 THEN 0
        ELSE (SUM(CASE like_dislike WHEN 1 THEN 1 WHEN 2 THEN 2 ELSE 0 END) * 100.0 /
              COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END)) *
              COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END) /
              (COUNT(CASE WHEN like_dislike IN (0,1,2) THEN 1 END) + 10)
      END
      + 3 * SUM(CASE WHEN workload_vote = 0 THEN 1 ELSE 0 END)
      + 2 * SUM(CASE WHEN workload_vote = 1 THEN 1 ELSE 0 END)
      + 1 * SUM(CASE WHEN workload_vote = 2 THEN 1 ELSE 0 END) AS sort_idx
      
    FROM course_reviews 
    WHERE course_sigle = NEW.course_sigle
  ) AS stats
  WHERE sigle = NEW.course_sigle;
END;
