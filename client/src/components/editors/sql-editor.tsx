import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QueryResults from "@/components/database/query-results";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { QueryResult } from "@shared/schema";

interface QueryTab {
  id: string;
  name: string;
  sql: string;
}

export default function SQLEditor() {
  const [tabs, setTabs] = useState<QueryTab[]>([
    { id: "1", name: "Query #1", sql: "SELECT \n    u.id,\n    u.username,\n    u.email,\n    u.created_at,\n    COUNT(p.id) AS post_count\nFROM users u\nLEFT JOIN posts p ON u.id = p.user_id\nWHERE u.status = 'active'\nGROUP BY u.id, u.username, u.email, u.created_at\nORDER BY u.created_at DESC;" }
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const executeQueryMutation = useMutation({
    mutationFn: async (sql: string) => {
      const response = await apiRequest("POST", "/api/query/execute", { sql });
      return response.json();
    },
    onSuccess: (result: QueryResult) => {
      setQueryResult(result);
      toast({
        title: "Query executed successfully",
        description: `${result.rowCount} rows returned in ${result.executionTime}ms`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Query execution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addNewTab = () => {
    const newId = (tabs.length + 1).toString();
    const newTab = {
      id: newId,
      name: `Query #${newId}`,
      sql: "",
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const updateTabSQL = (tabId: string, sql: string) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId ? { ...tab, sql } : tab
    ));
  };

  const executeQuery = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab && currentTab.sql.trim()) {
      executeQueryMutation.mutate(currentTab.sql);
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeQuery();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs]);

  return (
    <div className="flex-1 flex flex-col" data-testid="sql-editor-container">
      {/* Query Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-2">
        <div className="flex items-center space-x-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="flex items-center space-x-1">
              <TabsList className="bg-transparent">
                {tabs.map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="bg-slate-700 text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    data-testid={`tab-${tab.id}`}
                  >
                    <span>{tab.name}</span>
                    {tabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        className="ml-2 text-slate-400 hover:text-white"
                        data-testid={`close-tab-${tab.id}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button
                onClick={addNewTab}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
                data-testid="button-new-tab"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Query
              </Button>
            </div>
          </Tabs>
          
          <Button
            onClick={executeQuery}
            disabled={!currentTab?.sql.trim() || executeQueryMutation.isPending}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-execute-query"
          >
            <Play className="h-4 w-4 mr-2" />
            {executeQueryMutation.isPending ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-slate-900">
          <div className="h-full font-mono text-sm">
            <div className="flex h-full">
              {/* Line Numbers */}
              <div className="w-12 bg-slate-800 border-r border-slate-700 flex flex-col text-slate-500 text-xs select-none">
                {currentTab?.sql.split('\n').map((_, index) => (
                  <div key={index} className="px-2 py-1 text-center min-h-[24px]">
                    {index + 1}
                  </div>
                ))}
              </div>
              
              {/* Code Content */}
              <div className="flex-1 relative">
                <textarea
                  ref={editorRef}
                  value={currentTab?.sql || ""}
                  onChange={(e) => currentTab && updateTabSQL(currentTab.id, e.target.value)}
                  placeholder="-- Write your SQL query here
SELECT * FROM users
WHERE status = 'active'
ORDER BY created_at DESC;"
                  className="w-full h-full p-4 bg-transparent text-slate-200 resize-none outline-none font-mono leading-6"
                  style={{ 
                    lineHeight: '24px',
                    fontSize: '14px',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                  data-testid="sql-textarea"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Query Results */}
      <QueryResults 
        result={queryResult}
        isLoading={executeQueryMutation.isPending}
        data-testid="query-results"
      />
    </div>
  );
}
