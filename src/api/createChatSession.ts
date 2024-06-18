import axios from "axios";
import { baseUrl } from "../constants";
import { createConfig } from "../utils/utils";
import { HttpMethod } from "../types";

// returns text output
export const createChatSession = async (
  chatId: string,
  title: string,
  description: string,
  diff: string
) => {
  const prompt = `
    Title: ${title}
    Description: ${description}
    (diff starts)
    ${diff}
    (diff ends)
    `;
  try {
    const response = await axios.request(
      createConfig({
        url: `${baseUrl}/chats/${chatId}`,
        method: HttpMethod.POST,
        body: {
          date: Date.now(),
          prompt,
        },
      })
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
};
