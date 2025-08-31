
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, Edit3, Save, X, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBarcodeSpreadsheets, BarcodeSpreadsheet } from '@/hooks/useBarcodeSpreadsheets';

interface SpreadsheetViewerProps {
  spreadsheet?: BarcodeSpreadsheet;
  onUpdate?: (spreadsheet: BarcodeSpreadsheet) => void;
}

const SpreadsheetViewer: React.FC<SpreadsheetViewerProps> = ({
  spreadsheet,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{
    headers: string[];
    rows: any[][];
  }>({
    headers: spreadsheet?.headers || [],
    rows: spreadsheet?.rows || []
  });
  const { updateSpreadsheet } = useBarcodeSpreadsheets();

  if (!spreadsheet) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Table className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No spreadsheet selected</p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    try {
      const updated = await updateSpreadsheet.mutateAsync({
        id: spreadsheet.id,
        headers: editData.headers,
        rows: editData.rows,
        version: spreadsheet.version + 1
      });
      
      setIsEditing(false);
      onUpdate?.(updated);
    } catch (error) {
      console.error('Failed to update spreadsheet:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      headers: spreadsheet.headers,
      rows: spreadsheet.rows
    });
    setIsEditing(false);
  };

  const addRow = () => {
    const newRow = new Array(editData.headers.length).fill('');
    setEditData({
      ...editData,
      rows: [...editData.rows, newRow]
    });
  };

  const removeRow = (index: number) => {
    setEditData({
      ...editData,
      rows: editData.rows.filter((_, i) => i !== index)
    });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...editData.rows];
    newRows[rowIndex][colIndex] = value;
    setEditData({
      ...editData,
      rows: newRows
    });
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...editData.headers];
    newHeaders[index] = value;
    setEditData({
      ...editData,
      headers: newHeaders
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                {spreadsheet.title}
              </CardTitle>
              {spreadsheet.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {spreadsheet.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                v{spreadsheet.version}
              </Badge>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  variant="outline"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted/50">
                  {(isEditing ? editData.headers : spreadsheet.headers).map((header, index) => (
                    <th key={index} className="border border-border p-2 text-left">
                      {isEditing ? (
                        <Input
                          value={header}
                          onChange={(e) => updateHeader(index, e.target.value)}
                          className="min-w-0"
                        />
                      ) : (
                        <span className="font-medium">{header}</span>
                      )}
                    </th>
                  ))}
                  {isEditing && (
                    <th className="border border-border p-2 w-12">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(isEditing ? editData.rows : spreadsheet.rows).map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-muted/30">
                    {row.map((cell: any, colIndex: number) => (
                      <td key={colIndex} className="border border-border p-2">
                        {isEditing ? (
                          <Input
                            value={cell || ''}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="min-w-0"
                          />
                        ) : (
                          <span>{cell}</span>
                        )}
                      </td>
                    ))}
                    {isEditing && (
                      <td className="border border-border p-2">
                        <Button
                          onClick={() => removeRow(rowIndex)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isEditing && (
            <div className="mt-4 flex justify-start">
              <Button onClick={addRow} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            {spreadsheet.rows.length} rows × {spreadsheet.headers.length} columns
            {spreadsheet.source_scan_id && (
              <span className="ml-2">• Created from barcode scan</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SpreadsheetViewer;
