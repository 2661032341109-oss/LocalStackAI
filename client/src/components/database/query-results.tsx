import { Clock, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { QueryResult } from "@shared/schema";

interface QueryResultsProps {
  result: QueryResult | null;
  isLoading?: boolean;
}

export default function QueryResults({ result, isLoading }: QueryResultsProps) {
  const { toast } = useToast();

  const copyResults = () => {
    if (!result) return;
    
    const csvContent = [
      result.columns.join(','),
      ...result.rows.map(row => row.join(','))
    ].join('\n');
    
    navigator.clipboard.writeText(csvContent);
    toast({ title: "Results copied to clipboard" });
  };

  const exportResults = () => {
    if (!result) return;
    
    const csvContent = [
      result.columns.join(','),
      ...result.rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Results exported successfully" });
  };

  return (
    <div className="h-80 border-t border-slate-700 bg-slate-800 flex flex-col" data-testid="query-results-container">
      {/* Header */}
      <div className="px-6 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium text-white">Query Results</h3>
          {result && (
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Clock className="h-4 w-4" />
              <span data-testid="execution-time">{result.executionTime}ms</span>
              <span>•</span>
              <span data-testid="row-count">{result.rowCount} rows</span>
            </div>
          )}
        </div>
        {result && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={exportResults}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              data-testid="button-export"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              onClick={copyResults}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              data-testid="button-copy"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        )}
      </div>
      
      {/* Results Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">Executing query...</div>
          </div>
        ) : result ? (
          <ScrollArea className="h-full">
            <table className="w-full text-sm" data-testid="results-table">
              <thead className="bg-slate-700 sticky top-0">
                <tr>
                  {result.columns.map((column) => (
                    <th 
                      key={column} 
                      className="px-4 py-2 text-left text-slate-300 font-medium"
                      data-testid={`column-${column}`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className="border-b border-slate-700 hover:bg-slate-750"
                    data-testid={`result-row-${rowIndex}`}
                  >
                    {row.map((cell, cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className="px-4 py-2 text-slate-200"
                        data-testid={`cell-${rowIndex}-${cellIndex}`}
                      >
                        {cell !== null && cell !== undefined ? String(cell) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <p>No query results to display</p>
              <p className="text-sm mt-1">Execute a query to see results here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
