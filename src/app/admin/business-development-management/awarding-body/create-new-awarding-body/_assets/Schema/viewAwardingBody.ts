export interface Grade {
  classification: string;
  percentageRange: string;
  ukGpaEquivalent?: number; 
}

export interface AwardingBody {
  id: string;
  name: string;
  abbreviation: string;
  intakePeriods: string[];
  grades: Grade[];
  requiredDocuments: string[];
  status: "ACTIVE" | "INACTIVE";
}