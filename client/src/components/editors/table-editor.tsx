import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TableEditorProps {
  selectedTable: string | null;
}

export default function TableEditor({ selectedTable }: TableEditorProps) {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tables = [] } = useQuery<Array<{ name: string; type: string; rowCount: number }>>({
    queryKey: ["/api/tables"],
  });

  const currentTable = selectedTable || (tables.length > 0 ? tables[0].name : null);

  const { data: tableData, isLoading: isLoadingData } = useQuery<{ data: any[]; total: number }>({
    queryKey: ["/api/tables", currentTable, "data", { limit: pageSize, offset: currentPage * pageSize }],
    enabled: !!currentTable,
  });

  const { data: schema = [] } = useQuery<Array<{ name: string; type: string; pk: boolean; notnull: boolean }>>({
    queryKey: ["/api/tables", currentTable, "schema"],
    enabled: !!currentTable,
  });

  const updateRowMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      await apiRequest("PUT", `/api/tables/${currentTable}/rows/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables", currentTable, "data"] });
      setEditingRow(null);
      setEditData({});
      toast({ title: "Row updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteRowMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tables/${currentTable}/rows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables", currentTable, "data"] });
      toast({ title: "Row deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  const addRowMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      await apiRequest("POST", `/api/tables/${currentTable}/rows`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables", currentTable, "data"] });
      toast({ title: "Row added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Add failed", description: error.message, variant: "destructive" });
    },
  });

  const startEdit = (row: any) => {
    setEditingRow(row.id);
    setEditData({ ...row });
  };

  const saveEdit = () => {
    if (editingRow && editData) {
      updateRowMutation.mutate({ id: editingRow, data: editData });
    }
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const getColumnType = (columnName: string) => {
    const column = schema.find((col) => col.name === columnName);
    return column?.type?.toLowerCase() || 'text';
  };

  const renderEditableCell = (row: any, column: any) => {
    const isEditing = editingRow === row.id;
    const value = isEditing ? editData[column.name] : row[column.name];
    const columnType = getColumnType(column.name);

    if (!isEditing) {
      return (
        <span className="text-slate-200">
          {value !== null && value !== undefined ? String(value) : ''}
        </span>
      );
    }

    if (column.name === 'id' && column.pk) {
      return (
        <Input
          value={value || ''}
          readOnly
          className="bg-slate-800 border-slate-600 text-slate-400"
        />
      );
    }

    if (columnType.includes('enum') || column.name === 'status') {
      return (
        <Select value={value || ''} onValueChange={(val) => handleInputChange(column.name, val)}>
          <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">active</SelectItem>
            <SelectItem value="inactive">inactive</SelectItem>
            <SelectItem value="suspended">suspended</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (columnType.includes('datetime') || columnType.includes('timestamp')) {
      const dateValue = value ? new Date(value).toISOString().slice(0, 16) : '';
      return (
        <Input
          type="datetime-local"
          value={dateValue}
          onChange={(e) => handleInputChange(column.name, e.target.value)}
          className="bg-slate-800 border-slate-600 text-slate-200"
        />
      );
    }

    if (columnType.includes('int') || columnType.includes('number')) {
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => handleInputChange(column.name, e.target.value)}
          className="bg-slate-800 border-slate-600 text-slate-200"
        />
      );
    }

    return (
      <Input
        type={columnType.includes('email') ? 'email' : 'text'}
        value={value || ''}
        onChange={(e) => handleInputChange(column.name, e.target.value)}
        className="bg-slate-800 border-slate-600 text-slate-200"
      />
    );
  };

  if (!currentTable) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p>No tables available</p>
          <p className="text-sm mt-2">Create a table to get started</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((tableData?.total || 0) / pageSize);

  return (
    <div className="flex-1 flex flex-col bg-slate-900" data-testid="table-editor-container">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          Table Editor - {currentTable}
        </h3>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => {/* TODO: Implement add row */}}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-add-row"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
          {editingRow && (
            <>
              <Button
                onClick={saveEdit}
                disabled={updateRowMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-save-changes"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={cancelEdit}
                variant="secondary"
                className="bg-slate-700 hover:bg-slate-600 text-slate-300"
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Table Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading table data...</div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-lg overflow-hidden">
            <table className="w-full text-sm" data-testid="data-table">
              <thead className="bg-slate-700">
                <tr>
                  {schema.map((column) => (
                    <th key={column.name} className="px-4 py-3 text-left text-slate-300 font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{column.name}</span>
                        <span className={`text-xs ${
                          column.type.toLowerCase().includes('int') ? 'text-blue-400' :
                          column.type.toLowerCase().includes('varchar') || column.type.toLowerCase().includes('text') ? 'text-yellow-400' :
                          column.type.toLowerCase().includes('datetime') ? 'text-purple-400' :
                          'text-green-400'
                        }`}>
                          {column.type}{column.pk ? ' PK' : ''}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-slate-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.data?.map((row: any) => (
                  <tr 
                    key={row.id} 
                    className="border-b border-slate-700 hover:bg-slate-750 group"
                    data-testid={`row-${row.id}`}
                  >
                    {schema.map((column) => (
                      <td key={column.name} className="px-4 py-3">
                        {renderEditableCell(row, column)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <div className={`flex items-center justify-center space-x-2 ${
                        editingRow === row.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } transition-opacity`}>
                        {editingRow !== row.id && (
                          <>
                            <button
                              onClick={() => startEdit(row)}
                              className="text-blue-400 hover:text-blue-300 p-1"
                              data-testid={`edit-row-${row.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteRowMutation.mutate(row.id)}
                              disabled={deleteRowMutation.isPending}
                              className="text-red-400 hover:text-red-300 p-1"
                              data-testid={`delete-row-${row.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, tableData?.total || 0)} of {tableData?.total || 0} records
          </span>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              variant="secondary"
              size="sm"
              className="bg-slate-700 hover:bg-slate-600 text-slate-300"
              data-testid="button-previous-page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  variant={pageNum === currentPage ? "default" : "secondary"}
                  size="sm"
                  className={pageNum === currentPage ? "bg-blue-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}
                  data-testid={`page-${pageNum + 1}`}
                >
                  {pageNum + 1}
                </Button>
              );
            })}
            
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              variant="secondary"
              size="sm"
              className="bg-slate-700 hover:bg-slate-600 text-slate-300"
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
