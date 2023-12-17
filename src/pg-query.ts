import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PGVectorStore } from "langchain/vectorstores/pgvector";
import { PoolConfig } from "pg";

const config = {
  postgresConnectionOptions: {
    type: "postgres",
    host: "127.0.0.1",
    port: 5433,
    user: "myuser",
    password: "ChangeMe",
    database: "api",
  } as PoolConfig,
  tableName: "testlangchain",
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
};

try {
  const pgvectorStore = await PGVectorStore.initialize(
    new OpenAIEmbeddings(),
    config
  );

  const answer = async (q: string) => {
    const result = await pgvectorStore.similaritySearch(q, 10);
    const txt = result[0].pageContent;
    return result;
  };

  const prompt = () => process.stdout.write("🎨 ");

  console.log("Ask me stuff. Type 'q' to quit.");

  prompt();

  for await (const query of console) {
    if (query.match(/^(exit|quit|q)$/i)) {
      console.log("Exiting...");
      await pgvectorStore.end();
      process.exit(0);
    }

    if (!query.trim().length) {
      prompt();
    } else {
      answer(query).then((result) => {
        console.log({ A: result });
        prompt();
      });
    }
  }

  await pgvectorStore.end();
} catch (error: any) {
  if (error.message === "Failed to connect") {
    console.error('Could not connect. Make sure pgvector is up (bun up)')
    process.exit(1);
  }
}
