import axios from "axios";
import { aiId, baseUrl } from "../constants";
import { createConfig } from "../utils/utils";
import { HttpMethod } from "../types";

// returns chatId along with chat details
export const createChat = async () => {
  try {
    const response = await axios.request(
      createConfig({
        url: `${baseUrl}/ai/${aiId}/chats`,
        method: HttpMethod.POST,
      })
    );
    return response.data.id;
  } catch (error) {
    console.error("Error:", error);
  }
};
