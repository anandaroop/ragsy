import { blue, green } from "ansis";
import {
  ConversationalRetrievalQAChain,
  RetrievalQAChain,
} from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory } from "langchain/memory";
import { PGVectorStore } from "langchain/vectorstores/pgvector";
import { PoolConfig } from "pg";

/*
 * Connect to the vector store
 */

const config = {
  postgresConnectionOptions: {
    type: "postgres",
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  } as PoolConfig,
  tableName: process.env.PG_TABLE,
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
};

const store = await PGVectorStore.initialize(new OpenAIEmbeddings(), config);

/*
 * Similarity search over vectorized document
 */

const similarDocs = await store.similaritySearch("Impressionism", 5)
console.log(similarDocs)

/*
 * Simple Q&A -- stateless
 */

// const qaChain = RetrievalQAChain.fromLLM(
//   new ChatOpenAI({ modelName: "gpt-3.5-turbo" }),
//   store.asRetriever()
// );

// const query = "Name some Impressionist artists"
// const response = await qaChain.call({ query  });

// console.log(blue.bold(query), "\n");
// console.log(green(response.text), "\n");

/*
 * Chat -- "remembers" conversation history
 */

// const memory = new BufferMemory({ memoryKey: "chat_history" });
// const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 });
// const chatChain = ConversationalRetrievalQAChain.fromLLM(
//   model,
//   store.asRetriever(),
//   { memory }
// );

// const question1 = "Name one artist from the Impressionist movement";
// const response1 = await chatChain.call({ question: question1 });
// console.log( blue.bold(question1), "\n");
// console.log( green(response1.text), "\n");

// const question2 = "Briefly tell me some more about his or her art";
// const response2 = await chatChain.call({ question: question2 });
// console.log( blue.bold(question2), "\n");
// console.log( green(response2.text), "\n");

// const question3 = "Who are some similar artists?";
// const response3 = await chatChain.call({ question: question3 });
// console.log( blue.bold(question3), "\n");
// console.log( green(response3.text), "\n");

/*
 * Clean up
 */

await store.end();
