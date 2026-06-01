type ExternalFixture = {
  externalId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  stage: "GROUP" | "ROUND_OF_16" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  stadium?: string;
  matchDay?: number;
};

export async function fetchFixturesFromProvider(): Promise<ExternalFixture[]> {
  const baseUrl = process.env.FOOTBALL_API_BASE_URL;
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!baseUrl || !apiKey) {
    return [];
  }

  const response = await fetch(`${baseUrl}/fixtures`, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Fixture sync failed");
  }

  const payload = (await response.json()) as { fixtures?: ExternalFixture[] };
  return payload.fixtures ?? [];
}
