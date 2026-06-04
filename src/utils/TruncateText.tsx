interface TruncateTextProps {
  text: string;
  lines?: number;
  weight?: string;
}

export function TruncateText({ weight, text, lines = 1 }: TruncateTextProps) {
  return (
    <p
      title={text}
      className={` text-sm sm:text-base w-${weight} md:text-lg lg:text-base truncate break-words overflow-hidden line-clamp-${lines}`}
    >
      {text}
    </p>
  );
}
