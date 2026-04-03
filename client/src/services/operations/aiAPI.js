import { apiConnector } from "../apiConnector";
import { aiEndpoints } from "../apis";

const { GENERATE_LEARNING_PATH_API } = aiEndpoints;

export async function generateLearningPath(goal, token) {
  try {
    const response = await apiConnector(
      "POST",
      GENERATE_LEARNING_PATH_API,
      { goal },
      { Authorization: `Bearer ${token}` }
    );
    return { roadmap: response.data.roadmap, explanation: response.data.explanation || "" };
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}
