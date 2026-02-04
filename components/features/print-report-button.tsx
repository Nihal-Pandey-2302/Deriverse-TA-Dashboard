'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function PrintReportButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handlePrint} 
      className="h-9 gap-2 print:hidden"
    >
      <Printer className="h-4 w-4" />
      Print Report
    </Button>
  );
}
