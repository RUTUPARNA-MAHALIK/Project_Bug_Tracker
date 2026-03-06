import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useBugs() {
  return useQuery({
    queryKey: [api.bugs.list.path],
    queryFn: async () => {
      const res = await fetch(api.bugs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bugs");
      const data = await res.json();
      return parseWithLogging(api.bugs.list.responses[200], data, "bugs.list");
    },
  });
}

export function useBug(id: number) {
  return useQuery({
    queryKey: [api.bugs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.bugs.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch bug");
      const data = await res.json();
      return parseWithLogging(api.bugs.get.responses[200], data, "bugs.get");
    },
    enabled: !!id,
  });
}

export function useCreateBug() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: z.infer<typeof api.bugs.create.input>) => {
      const validated = api.bugs.create.input.parse(input);
      const res = await fetch(api.bugs.create.path, {
        method: api.bugs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = parseWithLogging(api.bugs.create.responses[400], data, "bugs.create.error");
          throw new Error(error.message);
        }
        throw new Error("Failed to create bug");
      }
      
      return parseWithLogging(api.bugs.create.responses[201], data, "bugs.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bugs.list.path] });
    },
  });
}

export function useUpdateBug() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<z.infer<typeof api.bugs.update.input>>) => {
      const validated = api.bugs.update.input.parse(updates);
      const url = buildUrl(api.bugs.update.path, { id });
      
      const res = await fetch(url, {
        method: api.bugs.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 400) {
          const error = parseWithLogging(api.bugs.update.responses[400], data, "bugs.update.error");
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error("Bug not found");
        throw new Error("Failed to update bug");
      }
      
      const data = await res.json();
      return parseWithLogging(api.bugs.update.responses[200], data, "bugs.update");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.bugs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.bugs.get.path, variables.id] });
    },
  });
}

export function useDeleteBug() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.bugs.delete.path, { id });
      const res = await fetch(url, { 
        method: api.bugs.delete.method,
        credentials: "include" 
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Bug not found");
        throw new Error("Failed to delete bug");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bugs.list.path] });
    },
  });
}
