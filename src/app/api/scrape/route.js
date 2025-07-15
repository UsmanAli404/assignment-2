import * as cheerio from "cheerio";
import axios from "axios";

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

    if (response.status !== 200) {
      return new Response(
        JSON.stringify({ content: `Failed with status ${response.status}` }),
        { status: response.status }
      );
    }

    const html = response.data;
    const $ = cheerio.load(html);

    const text = $("p")
      .map((i, el) => $(el).text())
      .get()
      .join("\n\n");

    return new Response(
      JSON.stringify({ content: text.slice(0, 5000) }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Scraping error:", error.message);
    return new Response(
    JSON.stringify({ content: `Failed: ${error.response.status} ${error.response.statusText}` }),
        { status: error.response.status }
    );
  }
}