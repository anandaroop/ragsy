import { green } from "ansis";
import { ArtistStore } from "./artist-store";

try {
  const artists = await ArtistStore.connect();

  console.log("Hello, I am a question answering bot that knows about artists, based on their biographical blurbs on Artsy.\n\nAsk me anything. Type 'q' to quit.\n");

  console.log(`Here are some examples of questions I can try to answer:

  • Who are some artists who incorporate techniques from comic books or graphic novels? Briefly describe their artistic practice.

  • Give me 5 contemporary South Asian women or nonbinary artists, preferably based in New York City. Tell me a little bit about them.
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
      const response = await artists.ask(query);
      console.log("\n", green`${response}`);
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
