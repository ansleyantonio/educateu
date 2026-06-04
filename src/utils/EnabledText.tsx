import React, { useState } from "react";

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  seeMoreClassName?: string;
  seeLessClassName?: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text = "",
  maxLength = 150,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (!text) return null;

  return (
    <div className="flex overflow-hidden gap-3 justify-between items-start my-3 whitespace-pre-wrap break-all">
      {isExpanded || text.length <= maxLength ? (
        <p>
          {text}
          {text.length > maxLength && (
            <span
              className={`text-blue-600 cursor-pointer`}
              onClick={handleToggle}
            >
              {" "}
              See Less
            </span>
          )}
        </p>
      ) : (
        <p>
          {text.slice(0, maxLength)}...
          <span
            className={`text-blue-600 cursor-pointer`}
            onClick={handleToggle}
          >
            See More
          </span>
        </p>
      )}
    </div>
  );
};

export default ExpandableText;
