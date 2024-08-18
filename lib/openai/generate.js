'use server'
import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TEST_IMAGE = "https://images.squarespace-cdn.com/content/v1/535b1632e4b0ab57db46e48b/1607375587675-IK0HUTRNZ3UPKF1RFRIW/sunrise4.jpg?format=1000w"

export async function generateSongs(imageURL, colorName) {
  try {
    const assistant = await client.beta.assistants.retrieve(
      "asst_ogSQGhM8tBmyeww08BeMYf0d",
    );

    const thread = await client.beta.threads.create();

    const prompt = {
      role: "user",
      content: [
        {
          type: "text",
          text: `<${colorName}> <Al Green, Earl Sweatshirt, Future>`,
        },
        {
          type: "image_url",
          image_url: {
            url: process.env.NODE_ENV === "development" 
            ? TEST_IMAGE
            : imageURL,
          },
        },
      ],
    }

    await client.beta.threads.messages.create(thread.id, prompt);

    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    if (run.status === "completed") {
      const messages = await client.beta.threads.messages.list(thread.id);

      const out = messages.data[0].content[0].text.value;

      console.log(out);
      return out;
    } else {
      throw new Error("The run was not completed.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
