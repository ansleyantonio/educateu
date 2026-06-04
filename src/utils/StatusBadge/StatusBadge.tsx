interface StatusBadgeProps {
    status: "success" | "pending" | "danger";
    label: string;
  }
  
  const statusStyles = {
    success: {
      bg: "#DCFCE7",
      text: "#166534",
    },
    pending: {
      bg: "#FEF9C3",
      text: "#854D0E",
    },
    danger: {
      bg: "#FEE2E2", // soft red background
      text: "#991B1B", // deep red text
    },
  };
  
  const StatusBadge = ({ status, label }: StatusBadgeProps) => {
    const styles = statusStyles[status];
  
    return (
      <span
        className="px-3 py-1 text-sm rounded-full font-medium w-fit"
        style={{ backgroundColor: styles.bg, color: styles.text }}
      >
        {label}
      </span>
    );
  };
  
  export default StatusBadge;  