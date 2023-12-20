import {
  ConversationalRetrievalQAChain,
  RetrievalQAChain,
} from "langchain/chains";
import { BaseChatModel } from "langchain/chat_models/base";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "langchain/prompts";
import { PGVectorStore } from "langchain/vectorstores/pgvector";
import { PoolConfig } from "pg";

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

const TEMPLATE = `
Use the following pieces of context to answer the question at the end.

If you don't know the answer, just say that you don't know, don't try to make up an answer.

If you are being asked for a list of artists, you MUST return the list in bullet point format, and each bullet point MUST be delimited by a '•' character, and separated by two newlines.
---
{context}
---

Question: {question}
Helpful Answer: `;

const MODEL_NAME = "gpt-3.5-turbo";

export class ArtistStore {
  private _store: PGVectorStore | undefined;
  private _qaChain: RetrievalQAChain | undefined;

  constructor() {
    this._store = undefined;
    this._qaChain = undefined;
  }

  static async connect() {
    const store = new ArtistStore();
    store._store = await PGVectorStore.initialize(
      new OpenAIEmbeddings(),
      config
    );

    store._qaChain = RetrievalQAChain.fromLLM(
      new ChatOpenAI({ modelName: MODEL_NAME, temperature: 0 }),
      store._store.asRetriever(),
      {
        returnSourceDocuments: true,
        prompt: PromptTemplate.fromTemplate(TEMPLATE),
      }
    );

    return store;
  }

  async close() {
    await this._store?.end();
  }

  async similarChunks(query: string) {
    const results = await this._store?.similaritySearch(query, 10);
    return results;
  }

  async ask(query: string) {
    if (this._qaChain === undefined) {
      throw new Error("Retrieval QA Chain not initialized");
    }
    const response = await this._qaChain.call({ query });
    // console.log(response.sourceDocuments);
    return response.text;
  }

  asChat(memoryKey = "chat_history") {
    const memory = new BufferMemory({ memoryKey, returnMessages: true });
    const model = new ChatOpenAI({ modelName: MODEL_NAME, temperature: 0 });
    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      this.store.asRetriever(),
      { memory }
    );

    return {
      send: async (query: string) => {
        const result = await chain.call({ question: query });
        return result;
      },
    };
  }

  get store(): PGVectorStore {
    if (this._store === undefined) {
      throw new Error("Vector Store not initialized");
    }
    return this._store;
  }
}
