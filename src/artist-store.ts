import { RetrievalQAChain } from "langchain/chains";
import { BaseChatModel } from "langchain/chat_models/base";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
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

export class ArtistStore {
  private _store: PGVectorStore | undefined;
  private _qaChain: RetrievalQAChain | undefined;;

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
      new ChatOpenAI(
        // { modelName: "gpt-3.5-turbo" }
        ),
      store._store.asRetriever()
    );

    return store;
  }

  async close() {
    await this._store?.end();
  }

  async ask(query: string) {
    if (this._qaChain === undefined) {
      throw new Error("Retrieval QA Chain not initialized");
    }
    const response = await this._qaChain.call({ query });
    return response.text;
  }

  get store(): PGVectorStore {
    if (this._store === undefined) {
      throw new Error("Vector Store not initialized");
    }
    return this._store;
  }
}
