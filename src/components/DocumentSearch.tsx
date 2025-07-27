
import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Document } from '@/hooks/useDocuments';
import { MobileFormRow } from '@/components/ui/mobile-form';

interface DocumentSearchProps {
  documents: Document[];
  onSearchResults: (results: Document[]) => void;
}

const DocumentSearch = ({ documents, onSearchResults }: DocumentSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const categories = ['all', 'invoice', 'receipt', 'tax-document', 'bank-statement', 'contract', 'other'];
  
  // Get all unique tags from documents
  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags || [])));

  const performSearch = () => {
    let results = documents;

    // Text search
    if (searchTerm) {
      results = results.filter(doc => 
        doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.extracted_text && doc.extracted_text.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      results = results.filter(doc => doc.category === selectedCategory);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      results = results.filter(doc => 
        selectedTags.every(tag => doc.tags?.includes(tag))
      );
    }

    onSearchResults(results);
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags([]);
    onSearchResults(documents);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Document Search
        </CardTitle>
        <CardDescription>
          Search through your documents by text, category, or tags
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <MobileFormRow>
          <div className="flex-1">
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              className="h-12"
            />
          </div>
          <Button onClick={performSearch} className="h-12 px-6">
            <Search className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Search</span>
          </Button>
        </MobileFormRow>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select onValueChange={addTag} value="">
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Add tag filter" />
              </SelectTrigger>
              <SelectContent>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={clearFilters} className="h-12 px-6">
            <Filter className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Clear</span>
          </Button>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-sm py-1 px-2">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentSearch;
