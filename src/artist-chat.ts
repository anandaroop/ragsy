import { green } from "ansis";
import { ArtistStore } from "./artist-store";

try {
  const artists = await ArtistStore.connect();
  const chat = artists.asChat();

  console.log("Hello, I am a chatbot that knows about artists, based on their biographical blurbs on Artsy.\n\nAsk me anything. Type 'q' to quit.\n");

  console.log(`Here are some ways to get a conversation started:

  • Name some famous impressionist artists

  • Tell me more about the second one
  `)

  const prompt = () => process.stdout.write("\n🎨 ");
  prompt();

  for await (const query of console) {
    if (query.match(/^(exit|quit|q)$/i)) {
      console.log("Exiting...");
      await artists.close();
      process.exit(0);
    }

    if (!query.trim().length) {
      prompt();
    } else {
      const response = await chat.send(query);
      console.log("\n", green`${response.text}`);
      prompt();
    }
  }

  await artists.close();
} catch (error: any) {
  if (error.message === "Failed to connect") {
    console.error("Could not connect. Make sure pgvector is up (bun up)");
    process.exit(1);
  }
}
