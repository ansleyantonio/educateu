import { Card } from "@/components/ui/card";
import NewIcon from "/public/assets/shapes/new.svg";
import AssignIcon from "/public/assets/shapes/assign.svg";
import CheckIcon from "/public/assets/shapes/check.svg";
import SubmitIcon from "/public/assets/shapes/submit.svg";
import OutcomeIcon from "/public/assets/shapes/outcome.svg";

const stages = [
  { icon: NewIcon.src, label: "New", color: "#000000" },
  { icon: AssignIcon.src, label: "Assign", color: "#5E0500" },
  { icon: CheckIcon.src, label: "Check", color: "#610400" },
  { icon: SubmitIcon.src, label: "Submit", color: "#1F1264" },
  { icon: OutcomeIcon.src, label: "Outcome", color: "#4C2277" },
];

const ApplicantStage = () => {
  return (
    <Card className="p-4 mt-8">
      <h3>Stages</h3>
      <hr />
      <div className="grid grid-cols-2 mt-5 lg:grid-cols-4 xl:grid-cols-5 text-[16px]">
        {stages.map(({ icon, label, color }) => (
          <div
            key={label}
            className="flex justify-center items-center py-2"
            style={{
              backgroundImage: `url(${icon})`,
              backgroundSize: "100% 57px", // Default background size for small screens
              backgroundPosition: "left center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <h2 style={{ color: color }} className="font-semibold text-[15px]">
              {label}
            </h2>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ApplicantStage;
