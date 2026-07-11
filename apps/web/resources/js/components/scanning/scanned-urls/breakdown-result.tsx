import { Badge } from '@equalsite/ui';
import type { ServerityBreakdown } from "@equalsite/types";
import { sortSeverityBreakdown } from "./utils";
import { str } from "@/lib/utils";

type BreakdownResultProps = {
    result?: ServerityBreakdown
}

export function BreakdownResult({ result }: BreakdownResultProps) {
    return result
        ? sortSeverityBreakdown(result)
            .filter(k => result[k] > 0)
            .map(k => ((result[k] > 0) ? (
                <Badge key={k} className={({
                    'critical': 'bg-chart-5/20 text-chart-5',
                    'serious':  'bg-chart-3/20 text-chart-3',
                    'moderate': 'bg-chart-1/20 text-chart-1',
                    'minor': 'bg-chart-2/20 text-chart-2',
                })[k]}>
                    <span className="font-medium w-2">{result[k]}</span>
                    {str.title(k)}
                </Badge>
            ) : null))
        : null;
}
