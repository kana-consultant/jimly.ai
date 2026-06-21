import { Button } from '@/components/ui/button';

const TOPICS = [
  'Explain a concept simply',
  'Help me write some code',
  'Brainstorm ideas',
  'Summarize a long text',
];

export function SuggestedTopics({ onSelect }: { onSelect: (topic: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {TOPICS.map((topic) => (
        <Button key={topic} variant="outline" onClick={() => onSelect(topic)}>
          {topic}
        </Button>
      ))}
    </div>
  );
}
