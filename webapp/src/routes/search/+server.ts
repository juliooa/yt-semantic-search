import { json, type RequestHandler } from '@sveltejs/kit';
import { Configuration, OpenAIApi } from 'openai';
import { createClient } from '@supabase/supabase-js';
import {
	SECRET_OPENAI_API_KEY,
	SECRET_SUPABASE_ANON_KEY,
	SECRET_SUPABASE_URL
} from '$env/static/private';

const supabase = createClient(SECRET_SUPABASE_URL, SECRET_SUPABASE_ANON_KEY);

const configuration = new Configuration({
	apiKey: SECRET_OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export const POST = (async ({ request }) => {
	let { question } = await request.json();
	console.log(question);
	let queryEmbedding = await createEmbedding(question);
	console.log(queryEmbedding);

	const res = await supabase.rpc('match_script_rows', {
		query_embedding: queryEmbedding,
		similarity_threshold: 0.7,
		match_count: 10
	});

	if (res.status !== 200) {
		console.log(res);
		throw new Error('Error searching for matches');
	}
	return json({ success: true, data: res.data });
}) satisfies RequestHandler;

async function createEmbedding(input: string) {
	const embeddingResponse = await openai.createEmbedding({
		model: 'text-embedding-ada-002',
		input
	});

	if (embeddingResponse.status !== 200) {
		console.log(embeddingResponse);
		throw new Error('Error creating embedding');
	}
	const [{ embedding }] = embeddingResponse.data.data;
	return embedding;
}
