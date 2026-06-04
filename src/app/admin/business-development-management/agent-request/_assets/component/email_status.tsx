import { CircleCheck } from "lucide-react";

export default function EmailStatus({
  emailVerified,
}: {
  emailVerified: boolean;
}) {
  return (
    <div className="flex gap-3 items-center">
      <p
        className={`text-sm !font-bold ${emailVerified === true ? "text-green-600" : "text-gray-600"} `}
      >
        {emailVerified === true ? "Verified" : "Pending"}
      </p>
      {emailVerified === true ? (
        <CircleCheck strokeWidth={3} className="text-green-600" size={20} />
      ) : null}
    </div>
  );
}
