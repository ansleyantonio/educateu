interface ModuleProps {
  title: string;
  type: string;
  total: number;
  assigned: number;
  unitName?: string;
}

const AssignedProgressStatus = ({
  title,
  type,
  total,
  assigned,
  unitName,
}: ModuleProps) => {
  const t = total ?? 0;
  const a = assigned ?? 0;

  const isHour = ["DEGREE_COURSE", "DIPLOMA_COURSE"].includes(type);
  const unit = isHour ? "hr" : "min";

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold">
        {title} (
        <span className={`${a == t ? "text-green-500" : "text-orange-400"}`}>
          {a}
        </span>
        <span className={`${a == t ? "text-green-500" : "text-blue-500"}`}>
          {" "}
          /{" "}
        </span>
        <span className={`${a == t ? "text-green-500" : "text-blue-500"}`}>
          {t}
        </span>
        <span className="ml-1 text-gray-700 capitalize">
          {unitName ?? unit} )
        </span>
      </h2>
    </div>
  );
};

export default AssignedProgressStatus;
