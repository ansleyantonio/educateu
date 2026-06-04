export interface Interview {
  id: string;
  title: string;
  interviewDate: string;
  startTime: string;
  endTime: string;
  platform: string;
  guests: string[];
  interviewerId: string;
  color: string;
  bookedById: string;
  applicationId: string;
  createdAt: string;
  updatedAt: string;
  application: {
    id: string;
    personalInformation: {
      firstName: string;
      lastName: string;
      mobileNumber: string;
      email: string;
    };
    preScreeningHistories?: Array<{
      id: string;
      outcome: string;
      createdAt: string;
      createdBy: {
        userPortalCategory: {
          user: {
            firstName: string;
            lastName: string;
          };
        };
      };
    }>;
  };
  interviewer: {
    userPortalCategory: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
  bookedBy: {
    userPortalCategory: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

export interface OutComeFormProps {
  interviews: Interview[];
  isLoading: boolean;
  onOutcomeSubmit: () => void;
}

export type OutcomeOption = {
  value: string;
  label: string;
};
