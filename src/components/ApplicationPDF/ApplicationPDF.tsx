import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface PersonalInformation {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  email?: string;
  countryOfBirth?: string;
  currentNationality?: string;
  sex?: string;
  ethnicity?: string;
  mobileNumber?: string;
  currentAddress?: string;
  currentPostCode?: string;
  permanentAddress?: string;
  nationalIdentityType?: string;
  nationalIdentityNumber?: string;
}

interface AcademicBackground {
  highestLevelOfQualification?: string;
  areaOfQualification?: string;
  gradeOrResult?: string;
  yearCompleted?: string;
  countryOfIssue?: string;
  institutionName?: string;
}

interface CourseSelection {
  faculty?: string;
  course?: string;
  intake?: string;
  yearOfCourse?: string;
}

interface NextOfKin {
  relationship?: string;
  fullName?: string;
  phoneOrMobile?: string;
  address?: string;
}

interface CriminalBackground {
  offenseOrPenalty?: string;
  disqualificationOrSanction?: string;
  policeClearance?: string;
}

interface FundInformation {
  fundInformation?: string;
}

interface DisabilityAndAccessibility {
  disabilityAndAccessibility?: string[];
  disabilityAndAccessibilityOther?: string;
}

interface Application {
  id: string;
  createdAt: string;
  status?: string;
  stage?: string;
  interviewOutcome?: string;
  outcome?: string;
  personalInformation?: PersonalInformation;
  academicBackground?: AcademicBackground;
  courseSelection?: CourseSelection;
  personalStatement?: { statement?: string };
  disabilityAndAccessibility?: DisabilityAndAccessibility;
  nextOfKin?: NextOfKin;
  fund?: { source?: string };
  fundInformation?: string;
  references?: string;
  criminalBackground?: CriminalBackground;
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12 },
  heading: { fontSize: 14, marginBottom: 5, fontWeight: 500 },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  tableRow: { flexDirection: "row" },
  tableColSmall: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    flex: 0.1, 
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    flex: 1,
  },
  tableCell: { fontSize: 12 },
});

interface Props {
  application: Application;
}

export const ApplicationPDF = ({ application }: Props) => {
  const {
    personalInformation,
    academicBackground,
    courseSelection,
    personalStatement,
    disabilityAndAccessibility,
    nextOfKin,
    fund,
    references,
    criminalBackground,
  } = application;

  const personalLabels: Record<string, string> = {
    firstName: "First Name",
    lastName: "Last Name",
    dateOfBirth: "Date of Birth",
    email: "Email Address",
    countryOfBirth: "Country of Birth",
    currentNationality: "Nationality",
    sex: "Sex",
    ethnicity: "Ethnicity",
    mobileNumber: "Mobile Number",
    currentAddress: "Current Address",
    currentPostCode: "Current Postcode",
    permanentAddress: "Permanent Address",
    nationalIdentityType: "ID Type",
    nationalIdentityNumber: "ID Number",
  };

  const academicLabels: Record<string, string> = {
    highestLevelOfQualification: "Highest Level of Qualification",
    areaOfQualification: "Area of Qualification",
    gradeOrResult: "Grade/Result",
    yearCompleted: "Year Completed",
    countryOfIssue: "Country of Issue",
    institutionName: "Institution Name",
  };

  const courseLabels: Record<string, string> = {
    faculty: "Faculty",
    course: "Course",
    intake: "Intake",
    yearOfCourse: "Year of Course",
  };

  const nextOfKinLabels: Record<string, string> = {
    relationship: "Relationship",
    fullName: "Full Name",
    phoneOrMobile: "Phone or Mobile",
    address: "Address",
  };

  const criminalLabels: Record<string, string> = {
    offenseOrPenalty: "Offense or Penalty",
    disqualificationOrSanction: "Disqualification or Sanction",
    policeClearance: "Police Clearance",
  };

  const fundInformationLabel: Record<string, string> = {
    fundInformation: "Fund",
  };

  const renderTable = (
    labels: Record<string, string>,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    data?: Record<string, any>
  ) => (
    <View style={styles.table}>
      {Object.entries(labels).map(([key, label]) => (
        <View style={styles.tableRow} key={key}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{label}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>
              {key === "dateOfBirth" && data?.[key]
                ? new Date(data[key]).toISOString().split("T")[0]
                : data?.[key] || "N/A"}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>Application Profile Summary</Text>

        <View style={{ height: 10 }} />

        <Text style={styles.heading}>Personal Information</Text>
        {renderTable(personalLabels, personalInformation)}

        <View style={{ height: 10 }} />

        <Text style={styles.heading}>Academic Background</Text>
        {renderTable(academicLabels, academicBackground)}

        <View style={{ height: 10 }} />

        <Text style={styles.heading}>Course Selection</Text>
        {renderTable(courseLabels, courseSelection)}

        <View style={{ height: 10 }} />

        <Text style={styles.heading}>Personal Statement</Text>
        <Text>{personalStatement?.statement || "N/A"}</Text>

        <View style={{ height: 10 }} />

        <Text style={styles.heading}>Disability & Accessibility</Text>
        {disabilityAndAccessibility?.disabilityAndAccessibility?.length ? (
          <View style={styles.table}>
            {disabilityAndAccessibility.disabilityAndAccessibility.map(
              (item: string, index: number) => (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.tableColSmall}>
                    <Text style={styles.tableCell}>{index + 1}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{item}</Text>
                  </View>
                </View>
              )
            )}
          </View>
        ) : (
          <Text>N/A</Text>
        )}

        <View style={{ height: 10 }} />

        <Text style={styles.heading}>Next of Kin</Text>
        {renderTable(nextOfKinLabels, nextOfKin)}

        <View style={{ height: 10 }} />

        <Text style={styles.heading}>Fund Information</Text>
        {/* <Text>{fund?.source || "N/A"}</Text> */}
        {renderTable(fundInformationLabel, { fundInformation: fund?.source })}

        <View style={{ height: 10 }} />

        <Text style={styles.heading}>References</Text>
        <Text>{references || "N/A"}</Text>

        <View style={{ height: 10 }} />

        <Text style={styles.heading}>Criminal Background</Text>
        {renderTable(criminalLabels, criminalBackground)}
      </Page>
    </Document>
  );
};
