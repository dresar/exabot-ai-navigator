import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type MeUser = {
  id: string;
  email: string;
  username: string;
  plan: string;
  is_active: boolean;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<MeUser>("/users/me"),
  });
}
