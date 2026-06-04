/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateColorShades } from "@/utils/GenerateColorShades";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

interface PreviewMatchingProps {
    question: any;
    readonly?: boolean;
}

const PreviewMatching: React.FC<PreviewMatchingProps> = ({ question, readonly = false }) => {
    const [matches, setMatches] = useState<{ [key: string]: string }>({});
    const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
    const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string }[]>([]);

    useEffect(() => {
        if (readonly && question.answer && Array.isArray(question.answer)) {
            const answerMatches: { [key: string]: string } = {};
            question.answer.forEach((match: any) => {
                if (match.leftSideId && match.rightSideId) {
                    answerMatches[match.leftSideId] = match.rightSideId;
                }
            });
            setMatches(answerMatches);
        }
    }, [readonly, question.answer]);

    // Generate color shades based on the number of left side items
    const colorShades = useMemo(() => {
        const count = question.options?.leftSide?.length || 0;
        return generateColorShades(count);
    }, [question.options?.leftSide?.length]);

    const containerRef = useRef<HTMLDivElement>(null);
    const leftRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const rightRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const leftHandleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const rightHandleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const handleLeftClick = (leftId: string) => {
        if (readonly) return;
        setSelectedLeftId(leftId);
    };

    const handleRightClick = (rightId: string) => {
        if (readonly) return;
        if (selectedLeftId) {
            setMatches((prev) => ({ ...prev, [selectedLeftId]: rightId }));
            setSelectedLeftId(null);
        }
    };

    const updateLines = useCallback(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newLines: typeof lines = [];

        Object.entries(matches).forEach(([leftId, rightId]) => {
            const leftHandleEl = leftHandleRefs.current[leftId];
            const rightHandleEl = rightHandleRefs.current[rightId];

            if (leftHandleEl && rightHandleEl) {
                const leftHandleRect = leftHandleEl.getBoundingClientRect();
                const rightHandleRect = rightHandleEl.getBoundingClientRect();

                // Find the match index to get the correct color shade
                const matchIndex = Object.keys(matches).indexOf(leftId);
                const color = matchIndex < colorShades.length ? colorShades[matchIndex].dark : "#8C8C8C";

                // Use edges for x (right edge of left handle, left edge of right handle)
                // Use center for y (vertically centered) - exactly like renderMatching.tsx
                newLines.push({
                    x1: leftHandleRect.right - containerRect.left, // Right edge of left handle
                    y1: leftHandleRect.top + leftHandleRect.height / 2 - containerRect.top, // Center of left handle
                    x2: rightHandleRect.left - containerRect.left, // Left edge of right handle
                    y2: rightHandleRect.top + rightHandleRect.height / 2 - containerRect.top, // Center of right handle
                    color: color,
                });
            }
        });

        setLines(newLines);
    }, [matches, colorShades]);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(() => {
            updateLines();
        });

        observer.observe(containerRef.current);

        // Observe all handle elements
        Object.values(leftHandleRefs.current).forEach((el) => el && observer.observe(el));
        Object.values(rightHandleRefs.current).forEach((el) => el && observer.observe(el));

        updateLines(); // Initial calculation

        return () => observer.disconnect();
    }, [matches, colorShades, updateLines]);

    // Also update on window resize
    useEffect(() => {
        window.addEventListener("resize", updateLines);
        return () => window.removeEventListener("resize", updateLines);
    }, [updateLines]);


    return (
        <div className="space-y-4 relative">
            <p className="text-sm text-[#64748B] mb-4">Match the items on the left with the items on the right:</p>

            <div className="grid grid-cols-2 gap-12 relative z-10" ref={containerRef}>
                {/* SVG Overlay - positioned above boxes */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
                    {lines.map((line, i) => (
                        <line
                            key={i}
                            x1={line.x1}
                            y1={line.y1}
                            x2={line.x2}
                            y2={line.y2}
                            stroke={line.color}
                            strokeWidth="2"
                        />
                    ))}
                </svg>

                {/* Left Side */}
                <div className="space-y-4">
                    {question.options?.leftSide?.map((item: any) => {
                        const isSelected = selectedLeftId === item.id;
                        const isMatched = !!matches[item.id];

                        // Determine color styles: if matched, use match index color. If selected, use default blue.
                        let borderColor = "#E2E8F0";
                        let backgroundColor = "#FFFFFF";
                        let handleColor = "#CBD5E1";
                        let textColor = "#0F172A";

                        if (isMatched) {
                            // Find index of this match to assign consistent color
                            const matchIndex = Object.keys(matches).indexOf(item.id);
                            if (matchIndex < colorShades.length) {
                                borderColor = colorShades[matchIndex].medium;
                                backgroundColor = colorShades[matchIndex].light;
                                handleColor = colorShades[matchIndex].dark;
                                textColor = colorShades[matchIndex].dark;
                            }
                        } else if (isSelected) {
                            borderColor = "#013E5B";
                            backgroundColor = "#EFF6FF";
                            handleColor = "#013E5B";
                            textColor = "#0F172A";
                        }

                        return (
                            <div
                                key={item.id}
                                ref={(el) => { leftRefs.current[item.id] = el; }}
                                onClick={() => handleLeftClick(item.id)}
                                style={{
                                    borderColor,
                                    backgroundColor,
                                    color: textColor,
                                }}
                                className={`p-4 border rounded-lg transition-all duration-200 relative flex items-center justify-between ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <span className="text-sm font-medium">{item.text}</span>
                                <div
                                    ref={(el) => { leftHandleRefs.current[item.id] = el; }}
                                    className="w-4 h-4 rounded-sm"
                                    style={{ backgroundColor: handleColor }}
                                ></div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Side */}
                <div className="space-y-4">
                    {question.options?.rightSide?.map((item: any) => {
                        const matchedLeftId = Object.keys(matches).find(key => matches[key] === item.id);
                        const isMatched = !!matchedLeftId;

                        let borderColor = "#E2E8F0";
                        let backgroundColor = "#FFFFFF";
                        let handleColor = "#CBD5E1";
                        let textColor = "#0F172A";

                        if (isMatched && matchedLeftId) {
                            const matchIndex = Object.keys(matches).indexOf(matchedLeftId);
                            if (matchIndex < colorShades.length) {
                                borderColor = colorShades[matchIndex].medium;
                                backgroundColor = colorShades[matchIndex].light;
                                handleColor = colorShades[matchIndex].dark;
                                textColor = colorShades[matchIndex].dark;
                            }
                        } else if (selectedLeftId) {
                            // Highlight as potential target
                            backgroundColor = "#F8FAFC";
                            handleColor = "#94A3B8";
                        }

                        return (
                            <div
                                key={item.id}
                                ref={(el) => { rightRefs.current[item.id] = el; }}
                                onClick={() => handleRightClick(item.id)}
                                style={{
                                    borderColor,
                                    backgroundColor,
                                    color: textColor,
                                }}
                                className={`p-4 border rounded-lg transition-all duration-200 relative flex items-center justify-between flex-row-reverse ${readonly ? 'cursor-default' : (selectedLeftId ? 'cursor-pointer hover:bg-[#F8FAFC]' : 'cursor-default')}`}
                            >
                                <span className="text-sm font-medium">{item.text}</span>
                                <div
                                    ref={(el) => { rightHandleRefs.current[item.id] = el; }}
                                    className="w-4 h-4 rounded-sm"
                                    style={{ backgroundColor: handleColor }}
                                ></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PreviewMatching;
