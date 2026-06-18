interface Career {
  id: number;
  name: string;
}

interface Organization {
  id: number;
  name: string;
  display_name: string;
  role: string;
}

export type { Career, Organization };
