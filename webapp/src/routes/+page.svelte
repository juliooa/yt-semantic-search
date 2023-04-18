<script lang="ts">
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import { PUBLIC_TRANSCRIBE_URL } from '$env/static/public';

	interface ScriptRow {
		id: number;
		text: string;
		time: number;
	}

	let videoId: string | null = null;
	let inputVideoUrl = '';
	let loading = false;
	let loadingAction = '';
	let scriptRows: ScriptRow[] = [];
	let embeddingsReady = false;
	let startTime = 0;
	let autoplay = '';
	let question = '';

	function goToTime(time: number) {
		startTime = Math.floor(time);
		autoplay = 'autoplay';
	}

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		const formattedMinutes = String(minutes).padStart(2, '0');
		const formattedSeconds = String(remainingSeconds).padStart(2, '0');
		return `${formattedMinutes}:${formattedSeconds}`;
	}

	async function search() {
		loading = true;
		loadingAction = 'Searching in the video...';

		let response = await fetch(`/search`, {
			method: 'POST',
			body: JSON.stringify({ question: question }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		let result = await response.json();
		scriptRows = [];
		loading = false;
		for (const row of result.data) {
			let scriptRow = {
				id: row.id,
				text: row.content,
				time: row.start_time
			} satisfies ScriptRow;
			scriptRows.push(scriptRow);
		}
		scriptRows = scriptRows;
	}

	function transcribe() {
		loading = true;
		loadingAction = 'Transcribing...';

		fetch(`${PUBLIC_TRANSCRIBE_URL}/api/transcribe/${videoId}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		})
			.then((response) => response.json())
			.then((response) => {
				console.log(JSON.stringify(response));
				buildScriptList(response);
				loadingAction = 'Transcription complete! Creating embeddings...';
				generateEmbeddings();
			});
	}

	function buildScriptList(response: any) {
		console.log(response);
		response.script.forEach((element: any) => {
			let row = {
				id: element.id,
				text: element.text,
				time: element.time
			} satisfies ScriptRow;
			scriptRows.push(row);
		});
		scriptRows = scriptRows;
	}

	async function generateEmbeddings() {
		for (const scriptRow of scriptRows) {
			let result = await fetch(`/create_embeddings`, {
				method: 'POST',
				body: JSON.stringify({ script: scriptRow.text, time: scriptRow.time }),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			console.log(result);
		}
		loading = false;
		embeddingsReady = true;
	}

	function searchYTVideo() {
		const id = inputVideoUrl.split('v=')[1];
		if (id != undefined) {
			videoId = id;
		}
	}
</script>

<div class="flex m-11">
	<div class="basis-1/4" id="controls">
		<div class="card p-4 w-[560px] h-[315px] mx-auto">
			{#if videoId != null}
				<iframe
					class="w-full h-full"
					src="https://www.youtube.com/embed/{videoId}?start={startTime}&autoplay=1"
					frameborder="0"
					allowfullscreen
					title="YouTube video player"
					allow={autoplay}
				/>
			{:else}
				<div class="flex items-center justify-center h-full">
					<p class="text-center">The YouTube video will go here</p>
				</div>
			{/if}
		</div>
		<div class="mt-4 w-[560px]">
			<div>
				<label class="label">
					<span>1. Paste the Youtube url here:</span>
					<input
						class="input"
						type="text"
						placeholder="Input"
						bind:value={inputVideoUrl}
						on:input={() => searchYTVideo()}
					/>
					<div class="flex justify-end">
						<button
							class="btn variant-filled w-48 disabled:opacity-75"
							on:click={transcribe}
							disabled={videoId == null}>Transcribe</button
						>
					</div>
				</label>
			</div>
			<div>
				<label class="label">
					<span>2. What do you want to find on the video?</span>
					<input
						class="input disabled:opacity-75"
						type="text"
						placeholder="Input"
						bind:value={question}
						disabled={!embeddingsReady}
					/>
					<div class="flex justify-end">
						<button
							class="btn variant-filled w-48 disabled:opacity-75"
							disabled={!embeddingsReady}
							on:click={search}>Search</button
						>
					</div>
				</label>
			</div>
		</div>
	</div>
	<div class="basis-1/6 pl-4 grow" id="transcription">
		<div class="card">
			<h3 class="text-center pt-2">Your transcription will go here</h3>
			{#if loading}
				<div class="mt-7 px-4 pb-4">
					<p>{loadingAction}</p>
					<ProgressBar value={undefined} />
				</div>
			{/if}
			<div>
				<ol class="list">
					{#each scriptRows as scriptRow}
						<li
							on:click={() => goToTime(scriptRow.time)}
							on:keydown={() => goToTime(scriptRow.time)}
							class="hover:bg-primary-200 hover:cursor-pointer"
						>
							<span class="badge-icon p-6 variant-soft-primary">{formatTime(scriptRow.time)}</span>
							<span class="flex-auto">{scriptRow.text}</span>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</div>
</div>
