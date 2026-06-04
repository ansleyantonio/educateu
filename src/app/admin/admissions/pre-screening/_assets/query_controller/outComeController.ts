import axios from 'axios';

interface OutcomeData {
  outcome: string;
  template: string;
  description?: string;
  applicationId: string;
}

export const outComeController = async ({ token, data }: { token: string; data: OutcomeData }) => {
  // console.log('data', data);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/pre-screening/outcome/${data.applicationId}`,
      {
        outcome: data.outcome,
        template: data.template,
        description: data.description || '',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response?.data;
    }
    throw error;
  }
};