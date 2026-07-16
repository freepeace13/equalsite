export interface EnqueueStrategyProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
}

export function EnqueueStrategy({
    value,
    onValueChange
}: EnqueueStrategyProps) {
    return (
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
            <div>
                <label
                    htmlFor="same-domain"
                    className="block text-xs font-medium"
                >
                    stay on this domain
                </label>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    won't follow links to other sites
                </p>
            </div>
            <button
                type="button"
                id="same-domain"
                role="switch"
                aria-checked={value}
                onClick={() =>
                    onValueChange(!value)
                }
                className={`relative h-5 w-9 shrink-0 rounded-full focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-950 ${value ? 'bg-indigo-700' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
                <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-[right,left] duration-150 ease-out ${value ? 'right-0.5' : 'left-0.5'}`}
                />
            </button>
        </div>
    )
}
