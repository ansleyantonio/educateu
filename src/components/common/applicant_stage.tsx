import { Card } from "@/components/ui/card";
import { EndIcon, MiddleIcon, StartIcon } from "@/components/Icons/StageIcons";

const ApplicantStage = ({ stage }: { stage: string }) => {
  return (
    <Card className="p-4 mt-8">
      <h3>Stages</h3>
      <hr />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 text-[16px] gap-5 mt-5">
        <StartIcon label="New" status={stage} />
        <MiddleIcon label="Assign" status={stage} />
        <MiddleIcon label="Check" status={stage} />
        <MiddleIcon label="Submit" status={stage} />
        <EndIcon label="Outcome" status={stage} />
      </div>
    </Card>
  );
};

export default ApplicantStage;
