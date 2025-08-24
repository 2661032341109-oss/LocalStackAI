import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import SQLEditor from "@/components/editors/sql-editor";
import TableEditor from "@/components/editors/table-editor";
import AIAssistant from "@/components/ai/ai-assistant";
import CommandPalette from "@/components/database/command-palette";

type ViewMode = "sql" | "table";

export default function DatabasePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("sql");
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsCommandPaletteOpen(true);
    }
    if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    }
  };

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100" data-testid="database-page">
      <Sidebar 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onTableSelect={setSelectedTable}
        onToggleAI={() => setIsAIOpen(!isAIOpen)}
        data-testid="sidebar"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          viewMode={viewMode}
          onToggleAI={() => setIsAIOpen(!isAIOpen)}
          data-testid="topbar"
        />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            {viewMode === "sql" ? (
              <SQLEditor data-testid="sql-editor" />
            ) : (
              <TableEditor 
                selectedTable={selectedTable}
                data-testid="table-editor"
              />
            )}
          </div>
          
          {isAIOpen && (
            <AIAssistant 
              onClose={() => setIsAIOpen(false)}
              data-testid="ai-assistant"
            />
          )}
        </div>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onViewModeChange={setViewMode}
        onTableSelect={setSelectedTable}
        data-testid="command-palette"
      />
    </div>
  );
}
