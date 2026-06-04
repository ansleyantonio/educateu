/* eslint-disable @typescript-eslint/no-explicit-any */
import { InfoItem } from "./info-item";
import profile from "/public/assets/icons/prescrenning/profile.svg";
import grad_cap from "/public/assets/icons/prescrenning/grad_cap.svg";
import cell from "/public/assets/icons/prescrenning/cell.svg";
import email from "/public/assets/icons/prescrenning/email.svg";

export function ApplicantInfo({ applicant }: any) {
  const { personalInformation, courseSelection } = applicant;

  return (
    <div className="space-y-4 min-w-[200px]">
      <InfoItem
        icon={profile}
        text={`${personalInformation?.firstName} ${personalInformation?.lastName}`}
      />
      <InfoItem icon={grad_cap} text={courseSelection?.course?.course?.title} />
      <InfoItem icon={cell} text={personalInformation?.mobileNumber} />
      <InfoItem
        isTruncate={true}
        icon={email}
        text={personalInformation?.email}
      />
    </div>
  );
}
