export type CourseScore = {
  id: number;
  sigle: string;
  superlikes: number;
  likes: number;
  dislikes: number;
  votes_low_workload: number;
  votes_medium_workload: number;
  votes_high_workload: number;
  votes_mandatory_attendance: number;
  votes_optional_attendance: number;
  avg_weekly_hours: number;
  sort_index: number;
  name: string;
  credits: number;
  req: string;
  conn: string;
  restr: string;
  equiv: string;
  format: string[];
  campus: string[];
  is_removable: boolean[];
  is_special: boolean;
  is_english: boolean;
  school: string;
  area: string;
  categories: string[];
  last_semester: string;
};

export interface CourseReview {
	id: number
	user_id: string
	course_sigle: string
	like_dislike: number // 0: dislike, 1: like, 2: superlike
	workload_vote: number // 0: low, 1: medium, 2: high
	attendance_type: number // 0: mandatory, 1: optional, 2: no attendance
	weekly_hours: number
	year_taken: number
	semester_taken: number // 1 or 2
	comment_path: string | null
	status: number // 0: pending, 1: approved, 2: reported, 3: hidden
	created_at: string
	updated_at: string
	votes: number
}