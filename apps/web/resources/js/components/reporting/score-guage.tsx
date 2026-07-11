import { type ChartConfig, ChartContainer } from "@equalsite/ui";
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

interface ScoreGuageProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    min?: number;
    max?: number;
    size?: "sm" | "md" | "lg";
    ariaLabel?: string;
}

const sizeConfig = {
    sm: {
      width: 150,
      height: 150,
      innerRadius: 35,
      outerRadius: 50,
      fontSize: "text-2xl",
      labelSize: "text-xs",
      offset: 16
    },
    md: {
        width: 250,
        height: 250,
      innerRadius: 65,
      outerRadius: 95,
      fontSize: "text-4xl",
      labelSize: "text-sm",
      offset: 24
    },
    lg: {
        width: 350,
        height: 350,
      innerRadius: 90,
      outerRadius: 130,
      fontSize: "text-6xl",
      labelSize: "text-md",
      offset: 32
    },
  };

export default function ScoreGuage({
    value,
    min = 0,
    max = 100,
    ariaLabel,
    size = "md",
    className,
    ...props
}: ScoreGuageProps) {
    const safeValue = Math.min(Math.max(value, min), max);
    const percentage = ((safeValue - min) / (max - min)) * 100;

    const config = sizeConfig[size];

    const getScoreColor = (val: number) => {
        const normalized = ((val - min) / (max - min)) * 100;
        if (normalized < 33) { return "var(--chart-5)"; }
        if (normalized < 66) { return "var(--chart-3)"; }
        return "var(--chart-2)";
    };

    const barColor = getScoreColor(safeValue);

    const chartData = [
        { name: "score", value: safeValue, fill: barColor },
    ];
    const chartConfig = {
        score: {
          label: "Score",
          color: barColor,
        },
      } satisfies ChartConfig;
    return (
        <div
            role="meter"
            aria-valuenow={safeValue}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={ariaLabel || `Score: ${safeValue} out of ${max}`}
            style={{ width: config.width, height: config.height }}
            className={`mx-auto ${className || ""}`}
            {...props}
        >
            <ChartContainer config={chartConfig} className="h-full w-full">
                <RadialBarChart
                    data={chartData}
                    startAngle={90}
                    endAngle={90 + (360 * (percentage / 100))}
                    innerRadius={config.innerRadius}
                    outerRadius={config.outerRadius}
                    accessibilityLayer
                >
                    <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[config.outerRadius + 2, config.innerRadius - 2]}
                    />
                    <RadialBar
                        dataKey="value"
                        background
                        cornerRadius={10}
                        fill={barColor}
                    />
                    <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className={`fill-foreground font-bold ${config.fontSize}`}
                                            >
                                                {safeValue}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + config.offset}
                                                className={`fill-muted-foreground ${config.labelSize}`}
                                            >
                                                Score
                                            </tspan>
                                        </text>
                                    )
                                }
                            }}
                        />
                    </PolarRadiusAxis>
                </RadialBarChart>
            </ChartContainer>
        </div>
    );
}
