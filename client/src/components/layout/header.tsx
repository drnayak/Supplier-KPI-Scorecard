import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description: string;
  onExport?: () => void;
  onNewEvaluation?: () => void;
}

export default function Header({ title, description, onExport, onNewEvaluation }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-title">{title}</h2>
          <p className="text-muted-foreground" data-testid="text-description">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {onExport && (
            <Button 
              variant="secondary" 
              onClick={onExport}
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          )}
          {onNewEvaluation && (
            <Button onClick={onNewEvaluation} data-testid="button-new-evaluation">
              <Plus className="w-4 h-4 mr-2" />
              New Evaluation
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
