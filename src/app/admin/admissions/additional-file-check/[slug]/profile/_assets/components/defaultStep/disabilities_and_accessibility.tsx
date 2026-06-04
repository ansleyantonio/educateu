type Props = {
  formData: {
    disabilityAndAccessibility?: string;
  };
};

const Disability_and_accessibility_step_5 = ({ formData = {} }: Props) => {
  const { disabilityAndAccessibility } = formData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
      <div>
        <label className="cusFormLabel">
          {" "}
          Disabilities and accessibilities Requirements
        </label>
        <p className="text-muted-foreground">
          {disabilityAndAccessibility ? disabilityAndAccessibility : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default Disability_and_accessibility_step_5;
