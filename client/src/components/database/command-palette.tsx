import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, FileText, Bot, Table } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onViewModeChange: (mode: "sql" | "table") => void;
  onTableSelect: (tableName: string) => void;
}

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onViewModeChange, 
  onTableSelect 
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: tables = [] } = useQuery<Array<{ name: string; type: string; rowCount: number }>>({
    queryKey: ["/api/tables"],
  });

  const commands: Command[] = [
    {
      id: "new-query",
      title: "New SQL query",
      description: "Create a new SQL query tab",
      icon: <FileText className="h-4 w-4 text-green-400" />,
      action: () => {
        onViewModeChange("sql");
        onClose();
      },
      category: "Quick Actions"
    },
    {
      id: "table-editor",
      title: "Open Table Editor",
      description: "Switch to table editor mode",
      icon: <Table className="h-4 w-4 text-blue-400" />,
      action: () => {
        onViewModeChange("table");
        onClose();
      },
      category: "Quick Actions"
    },
    {
      id: "ai-assistant",
      title: "Ask AI assistant",
      description: "Open AI assistant for help",
      icon: <Bot className="h-4 w-4 text-purple-400" />,
      action: () => {
        // This would trigger AI assistant opening
        onClose();
      },
      category: "Quick Actions"
    },
    ...tables.map((table: any) => ({
      id: `table-${table.name}`,
      title: table.name,
      description: `${table.rowCount} rows`,
      icon: <Table className="h-4 w-4 text-yellow-400" />,
      action: () => {
        onTableSelect(table.name);
        onViewModeChange("table");
        onClose();
      },
      category: "Tables"
    }))
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(search.toLowerCase()) ||
    command.description.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    const category = command.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-2xl bg-slate-800 border-slate-700 p-0"
        data-testid="command-palette-dialog"
      >
        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tables, run commands, or ask AI..."
              className="pl-10 bg-slate-900 text-white border-slate-700 focus:border-blue-500"
              autoFocus
              data-testid="command-search-input"
            />
          </div>
        </div>

        {/* Commands List */}
        <ScrollArea className="border-t border-slate-700 max-h-80">
          {Object.entries(groupedCommands).length > 0 ? (
            Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="px-4 py-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {category}
                </div>
                {categoryCommands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  return (
                    <div
                      key={command.id}
                      onClick={command.action}
                      className={`px-4 py-2 cursor-pointer flex items-center space-x-3 rounded-md ${
                        globalIndex === selectedIndex 
                          ? 'bg-slate-700' 
                          : 'hover:bg-slate-700'
                      }`}
                      data-testid={`command-${command.id}`}
                    >
                      {command.icon}
                      <div className="flex-1">
                        <div className="text-slate-200">{command.title}</div>
                        {command.description && (
                          <div className="text-xs text-slate-400">{command.description}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-slate-400">
              No commands found
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-700 text-xs text-slate-400 flex items-center space-x-4">
          <span>↵ to select</span>
          <span>↑↓ to navigate</span>
          <span>ESC to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
