import { programs } from "@/data/programs";

export function usePrograms() {
  return {
    programs,
    loading: false,
  };
}
