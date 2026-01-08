import React, { useMemo } from 'react';

// Types for your data
interface ChartItem {
    name: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: ChartItem[];
    size?: number;
    strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
    data,
    size = 192,
    strokeWidth = 24,
}) => {
    const visibleSegments = useMemo(() => data.filter((item) => item.value > 0), [data]);

    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const capAngleInRadians = (strokeWidth / 2) / radius;
    const capAngleInDegrees = (capAngleInRadians * 180) / Math.PI;

    const visualGapAngle = 6;
    const totalGapAngle = visualGapAngle + (capAngleInDegrees * 2);

    const polarToCartesian = (angleInDegrees: number, radiusVal: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: center + radiusVal * Math.cos(angleInRadians),
            y: center + radiusVal * Math.sin(angleInRadians),
        };
    };

    let currentAngle = 0;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible transform -rotate-90"
            >
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth={strokeWidth}
                />

                {visibleSegments.map((item, index) => {
                    const segmentPercentage = item.value;
                    const segmentAngle = (segmentPercentage / 100) * 360;

                    const drawAngle = Math.max(0, segmentAngle - totalGapAngle);

                    const arcLength = (drawAngle / 360) * circumference;
                    const gapLength = circumference - arcLength;

                    const startOffsetAngle = currentAngle + (totalGapAngle / 2);

                    const dashOffset = -((startOffsetAngle / 360) * circumference);

                    const midAngle = currentAngle + segmentAngle / 2;
                    currentAngle += segmentAngle;

                    return (
                        <circle
                            key={`seg-${item.name}-${index}`}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={`${arcLength} ${gapLength}`}
                            strokeDashoffset={dashOffset}
                        />
                    );
                })}
            </svg>

            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="absolute inset-0 overflow-visible pointer-events-none"
            >
                {(() => {
                    let labelAngleTracker = 0;

                    return visibleSegments.map((item, index) => {
                        const segmentAngle = (item.value / 100) * 360;
                        const midAngle = labelAngleTracker + segmentAngle / 2;
                        labelAngleTracker += segmentAngle;

                        const lineStart = polarToCartesian(midAngle, radius + strokeWidth / 2 + 4);
                        const lineEnd = polarToCartesian(midAngle, radius + strokeWidth + 20);
                        const textPos = polarToCartesian(midAngle, radius + strokeWidth + 35);

                        const isRightSide = midAngle >= 0 && midAngle < 180;

                        return (
                            <g key={`label-${item.name}-${index}`}>
                                <line
                                    x1={lineStart.x}
                                    y1={lineStart.y}
                                    x2={lineEnd.x}
                                    y2={lineEnd.y}
                                    stroke={item.color}
                                    strokeWidth={2}
                                    strokeDasharray="3 3"
                                />

                                <text
                                    x={textPos.x}
                                    y={textPos.y}
                                    fill="#1F2937"
                                    fontSize="12"
                                    fontWeight="600"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                >
                                    {item.value}%
                                </text>
                            </g>
                        );
                    });
                })()}
            </svg>

        </div>
    );
};