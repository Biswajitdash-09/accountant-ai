
import { useState } from "react";
import { Upload as UploadIcon, File, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // In a real application, you would process the files here
    // For demo purposes, we'll just add their names to the list
    const newFiles = Array.from(e.dataTransfer.files).map(file => ({
      name: file.name,
      size: formatFileSize(file.size),
    }));
    
    setFiles([...files, ...newFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // In a real application, you would process the files here
      // For demo purposes, we'll just add their names to the list
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: formatFileSize(file.size),
      }));
      
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Documents</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Upload your invoices, receipts, and financial documents for AI processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-1">
                  Drag and drop your files here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse from your computer
                </p>
                <div>
                  <label>
                    <Button>Browse Files</Button>
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={handleFileInput}
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Supports PDFs, images, Excel, and CSV files
                </p>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Selected Files</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                      >
                        <div className="flex items-center">
                          <File className="h-5 w-5 mr-2 text-primary" />
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-xs text-muted-foreground">{file.size}</div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button disabled={files.length === 0}>
                      Process Files
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Document AI</CardTitle>
              <CardDescription>
                Our AI will automatically extract and categorize data from your documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium">What we extract:</div>
                <ul className="text-sm space-y-1">
                  <li>• Invoice amounts and dates</li>
                  <li>• Vendor information</li>
                  <li>• Payment details</li>
                  <li>• Tax information</li>
                  <li>• Line items and categories</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Supported formats:</div>
                <ul className="text-sm space-y-1">
                  <li>• PDF documents</li>
                  <li>• Images (JPG, PNG)</li>
                  <li>• Excel spreadsheets</li>
                  <li>• CSV files</li>
                  <li>• Bank statements</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;
