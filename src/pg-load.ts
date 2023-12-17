import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PGVectorStore } from "langchain/vectorstores/pgvector";
import { PoolConfig } from "pg";
import { ArtistChunker } from "./artist-loader";

/* Configure */

// setup: https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/pgvector
// connect: docker exec -it bunsy-db-1 bash

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

const pgvectorStore = await PGVectorStore.initialize(
  new OpenAIEmbeddings(),
  config
);

/* Chunk the artist documents */

const chunker = new ArtistChunker("data/artists-p1.json");
const chunks = await chunker.chunk();
console.log(chunks);

/* Embed and insert the documents */

await pgvectorStore.addDocuments(chunks);
console.log(`Inserted ${chunks.length} documents.`);

/* Query the documents */

const results = await pgvectorStore.similaritySearch("climate change", 1);
console.log(results);

/* Clean up */

await pgvectorStore.end();
