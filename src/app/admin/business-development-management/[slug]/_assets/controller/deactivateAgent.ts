import axios from "axios";
import { DeactivatedType } from "../type/deactivated_type";

export function DeactivateAgentById(data: DeactivatedType) {
  const { token, agentId, userStatus } = data;

  return axios.patch(
    `${process.env.NEXT_PUBLIC_API_URL}/agent-info/${agentId}`,
    { userStatus },
    {
      headers: {
        Authorization: `Bearer Token ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
}
