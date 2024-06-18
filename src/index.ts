import {
  createComment,
  createReviewComment,
  getDiff,
  getPRDetails,
} from "./oldfile";
import { readFileSync } from "fs";
import { Octokit } from "@octokit/rest";
import { createChat } from "./api/createChat";
import { createChatSession } from "./api/createChatSession";

const GITHUB_TOKEN: string = process.env.MRCODER991_GITHUB_TOKEN ?? ""; // mrcoder991
// const GITHUB_TOKEN: string = process.env.UDAY_APPDIRECT_FINEGRAINED_ACCESS_TOKEN ?? ""; // uday-appdirect
// const GITHUB_TOKEN: string = process.env.UDAY_APPDIRECT_GITHUB_TOKEN; // uday-appdirect
const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function main() {
  const prDetails = await getPRDetails();

  // const eventData = JSON.parse(
  //   readFileSync("process.env.GITHUB_EVENT_PATH" ?? "", "utf8")
  // );

  const eventData = {
    action: "opened",
    before: "before",
    after: "after",
  };

  let diff: string | null;

  if (eventData.action === "opened") {
    diff = await getDiff(
      prDetails.owner,
      prDetails.repo,
      prDetails.pull_number
    );
  } else if (eventData.action === "synchronize") {
    const newBaseSha = eventData.before;
    const newHeadSha = eventData.after;

    const response = await octokit.repos.compareCommits({
      headers: {
        accept: "application/vnd.github.v3.diff",
      },
      owner: prDetails.owner,
      repo: prDetails.repo,
      base: newBaseSha,
      head: newHeadSha,
    });

    diff = String(response.data);
  } else {
    console.log("Unsupported event:", process.env.GITHUB_EVENT_NAME);
    return;
  }

  // console.log("Diff:", diff);

  let reviewComments: { path: string; position: number; body: string }[] = [];
  let reviewBody: string = "Added comments";
  if (diff) {
    try {
      const chatId = await createChat();
      const aiResponse = await createChatSession(
        chatId,
        prDetails.title,
        prDetails.description,
        diff
      );
      if (aiResponse && aiResponse?.comments.length) {
        aiResponse.comments.forEach((response: any, i: any) => {
          const { path, position, body } = response;
          reviewComments.push({
            path,
            position,
            body,
          });
        });
        reviewBody = aiResponse?.reviewBody || reviewBody;
      }
    } catch (error) {
      console.error("Error:", error);
    }

    // prDetails.owner = 'uday-appdirect';
    // prDetails.repo = 'codeball-test';
    // prDetails.pull_number = 17;
    // prDetails.commit_id = "23c589331bd35b288030f519755e3b2917655dbc";
    
    if (reviewComments && reviewComments.length) {
      await octokit.request(
        `POST /repos/${prDetails.owner}/${prDetails.repo}/pulls/${prDetails.pull_number}/reviews`,
        {
          owner: prDetails.owner,
          repo: prDetails.repo,
          pull_number: prDetails.pull_number,
          body: reviewBody,
          event: "COMMENT",
          commit_id: prDetails.commit_id,
          comments: reviewComments,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
    }
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
