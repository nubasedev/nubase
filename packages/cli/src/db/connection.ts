import pg from "pg";

const { Client } = pg;

export async function withConnection<T>(
  url: string,
  fn: (client: pg.Client) => Promise<T>,
): Promise<T> {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}
