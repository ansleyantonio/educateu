import AdmissionOfficersCard from "./_assets/components/admission_offecers_card";

const AssignsPage = ({ params }: { params: { slug: string } }) => {
  return (
    <div>
      <AdmissionOfficersCard id={params.slug} />
    </div>
  );
};

export default AssignsPage;
