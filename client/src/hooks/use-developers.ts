import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useDevelopers() {
  return useQuery({
    queryKey: [api.developers.list.path],
    queryFn: async () => {
      const res = await fetch(api.developers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch developers");
      const data = await res.json();
      return parseWithLogging(api.developers.list.responses[200], data, "developers.list");
    },
  });
}

export function useCreateDeveloper() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: z.infer<typeof api.developers.create.input>) => {
      const validated = api.developers.create.input.parse(input);
      const res = await fetch(api.developers.create.path, {
        method: api.developers.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = parseWithLogging(api.developers.create.responses[400], data, "developers.create.error");
          throw new Error(error.message);
        }
        throw new Error("Failed to create developer");
      }
      
      return parseWithLogging(api.developers.create.responses[201], data, "developers.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.developers.list.path] });
    },
  });
}
