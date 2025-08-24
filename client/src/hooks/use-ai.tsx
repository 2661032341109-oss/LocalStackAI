import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AIResponse } from "@shared/schema";

export function useAI() {
  const { toast } = useToast();

  const generateQuery = useMutation({
    mutationFn: async ({ 
      prompt, 
      tableSchema 
    }: { 
      prompt: string; 
      tableSchema?: string 
    }): Promise<AIResponse> => {
      const response = await apiRequest("POST", "/api/ai/generate", { 
        prompt, 
        tableSchema 
      });
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "AI request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const optimizeQuery = useMutation({
    mutationFn: async (sqlQuery: string): Promise<AIResponse> => {
      const response = await apiRequest("POST", "/api/ai/optimize", { sqlQuery });
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Query optimization failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const explainQuery = useMutation({
    mutationFn: async (sqlQuery: string): Promise<AIResponse> => {
      const response = await apiRequest("POST", "/api/ai/explain", { sqlQuery });
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Query explanation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    generateQuery,
    optimizeQuery,
    explainQuery,
  };
}
