import { Database, Table, Eye, Bolt, Code, Edit, Bot, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface SidebarProps {
  viewMode: "sql" | "table";
  onViewModeChange: (mode: "sql" | "table") => void;
  onTableSelect: (tableName: string) => void;
  onToggleAI?: () => void;
}

export default function Sidebar({ viewMode, onViewModeChange, onTableSelect, onToggleAI }: SidebarProps) {
  const { data: tables = [] } = useQuery<Array<{ name: string; type: string; rowCount: number }>>({
    queryKey: ["/api/tables"],
  });

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col" data-testid="sidebar-container">
      {/* Logo & Brand */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Database className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">LocalBase</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">Database Management</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Database</h3>
          <ul className="space-y-1">
            <li>
              <button 
                className="flex items-center w-full px-3 py-2 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors group"
                data-testid="nav-tables"
              >
                <Table className="text-slate-400 group-hover:text-blue-400 w-5 h-5" />
                <span className="ml-3">Tables</span>
                <span className="ml-auto text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">
                  {tables.length}
                </span>
              </button>
            </li>
            <li>
              <button 
                className="flex items-center w-full px-3 py-2 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors group"
                data-testid="nav-views"
              >
                <Eye className="text-slate-400 group-hover:text-blue-400 w-5 h-5" />
                <span className="ml-3">Views</span>
                <span className="ml-auto text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">0</span>
              </button>
            </li>
            <li>
              <button 
                className="flex items-center w-full px-3 py-2 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors group"
                data-testid="nav-functions"
              >
                <Bolt className="text-slate-400 group-hover:text-blue-400 w-5 h-5" />
                <span className="ml-3">Functions</span>
                <span className="ml-auto text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">0</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tools</h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => onViewModeChange("sql")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg transition-colors group",
                  viewMode === "sql" 
                    ? "text-white bg-blue-600" 
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
                data-testid="nav-sql-editor"
              >
                <Code className="w-5 h-5" />
                <span className="ml-3">SQL Editor</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onViewModeChange("table")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg transition-colors group",
                  viewMode === "table"
                    ? "text-white bg-blue-600"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
                data-testid="nav-table-editor"
              >
                <Edit className="text-slate-400 group-hover:text-blue-400 w-5 h-5" />
                <span className="ml-3">Table Editor</span>
              </button>
            </li>
            <li>
              <button 
                onClick={onToggleAI}
                className="flex items-center w-full px-3 py-2 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors group"
                data-testid="nav-ai-assistant"
              >
                <Bot className="text-slate-400 group-hover:text-blue-400 w-5 h-5" />
                <span className="ml-3">AI Assistant</span>
                <span className="ml-auto w-2 h-2 bg-green-500 rounded-full" title="AI Online"></span>
              </button>
            </li>
          </ul>
        </div>

        {/* Tables list */}
        {tables.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tables</h3>
            <ul className="space-y-1">
              {tables.map((table) => (
                <li key={table.name}>
                  <button
                    onClick={() => {
                      onTableSelect(table.name);
                      onViewModeChange("table");
                    }}
                    className="flex items-center w-full px-3 py-2 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors group text-sm"
                    data-testid={`table-${table.name}`}
                  >
                    <Table className="text-slate-400 group-hover:text-blue-400 w-4 h-4" />
                    <span className="ml-3 truncate">{table.name}</span>
                    <span className="ml-auto text-xs text-slate-400">{table.rowCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Connection</h3>
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-white">localhost</span>
            </div>
            <p className="text-xs text-slate-400">./data/local.db</p>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">U</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Local User</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
          <button className="text-slate-400 hover:text-white" data-testid="settings-button">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
