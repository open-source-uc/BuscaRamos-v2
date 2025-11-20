export type CourseDB = {
    id: number
    sigle: string
    likes: number
    dislikes: number
    superlikes: number
    votes_low_workload: number
    votes_medium_workload: number
    votes_high_workload: number
    votes_mandatory_attendance: number
    votes_optional_attendance: number
    avg_weekly_hours: number
    sort_index: number
}
export type CourseScore = CourseDB & {
  name: string;
  credits: number;
  parsed_meta_data: {
    has_prerequisites: boolean;
    has_restrictions: boolean;
    has_equivalences: boolean;
    unlocks_courses: boolean;
    prerequisites?: any;
    restrictions?: any;
    connector?: string;
    equivalences?: string[];
    unlocks?: Record<string, any>;
  };
  format: string[];
  campus: string[];
  is_removable: boolean[];
  is_special: boolean[];
  is_english: boolean[];
  school: string;
  area: string[];
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

export const NULL_STRING = "IHHUQWUPIQWEEWHPQEPIUEWUJWQEPQPWJP"


// Tipos para matriz de horarios
export interface ScheduleBlock {
	type: string // Tipo de clase (CLAS, LAB, AYUD)
	classroom: string // Ubicación del aula
	courseId: string // Identificador del curso
	courseName?: string // Nombre del curso
	section: string // Identificador de la sección
	campus?: string // Campus de la sección
}

export interface CourseSection {
	schedule: Record<string, [string, string]> // código de bloque -> [tipo, aula]
	nrc?: string
	section?: number
	format?: string
	campus?: string
	category?: string
	area?: string
	is_english?: boolean // Valor booleano individual de la sección
	is_removable?: boolean // Valor booleano individual de la sección
	is_special?: boolean // Valor booleano individual de la sección
	total_quota?: number
	quota?: Record<string, number>
	name?: string // Course name for display purposes
}

export interface CourseSections {
	[courseId: string]: {
		[sectionId: string]: CourseSection
	}
}

export type ScheduleMatrix = ScheduleBlock[][][] // [franjaHoraria][diaSemana][clases]

