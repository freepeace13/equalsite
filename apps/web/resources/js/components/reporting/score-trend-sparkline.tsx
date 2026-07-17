import { Line, LineChart } from 'recharts';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@equalsite/ui';

export type ScoreTrendSparklinePoint = {
    domain: string;
    requestedAt: string;
    score: number;
};

export function ScoreTrendSparkline({
    data,
}: {
    data: ScoreTrendSparklinePoint[];
}) {
    const chartData = data.map((point) => ({
        date: new Date(point.requestedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        }),
        domain: point.domain,
        score: point.score,
    }));

    const chartConfig = {
        score: { label: 'score', color: '#4338CA' },
    } satisfies ChartConfig;

    return (
        <div className="mt-2 h-10 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart
                    data={chartData}
                    margin={{ left: 0, right: 0, top: 2, bottom: 0 }}
                >
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                nameKey="domain"
                                labelKey="date"
                                hideIndicator
                            />
                        }
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-score)"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
        </div>
    );
}
