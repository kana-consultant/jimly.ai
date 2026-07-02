import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const titleStore = new Store('');
let lastOpen = false;
let lastInitialTitle = '';

export function RenameChatDialog({
  open,
  initialTitle,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  initialTitle: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (title: string) => void;
}) {
  const title = useStore(titleStore, (s) => s);

  if (open && (!lastOpen || initialTitle !== lastInitialTitle)) {
    titleStore.setState(() => initialTitle);
  }
  lastOpen = open;
  lastInitialTitle = initialTitle;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={title}
            onChange={(e) => titleStore.setState(() => e.target.value)}
            placeholder="Chat title"
            className="mt-2"
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={!title.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
