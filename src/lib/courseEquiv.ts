export interface EquivalentCourse {
  sigle: string
  name?: string
}

export interface EquivalentGroup {
  type: 'AND' | 'OR'
  courses: EquivalentCourse[]
  groups?: EquivalentGroup[]
}

export interface ParsedEquivalents {
  hasEquivalents: boolean
  structure?: EquivalentGroup
}
