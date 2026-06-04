type IconProps = {
  label: string;
  status: string;
};

export const StartIcon = ({ label, status }: IconProps) => {
  const isActive = status === label.toUpperCase();

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 274 52"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-2 0L258.912 0L275 26L259.611 52H-2V0Z"
          fill={isActive ? "#011C28" : "#F2F4F7"}
        />
      </svg>

      <div className="flex absolute inset-0 justify-center items-center">
        <span
          className={`font-semibold text-[16px] ${
            isActive ? "text-white" : "text-black"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export const MiddleIcon = ({ label, status }: IconProps) => {
  const isActive = status === label.toUpperCase();

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 274 52"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.719585 1.21275C0.401661 0.677666 0.78728 0 1.40969 0L256.361 0C257.481 0 258.52 0.583934 259.103 1.54078L273.004 24.3664C273.617 25.3729 273.629 26.6344 273.036 27.6527L259.782 50.4053C259.207 51.3927 258.15 52 257.008 52H1.44687C0.816481 52 0.432088 51.3067 0.76605 50.772L14.7968 28.3093C15.4333 27.2902 15.4476 26.0011 14.8339 24.9681L0.719585 1.21275Z"
          fill={isActive ? "#011C28" : "#F2F4F7"}
        />
      </svg>

      <div className="flex absolute inset-0 justify-center items-center">
        <span
          className={`font-semibold text-[16px] ${
            isActive ? "text-white" : "text-black"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export const EndIcon = ({ label, status }: IconProps) => {
  const isActive = status === label.toUpperCase();

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 274 52"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.93063 1.21606C0.60926 0.681028 0.994634 0 1.61876 0L245.934 0C255.417 0 264.221 4.91858 269.193 12.9937L269.377 13.294C274.19 21.1107 274.287 30.9475 269.629 38.8572C264.833 47.0008 256.087 52 246.636 52H1.65647C1.02431 52 0.640201 51.3032 0.977725 50.7687L15.1518 28.3223C15.7993 27.2969 15.8138 25.9942 15.1894 24.9546L0.93063 1.21606Z"
          fill={isActive ? "#011C28" : "#F2F4F7"}
        />
      </svg>

      <div className="flex absolute inset-0 justify-center items-center">
        <span
          className={`font-semibold text-[16px] ${
            isActive ? "text-white" : "text-black"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
