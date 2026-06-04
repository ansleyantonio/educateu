import AdditionalFileChecks from "./_assets/components/additional_file_checks";
import GeneralFileChecks from "./_assets/components/general_file_checks";

const ChecksPage = ({ params }: { params: { slug: string } }) => {
  return (
    <div>
      <div>
        <GeneralFileChecks id={params.slug} />
        <br />
        <AdditionalFileChecks id={params.slug} />
      </div>
    </div>
  );
};
export default ChecksPage;
