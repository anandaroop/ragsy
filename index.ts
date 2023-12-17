import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ArtistStore } from "./src/artist-store";

console.log("\nConnecting…");
const artists = await ArtistStore.connect();

console.log("\nSetting up Q&A…\n");
const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
const chain = RetrievalQAChain.fromLLM(model, artists.store.asRetriever());

const query = `Can you name some artists who deal with the middle east conflict in their art? Please succinctly describe their artistic practice.`;
console.log(query + "\n")

const response = await chain.call({ query });
console.log(response.text);

await artists.close();
