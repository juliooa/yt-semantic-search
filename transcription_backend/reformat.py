def reformat(segments):

    group_id = 0
    chunk_size_seconds = 40  # number of seconds to group the transcript chunks
    grouped_transcript = []
    group = {
        "time": 0,
        "text": "",
        "id": 0
    }
    start_time = segments[0]["time"]
    for element in segments:
        time = element["time"]
        if time - start_time >= chunk_size_seconds:
            group_id += 1
            grouped_transcript.append(group)
            group = {
                "time": time,
                "text": "",
                "id": group_id
            }
            start_time = time
        group["text"] = group["text"] + element["text"]

    grouped_transcript.append(group)
    return grouped_transcript
