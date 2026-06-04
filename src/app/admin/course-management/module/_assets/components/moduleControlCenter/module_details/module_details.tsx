/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import ViewProfessionalModuleForm from "../../../../professional-certificate-modules/_assets/components/view-update/viewProfessionalCertificateModuleForm";
import ViewCPDModuleForm from "../../../../cpd-modules/_assets/components/view-update/viewCPDModuleForm";
import ViewAdvanceModuleFrom from "../../advanceModuleComponent/view_update/ViewAdvanceModuleForm";

interface Props {
  moduleData: any;
}

const ModuleDetailsTab = ({ moduleData }: Props) => {
  const [isEdit, setIsEdit] = useState(true);

  return (
    <>
      {/* Advance Module */}
      {["DEGREE", "DIPLOMA"].includes(moduleData?.moduleType) && (
        <ViewAdvanceModuleFrom
          queryKeys="fetch_single_module_details"
          module={moduleData}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
        />
      )}

      {/* CPD Module */}
      {moduleData?.moduleType === "CPD" && (
        <ViewCPDModuleForm
          queryKeys="fetch_single_module_details"
          module={moduleData}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
        />
      )}

      {/* Professional Certificate Module */}
      {moduleData?.moduleType === "PROFESSIONAL_CERTIFICATE" && (
        <ViewProfessionalModuleForm
          queryKeys="fetch_single_module_details"
          module={moduleData}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
        />
      )}
    </>
  );
};

export default ModuleDetailsTab;
