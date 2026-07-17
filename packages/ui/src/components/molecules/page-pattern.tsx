export interface PagePatternProps {
  name: string;
  label?: string;
  id: string;
  placeholder: string;
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

function PagePattern({ id, name, placeholder, label, value, onValueChange, className }: PagePatternProps) {
  return (
    <div data-slot="page-pattern" className={className}>
      <label htmlFor={id} className="mt-4 mb-1.5 block text-xs font-medium">
        {label ?? 'include only pages matching'}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
      />
    </div>
  );
}

export { PagePattern };
