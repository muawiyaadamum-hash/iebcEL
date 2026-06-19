import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2 } from "lucide-react";

interface PDFViewerProps {
  content: string;
  title: string;
}

const PDFViewer = ({ content, title }: PDFViewerProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Split content into pages (using --- as page delimiter or by sections)
  const pages = content.split(/---+/).filter(page => page.trim());
  const totalPages = pages.length || 1;

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 20, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 20, 60));
  };

  const currentContent = pages[currentPage - 1] || content;

  // Parse markdown-like content to HTML
  const parseContent = (text: string) => {
    return text
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-3 text-primary">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-4 text-foreground">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-foreground">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1 list-disc">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 mb-1 list-decimal">$1. $2</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate max-w-[200px]">{title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 60}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[4rem] text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          {/* Page navigation */}
          <Button variant="ghost" size="icon" onClick={goToPreviousPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[5rem] text-center">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-muted/20">
        <div 
          className="mx-auto bg-white dark:bg-card shadow-lg rounded-lg p-8 max-w-4xl transition-transform"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            minHeight: '800px'
          }}
        >
          {/* Page header */}
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
          </div>
          
          {/* Content */}
          <div 
            className="prose dark:prose-invert max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: parseContent(currentContent) }}
          />
          
          {/* Page footer */}
          <div className="border-t pt-4 mt-8 text-center text-sm text-muted-foreground">
            <p>Centre de Formation IEBC - {title}</p>
            <p>Page {currentPage}</p>
          </div>
        </div>
      </div>
      
      {/* Bottom navigation for mobile */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t md:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToPreviousPage} 
          disabled={currentPage === 1}
          className="flex-1 mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm px-2">{currentPage}/{totalPages}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToNextPage} 
          disabled={currentPage === totalPages}
          className="flex-1 ml-2"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PDFViewer;
