import { Store, useStore } from '@tanstack/react-store';
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

const renameDialogStore = new Store({ title: '' });

let prevOpen = false;

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
  const title = useStore(renameDialogStore, (s) => s.title);

  if (open && !prevOpen) {
    renameDialogStore.setState(() => ({ title: initialTitle }));
  }
  prevOpen = open;

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
            onChange={(e) => renameDialogStore.setState(() => ({ title: e.target.value }))}
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
