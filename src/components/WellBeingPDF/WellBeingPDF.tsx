/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import axios from "axios";
import { useEffect, useState } from "react";
import { Buffer } from "buffer";

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
  nationalIdentityNumber?: string;
}

interface CourseSelection {
  awardingBodyId?: string;
  courseId?: string;
  sessionId?: string;
  yearOfCourse?: string;
}

interface DisabilityAndAccessibility {
  disabilityAndAccessibility?: string[];
}

interface FundInformation {
  source?: string;
}

interface CriminalBackground {
  offenseOrPenalty?: string;
  disqualificationOrSanction?: string;
  policeClearance?: string;
}

interface AttachmentFile {
  paths?: string[];
}

interface SupportingDocumentAttachment {
  id?: string;
  name?: string;
  status?: string;
  attachment?: AttachmentFile;
}

interface SupportingDocument {
  supportingDocumentAttachments?: SupportingDocumentAttachment[];
}

interface AgentUser {
  firstName?: string;
  lastName?: string;
  mobile?: string;
  agentEmail?: string;
  address?: string;
}

interface AgentRoleData {
  companyName?: string;
  userStatus?: string;
  agentType?: string;
  agreementStatus?: boolean;
}

interface AgentRole {
  name?: string;
}

interface UserPortalCategoryRole {
  role?: AgentRole;
  roleData?: AgentRoleData;
  userPortalCategory?: { user?: AgentUser };
}

interface Application {
  data: {
    application: {
      personalInformation?: PersonalInformation;
      courseSelection?: CourseSelection;
      disabilityAndAccessibility?: DisabilityAndAccessibility;
      fund?: FundInformation;
      criminalBackground?: CriminalBackground;
      supportingDocument?: SupportingDocument;
      userPortalCategoryRoleApplications?: { userPortalCategoryRole?: UserPortalCategoryRole }[];
    }
  }
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12 },
  heading: { fontSize: 14, marginBottom: 5, fontWeight: 500 },
  table: { width: "auto", borderWidth: 1, borderColor: "#ccc", marginBottom: 10 },
  tableRow: { flexDirection: "row" },
  tableColSmall: { borderWidth: 1, borderColor: "#ccc", padding: 5, flex: 0.1 },
  tableCol: { borderWidth: 1, borderColor: "#ccc", padding: 5, flex: 1 },
  tableCell: { fontSize: 12 },
  image: { width: 400, height: 300, objectFit: "contain", marginTop: 10 },
});

interface Props {
  application: Application;
  token?: string;
}

export const WellBeingPDF = ({ application, token }: Props) => {
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  const fetchImage = async (docId: string, filePath: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${filePath}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "arraybuffer",
        }
      );
      const contentType = response.headers["content-type"] || "image/jpeg";
      const base64 = `data:${contentType};base64,${Buffer.from(response.data).toString("base64")}`;
      setImageMap(prev => ({ ...prev, [docId]: base64 }));
    } catch (err) {
      console.error("Error fetching image:", err);
      setImageMap(prev => ({ ...prev, [docId]: "" }));
    }
  };

  const renderTable = (labels: Record<string, string>, data?: Record<string, any>) => (
    <View style={styles.table}>
      {Object.entries(labels).map(([key, label]) => (
        <View style={styles.tableRow} key={key}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{label}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>
              {key === "dateOfBirth" && data?.[key] ? new Date(data[key]).toISOString().split("T")[0] : data?.[key] || "N/A"}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const {
    personalInformation,
    courseSelection,
    disabilityAndAccessibility,
    fund,
    criminalBackground,
    supportingDocument,
    userPortalCategoryRoleApplications,
  } = application?.data?.application;

  const agentRoleApplication = userPortalCategoryRoleApplications?.[0]?.userPortalCategoryRole;
  const agentUser = agentRoleApplication?.userPortalCategory?.user;
  const roleData = agentRoleApplication?.roleData;

  useEffect(() => {
    const docs = supportingDocument?.supportingDocumentAttachments || [];
    docs.forEach(doc => {
      if (!doc.attachment?.paths?.[0]) return;
      const pathObj = JSON.parse(doc.attachment.paths[0]);
      if (pathObj.mimetype?.startsWith("image/") && pathObj.path) {
        fetchImage(doc.id!, pathObj.path);
      }
    });
  }, [supportingDocument, token]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>Application Summary</Text>

        <Text style={styles.heading}>Personal Information</Text>
        {renderTable({
          firstName: "First Name",
          lastName: "Last Name",
          dateOfBirth: "Date of Birth",
          email: "Email",
          countryOfBirth: "Country of Birth",
          currentNationality: "Nationality",
          sex: "Sex",
          ethnicity: "Ethnicity",
          mobileNumber: "Mobile Number",
          currentAddress: "Current Address",
          currentPostCode: "Current Postcode",
          permanentAddress: "Permanent Address",
          nationalIdentityNumber: "National ID Number",
        }, personalInformation)}

        <Text style={styles.heading}>Course Selection</Text>
        {renderTable({
          awardingBodyId: "Awarding Body ID",
          courseId: "Course ID",
          sessionId: "Session ID",
          yearOfCourse: "Year of Course",
        }, courseSelection)}

        <Text style={styles.heading}>Disability & Accessibility</Text>
        {disabilityAndAccessibility?.disabilityAndAccessibility?.length ? (
          <View style={styles.table}>
            {disabilityAndAccessibility.disabilityAndAccessibility.map((item, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={styles.tableColSmall}><Text style={styles.tableCell}>{i + 1}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{item}</Text></View>
              </View>
            ))}
          </View>
        ) : <Text>N/A</Text>}

        <Text style={styles.heading}>Fund Information</Text>
        {renderTable({ source: "Funding Source" }, fund)}

        <Text style={styles.heading}>Criminal Background</Text>
        {renderTable({
          offenseOrPenalty: "Offense or Penalty",
          disqualificationOrSanction: "Disqualification or Sanction",
          policeClearance: "Police Clearance",
        }, criminalBackground)}

        <Text style={styles.heading}>Agent Information</Text>
        {renderTable({
          fullName: "Full Name",
          email: "Email",
          mobile: "Mobile",
          address: "Address",
          companyName: "Company Name",
          userStatus: "Status",
          agentType: "Agent Type",
          agreementStatus: "Agreement Status",
        }, {
          fullName: `${agentUser?.firstName || ""} ${agentUser?.lastName || ""}`,
          email: agentUser?.agentEmail || "N/A",
          mobile: agentUser?.mobile || "N/A",
          address: agentUser?.address || "N/A",
          companyName: roleData?.companyName || "N/A",
          userStatus: roleData?.userStatus || "N/A",
          agentType: roleData?.agentType || "N/A",
          agreementStatus: roleData?.agreementStatus ? "Yes" : "No",
        })}
      </Page>
    </Document>
  );
};