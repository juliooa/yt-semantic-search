# Youtube Semantic Search

**TL;DR:**

- Paste a youtube video
- It transcribes the video with OpenAI Whisper
- Reformat the video segments in chuncks of 40 seconds so there is more context in each segment
- It creates embeddings with Open AI embedding endpoint
- Saves the embedings in Supabase as the vector database
- When searching, converts the query to an embedding, then uses Supabase postgres function to search for similarities



https://user-images.githubusercontent.com/1221345/232793563-d5b27f35-aa35-4e9a-b8a4-340256b86bea.mp4



# Transcription

The transcription is done in a Python Flask app running [Open AI Whisper](https://github.com/openai/whisper), check it here.

# Embeddings

The video script chunks are converted to embeddings using [OpenAI embeddings api](https://platform.openai.com/docs/api-reference/embeddings).

# Vector Database

The embeddings are store in a Supabase database with the [pgvector extension](https://supabase.com/docs/guides/database/extensions/pgvector).
A postgres function is used for the similarity search ([more info here](https://supabase.com/blog/openai-embeddings-postgres-vector)).
