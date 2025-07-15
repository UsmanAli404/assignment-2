'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import "./globals.css";

export default function Home() {
  const [url, setUrl] = useState("https://blog.mozilla.org/en/mozilla/introducing-mozilla-ai/");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setContent("Loading...");

    try {
      const res = await fetch("/api/scrape/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      setContent(data.content || "Failed to fetch blog content.");
    } catch (err) {
      setContent("An error occurred while fetching the blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col px-4">
      <h1 className="text-3xl font-semibold text-center pt-12 pb-5">
        AI Blog Summariser
      </h1>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col gap-4 items-center w-full max-w-xl">
          <div className="flex gap-2 w-full">
            <Input
              type="text"
              placeholder="Enter blog URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
            />
            <Button size="sm" onClick={handleFetch} disabled={loading}>
              {loading ? "Fetching..." : "Go"}
            </Button>
          </div>

          <Textarea
            placeholder="Blog content will appear here..."
            className="w-full h-48 resize-none"
            value={content}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}