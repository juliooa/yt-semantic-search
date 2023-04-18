import logging
from flask import Flask, jsonify
from flask_cors import CORS

from reformat import reformat

from transcribe import transcribe_yt

app = Flask(__name__)
CORS(app)

# Uncomment this if you want to use an access token to access the API, set the access token here
# access_token = 'qs40oEyAy/!N=llMGxweDb?oun6brI2Y3eFLmP/kqMZ3xMJVHu1Ew!Uniz66j=dIdeELZ-peCbBwe5PUafYVFLVZBr3OK5BkvOLlPSsvRlN0D?lofkDJbx?AfR3ZVUSpKx7fP1qcqvpuaOEhY310sRxj5zKSqC-6!JjkeUTbu-GMEF-jYE!Lkoj2wD7hSRFD9fAXsMKBo4DEKmSn2/xspM-H8BwT5VYmsHXi2N85kGUm3j2hUU4ABr0p?87XoX6-'  # Set the access token

audio_directory = 'audio'  # The directory where the audio files will be saved


@app.route('/api/transcribe/<video_id>', methods=['GET'])
def transcribe(video_id):
    # Uncomment this if you want to use an access token to access the API
    # if 'Authorization' not in request.headers or request.headers['Authorization'] != f'Bearer {access_token}':
    #     return jsonify({'error': 'Unauthorized'}), 401

    app.logger.info(f"Transcribing video with id: {video_id}")
    result = transcribe_yt(f'https://www.youtube.com/watch?v={video_id}')
    formatted = reformat(result['segments'])

    return jsonify({'script': formatted})


if __name__ == '__main__':
    logging.basicConfig(level=logging.VERBOSE)
    app.run()
