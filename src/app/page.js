'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import "./globals.css";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const [saving, setSaving] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setContent("Loading...");
    setSummary("");
    setUrduSummary("");
    setFetched(false);
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
      setFetched(true);
    } catch (err) {
      setContent("An error occurred while fetching the blog.");
      setSummary("");
      setUrduSummary("");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, summary, urduSummary, content }),
      });

      const data = await res.json();

      if (res.ok) {
        toast("Saved!", {
          description: "Summary saved to Supabase and MongoDB.",
          duration: 4000
        });
      } else {
        toast("Save failed", {
          description: data.message || "An unknown error occurred.",
          duration: 4000,
          action: {
            label: "Retry",
            onClick: handleSave,
          },
        });
      }
    } catch (err) {
      toast("Error", {
        description: "Something went wrong while saving.",
        duration: 4000
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col px-4 justify-center">
      <h1 className="font-semibold text-center text-2xl mb-20 md:text-3xl md:mb-30">
        AI Blog Summariser
      </h1>

      <div className="flex items-center justify-center">
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              ) : (
                "Go"
              )}
            </Button>

          </div>

          <AnimatePresence initial={false}>
            {fetched && (
              <motion.div
                className="w-full overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Full Content</TabsTrigger>
                    <TabsTrigger value="summary">Summary (English)</TabsTrigger>
                    <TabsTrigger value="urdu">Summary (Urdu)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content">
                    <Textarea
                      placeholder="Blog content will appear here..."
                      className="w-full h-48 resize-none text-sm overflow-y-scroll scrollbar-hide"
                      value={content}
                      readOnly
                    />
                  </TabsContent>

                  <TabsContent value="summary">
                    <Textarea
                      placeholder="Summary will appear here..."
                      className="w-full h-48 resize-none text-sm overflow-y-scroll scrollbar-hide"
                      value={summary}
                      readOnly
                    />
                  </TabsContent>

                  <TabsContent value="urdu">
                    <Textarea
                      placeholder="اردو خلاصہ یہاں ظاہر ہوگا..."
                      className="w-full h-48 resize-none text-sm overflow-y-scroll scrollbar-hide"
                      value={urduSummary}
                      readOnly
                    />
                  </TabsContent>
                </Tabs>

                <Button
                  className="mt-4 w-full"
                  onClick={handleSave}
                  disabled={!summary || !content || saving}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </span>
                  ) : (
                    "Save Summary"
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
