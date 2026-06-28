import { Store, useStore } from '@tanstack/react-store';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';

const passwordVisibleStore = new Store({ visible: false });

export function PasswordInput(props: Omit<React.ComponentProps<typeof Input>, 'type'>) {
  const visible = useStore(passwordVisibleStore, (s) => s.visible);

  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className="pr-9" {...props} />
      <button
        type="button"
        onClick={() => passwordVisibleStore.setState((s) => ({ ...s, visible: !s.visible }))}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
