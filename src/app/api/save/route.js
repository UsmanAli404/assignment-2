import { createClient } from '@supabase/supabase-js'
import { MongoClient } from 'mongodb'

// Supabase client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// MongoDB client setup
const mongoClient = new MongoClient(process.env.MONGODB_URI)
let cachedDb = null

async function getMongoDb() {
  if (!cachedDb) {
    await mongoClient.connect()
    cachedDb = mongoClient.db(process.env.MONGODB_DB_NAME || 'blog_ai')
  }
  return cachedDb
}

export async function POST(req) {
  try {
    const { url, summary, urduSummary, content } = await req.json()

    // Validate required fields
    if (!url || !summary || !content) {
      return new Response(
        JSON.stringify({ message: "Missing required fields: url, summary, content" }),
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { error: supabaseError } = await supabase
      .from('summaries')
      .insert([
        {
          url,
          summary,
          urdu_summary: urduSummary || null,
          created_at: new Date().toISOString()
        }
      ])

    if (supabaseError) {
      console.error("Supabase insert error:", supabaseError)
      return new Response(
        JSON.stringify({ message: "Failed to save to Supabase" }),
        { status: 500 }
      )
    }

    // Insert into MongoDB
    const db = await getMongoDb()
    const blogsCollection = db.collection('blogs')

    const result = await blogsCollection.insertOne({
      url,
      content,
      savedAt: new Date()
    })

    return new Response(
      JSON.stringify({
        message: "Saved to Supabase and MongoDB",
        mongoId: result.insertedId
      }),
      { status: 200 }
    )

  } catch (error) {
    console.error("Save API error:", error)
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    )
  }
}