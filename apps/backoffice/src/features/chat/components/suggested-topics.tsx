const DEFAULT_TOPICS = [
  'Research',
  'Brainstorm',
  'Summarize',
  'Check Facts',
];

export function SuggestedTopics({
  topics = DEFAULT_TOPICS,
  onSelect,
}: {
  topics?: string[];
  onSelect: (topic: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {topics.map((topic, i) => (
        <button
          key={`${topic}-${i}`}
          type="button"
          onClick={() => onSelect(topic)}
          className="rounded-full px-4 py-1.5 text-sm font-medium bg-surface text-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          {topic}
        </button>
      ))}
    </div>
  );
}
