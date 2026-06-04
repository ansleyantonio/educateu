import Image from "next/image";
import info from "/public/assets/logo/application/Info.svg";

type Props = {
  formData: {
    offenseOrPenalty?: string;
    offenseOrPenaltyDetails?: string;
    disqualificationOrSanction?: string;
    disqualificationOrSanctionDetails?: string;
    policeClearance?: string;
  };
};

const Criminal_background_step_9 = ({ formData = {} }: Props) => {
  const {
    offenseOrPenalty,
    offenseOrPenaltyDetails,
    disqualificationOrSanction,
    disqualificationOrSanctionDetails,
    policeClearance,
  } = formData;

  const fallback = "N/A";

  return (
    <div>
      <div className="flex justify-start gap-2 items-center">
        <p className="text-sm text-[#272E35] font-bold leading-6 tracking-[0.02em]">
          It is mandatory to complete this section. If it is not complete the
          application will be invalid and will be declined
        </p>
        <Image src={info} width={15} height={15} alt="Info icon" />
      </div>

      <div className="mt-6">
        <label className="text-sm font-normal leading-6 tracking-[0.02em]">
          Have you ever been convicted by the courts, cautioned, reprimanded, or
          given a final warning by the police?
        </label>
        <p className="text-sm font-normal leading-6 tracking-[0.02em] pb-3">
          Please give details of offenses, penalties, and dates in the table
          below. (Note that the post you have applied for is exempted under the
          Rehabilitation of Offenders Act (Exceptions Order) 1974, which means
          that all convictions, cautions, reprimands, and final warnings on your
          criminal record need to be disclosed.)
        </p>
        <div className="py-2">
          <p className="text-muted-foreground">
            {offenseOrPenalty || fallback}
          </p>
        </div>
      </div>

      <div className="my-6">
        <label className="">Details of Judgement or Civil Penalty</label>
        <p className="text-muted-foreground">
          {offenseOrPenaltyDetails || fallback}
        </p>
      </div>

      <div className="my-6">
        <label className="">
          Have you ever been disqualified from working with children or
          vulnerable adults or subject to any other sanctions imposed by a
          regulatory body?
        </label>
        <p className="text-muted-foreground">
          {disqualificationOrSanction || fallback}
        </p>
      </div>

      <div className="my-6">
        <label className="">
          Detailed info on disqualification or sanctions by a regulatory body
        </label>
        <p className="text-muted-foreground">
          {disqualificationOrSanctionDetails || fallback}
        </p>
      </div>

      <div>
        <label className="">Do you have Police Clearance?</label>
        <p className="text-muted-foreground">{policeClearance || fallback}</p>
      </div>
    </div>
  );
};

export default Criminal_background_step_9;
