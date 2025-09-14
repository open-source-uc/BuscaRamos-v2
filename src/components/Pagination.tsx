"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-4 mt-4 p-4 w-full">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-2 w-28 justify-center flex-shrink-0"
      >
        ← Anterior
      </Button>
      
      <div className="w-32 flex-shrink-0">
        <span className="text-sm text-muted-foreground font-mono text-center block">
          Página {currentPage} de {totalPages}
        </span>
      </div>
      
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-2 w-28 justify-center flex-shrink-0"
      >
        Siguiente →
      </Button>
    </div>
  );
}
