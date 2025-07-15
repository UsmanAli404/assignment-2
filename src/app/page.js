'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import "./globals.css";

const enToUrdu = {
  "today": "آج",
  "we": "ہم",
  "are": "ہیں",
  "announcing": "اعلان کر رہے ہیں",
  "a": "ایک",
  "startup": "اسٹارٹ اپ",
  "to": "کے لیے",
  "build": "بنائیں",
  "trustworthy": "قابل اعتماد",
  "open-source": "اوپن سورس",
  "ai": "مصنوعی ذہانت",
  "ecosystem": "ماحولیاتی نظام",
  "this": "یہ",
  "is": "ہے",
  "first": "پہلا",
  "step": "قدم",
  "toward": "کی طرف",
  "that": "اس",
  "mission": "مشن"
};

function translateToUrdu(text) {
  return text
    .split(/\s+/)
    .map(word => {
      const clean = word.toLowerCase().replace(/[.,!?;]/g, '');
      return enToUrdu[clean] || word;
    })
    .join(" ");
}

export default function Home() {
  const [url, setUrl] = useState("https://blog.mozilla.org/en/mozilla/introducing-mozilla-ai/");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [urduSummary, setUrduSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setContent("Loading...");
    setSummary("");
    setUrduSummary("");

    try {
      const res = await fetch("/api/scrape/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      const englishSummary = data.summary || "No summary generated.";
      const translated = translateToUrdu(englishSummary);

      setContent(data.content || "Failed to fetch blog content.");
      setSummary(englishSummary);
      setUrduSummary(translated);
    } catch (err) {
      setContent("An error occurred while fetching the blog.");
      setSummary("");
      setUrduSummary("");
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

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Full Content</TabsTrigger>
              <TabsTrigger value="summary">Summary (English)</TabsTrigger>
              <TabsTrigger value="urdu">Summary (Urdu)</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <Textarea
                placeholder="Blog content will appear here..."
                className="w-full h-48 resize-none text-sm"
                value={content}
                readOnly
              />
            </TabsContent>

            <TabsContent value="summary">
              <Textarea
                placeholder="Summary will appear here..."
                className="w-full h-48 resize-none text-sm"
                value={summary}
                readOnly
              />
            </TabsContent>

            <TabsContent value="urdu">
              <Textarea
                placeholder="اردو خلاصہ یہاں ظاہر ہوگا..."
                className="w-full h-48 resize-none text-sm"
                value={urduSummary}
                readOnly
              />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
