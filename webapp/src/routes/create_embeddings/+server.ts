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
	let { script, time } = await request.json();
	console.log(script);

	const embedding = await createEmbedding(script);

	let res = await supabase.from('script_rows').insert({
		content: script,
		start_time: time,
		tokens: embedding.length,
		embedding: embedding
	});
	console.log(res);

	return json({ success: true });
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
