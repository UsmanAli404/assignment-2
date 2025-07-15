import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import "./globals.css";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex flex-col px-4 dark">
      <h1 className="text-3xl font-semibold text-center pt-12 pb-5">Blog Summariser</h1>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col gap-4 items-center w-full max-w-xl">
          <div className="flex gap-2 w-full">
            <Input
              type="text"
              placeholder="Enter blog URL"
              className="w-full"
            />
            <Button size="sm">Go</Button>
          </div>

          <Textarea
            placeholder="Summary will appear here..."
            className="w-full h-48 resize-none"
          />
        </div>
      </div>
    </div>
  );
}