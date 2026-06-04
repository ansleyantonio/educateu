// api/agentSettings.ts
import axios from "axios";

interface SettingParams {
  name: string;
  value: string;
  token: string;
}

export const updateAgentSetting = async ({
  name,
  value,
  token,
}: SettingParams) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/global/setting`,
      { name, value },
      {
        params: { name },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error(`Error updating ${name} setting:`, error);
    throw error;
  }
};

export const fetchAgentSetting = async (name: string, token: string) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/global/setting`,
      {
        params: { name },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error(`Error fetching ${name} setting:`, error);
    throw error;
  }
};
