import { Link2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SourcesModalProps {
  urls: string[];
}

export function SourcesModal({ urls }: SourcesModalProps) {
  if (urls.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-border/50">
        <Link2 className="w-3 h-3" />
        {urls.length} {urls.length === 1 ? 'source' : 'sources'}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sources</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {urls.length} source{urls.length !== 1 ? 's' : ''} used in this answer
          </p>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-1 max-h-80 overflow-y-auto">
          {urls.map((url) => {
            const domain = new URL(url).hostname;
            return (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors border border-border/50"
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                  alt=""
                  className="w-4 h-4 mt-0.5 rounded-sm shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{domain}</span>
                  <span className="text-xs text-muted-foreground truncate">{url}</span>
                </div>
              </a>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
