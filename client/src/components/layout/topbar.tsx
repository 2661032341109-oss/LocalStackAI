import { Play, Save, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TopBarProps {
  viewMode: "sql" | "table";
  onToggleAI: () => void;
}

export default function TopBar({ viewMode, onToggleAI }: TopBarProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4" data-testid="topbar-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">
            {viewMode === "sql" ? "SQL Editor" : "Table Editor"}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Database:</span>
            <Select defaultValue="main.db">
              <SelectTrigger className="w-32 bg-slate-700 text-white border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main.db">main.db</SelectItem>
                <SelectItem value="users.db">users.db</SelectItem>
                <SelectItem value="analytics.db">analytics.db</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {viewMode === "sql" && (
            <>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 text-slate-300"
                data-testid="button-save-query"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Query
              </Button>
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-run-query"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Query
              </Button>
            </>
          )}
          <Button
            onClick={onToggleAI}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-toggle-ai"
          >
            <Bot className="h-4 w-4 mr-2" />
            Ask AI
          </Button>
        </div>
      </div>
    </header>
  );
}
