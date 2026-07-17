import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@equalsite/ui';

export type ScoreTrendChartPoint = {
    requestedAt: string;
    score: number | null;
};

export function ScoreTrendChart({ data }: { data: ScoreTrendChartPoint[] }) {
    const chartData = data.map((row) => ({
        date: new Date(row.requestedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: row.score ?? 0,
    }));

    const chartConfig = {
        score: { label: 'score', color: '#4338CA' },
    } satisfies ChartConfig;

    return (
        <div className="h-40 w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={chartData} margin={{ left: -16, right: 12, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} fontSize={11} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-score)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--color-score)' }}
                    />
                </LineChart>
            </ChartContainer>
        </div>
    );
}
