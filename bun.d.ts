declare module "bun" {
  interface Env {
    OPENAI_API_KEY: string;
    PG_HOST: string;
    PG_PORT: number;
    PG_USER: string;
    PG_PASSWORD: string;
    PG_DATABASE: string;
    PG_TABLE: string;
  }
}

