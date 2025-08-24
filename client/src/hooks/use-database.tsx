import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { QueryResult } from "@shared/schema";

export function useDatabase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const executeQuery = useMutation({
    mutationFn: async (sql: string): Promise<QueryResult> => {
      const response = await apiRequest("POST", "/api/query/execute", { sql });
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Query execution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: tables, isLoading: isLoadingTables } = useQuery({
    queryKey: ["/api/tables"],
  });

  const getTableData = (tableName: string, limit = 100, offset = 0) => {
    return useQuery({
      queryKey: ["/api/tables", tableName, "data", { limit, offset }],
      enabled: !!tableName,
    });
  };

  const getTableSchema = (tableName: string) => {
    return useQuery({
      queryKey: ["/api/tables", tableName, "schema"],
      enabled: !!tableName,
    });
  };

  const updateTableRow = useMutation({
    mutationFn: async ({ 
      tableName, 
      id, 
      data 
    }: { 
      tableName: string; 
      id: string; 
      data: Record<string, any> 
    }) => {
      await apiRequest("PUT", `/api/tables/${tableName}/rows/${id}`, data);
    },
    onSuccess: (_, { tableName }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables", tableName, "data"] });
      toast({ title: "Row updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTableRow = useMutation({
    mutationFn: async ({ tableName, id }: { tableName: string; id: string }) => {
      await apiRequest("DELETE", `/api/tables/${tableName}/rows/${id}`);
    },
    onSuccess: (_, { tableName }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables", tableName, "data"] });
      toast({ title: "Row deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const insertTableRow = useMutation({
    mutationFn: async ({ 
      tableName, 
      data 
    }: { 
      tableName: string; 
      data: Record<string, any> 
    }) => {
      await apiRequest("POST", `/api/tables/${tableName}/rows`, data);
    },
    onSuccess: (_, { tableName }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables", tableName, "data"] });
      toast({ title: "Row added successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Insert failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Queries
    executeQuery,
    tables,
    isLoadingTables,
    getTableData,
    getTableSchema,
    
    // Mutations
    updateTableRow,
    deleteTableRow,
    insertTableRow,
  };
}
