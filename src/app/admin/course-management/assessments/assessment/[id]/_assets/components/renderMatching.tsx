import { FormElement } from "../schemas/formBuilderSchemas";
import { useLayoutEffect, useRef, useState } from "react";

interface RenderMatchingProps {
  item: FormElement,
  rightSideIndex: number[]
  leftToRightSideIndex: number[]
  colorShades: { light: string, medium: string, dark: string }[]
}
type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export default function RenderMatching({ item, rightSideIndex, leftToRightSideIndex, colorShades }: RenderMatchingProps) {


  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    // console.log(colorShades);

    const observer = new ResizeObserver(() => {
      recalcLines();
    });

    observer.observe(containerRef.current);

    leftRefs.current.forEach((el) => el && observer.observe(el));
    rightRefs.current.forEach((el) => el && observer.observe(el));

    recalcLines(); // initial

    return () => observer.disconnect();
  }, [item]);
  if (item.type !== "MATCHING") return null;

  const recalcLines = () => {
    // if (!containerRef.current) return;
    // const container = containerRef.current.getBoundingClientRect();

    const newLines = item.answer.map((_, i) => {
      const left = leftRefs.current[i];
      const right = rightRefs.current[leftToRightSideIndex[i]];
      if (!left || !right) return null;
      const container = left.parentElement!.parentElement!.parentElement!.getBoundingClientRect();
      // console.log(left, right, container);
      if (!left || !right) return null;

      const L = left.getBoundingClientRect();
      const R = right.getBoundingClientRect();

      return {
        x1: L.right - container.left,
        y1: L.top + L.height / 2 - container.top,
        x2: R.left - container.left,
        y2: R.top + R.height / 2 - container.top
      };
    }).filter(Boolean) as Line[];
    // console.log(newLines);

    setLines(newLines);
  };

  // useEffect(() => {
  //   console.log("color shades", colorShades.length === item.answer.length);
  // }, [item]);


  return (

    <>
      {/* Pairs */}
      <div ref={containerRef} className="flex relative flex-col gap-[12px]">
        {/* SVG Lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {lines.map((line, i) =>
            line ? (
              <line
                key={i}
                {...line}
                stroke={i < colorShades.length ? colorShades[i].dark : "#8C8C8C"}
                strokeWidth={2}
              />
            ) : null
          )}
        </svg>

        {item.answer?.map((pair, i) => (
          <div
            key={i}
            className="flex flex-row items-center justify-between gap-[48px]"
          >
            {/* Left Side */}
            <div
              style={{ borderColor: colorShades[i].medium, backgroundColor: colorShades[i].light, color: colorShades[i].dark }}
              className="w-1/2 flex flex-row items-center justify-between gap-[8px] border border-[#E2E8F0]  rounded-md py-[8px] px-[12px] text-[14px] text-[#8C8C8C]">
              <p className="flex-1 w-[10px]">
                {item.options.leftSide[i]?.text}
              </p>
              <div
                ref={(el) => {

                  leftRefs.current[i] = el
                }}
                className="h-[16px] w-[16px] rounded-[3px]" style={{ backgroundColor: colorShades[i].dark }} />
            </div>

            {/* Right Side */}
            <div
              style={{ borderColor: colorShades[rightSideIndex[i]].medium, backgroundColor: colorShades[rightSideIndex[i]].light, color: colorShades[rightSideIndex[i]].dark }}
              className="w-1/2 flex flex-row items-center gap-[8px] border border-[#E2E8F0] rounded-md py-[8px] px-[12px] text-[14px] text-[#8C8C8C]">
              <div
                ref={(el) => {
                  rightRefs.current[i] = el
                }}
                className="h-[16px] w-[16px] rounded-[3px]" style={{ backgroundColor: colorShades[rightSideIndex[i]].dark }} />
              <p className="flex-1 w-[10px] break-words">
                {item.options.rightSide[i]?.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );


}
