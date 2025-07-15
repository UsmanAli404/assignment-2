import * as cheerio from "cheerio";
import axios from "axios";

function simulateSummary(text) {
  const sentences = text.split(/(?<=[.?!])\s+/);
  return sentences.slice(0, 3).join(" ");
}

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith("http")) {
      return new Response(
        JSON.stringify({ content: "Invalid URL." }),
        { status: 400 }
      );
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const text = $("p")
      .map((i, el) => $(el).text())
      .get()
      .join(" ");

    const trimmedText = text.slice(0, 5000);
    const summary = simulateSummary(trimmedText);

    return new Response(
      JSON.stringify({ content: trimmedText, summary }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Scraping error:", error.message);
    return new Response(
      JSON.stringify({ content: `Failed: ${error.response?.status || 500} ${error.response?.statusText || "Error"}` }),
      { status: error.response?.status || 500 }
    );
  }
}