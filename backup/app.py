from flask import Flask, render_template, request, jsonify, send_file
from video_downloader import VideoDownloader
import tempfile
import os
import threading
import time

app = Flask(__name__)


def remove_temp_file(file_path):
    """
    Removes the temporary file after a delay to ensure it's no longer in use.
    """
    try:
        # Wait to ensure the file is no longer in use
        time.sleep(10)
        os.remove(file_path)
        # Remove the temporary directory if empty
        temp_dir = os.path.dirname(file_path)
        if not os.listdir(temp_dir):
            os.rmdir(temp_dir)
    except Exception as e:
        print(f"Error removing temp file {file_path}: {e}")


@app.route('/')
def index():
    """
    Renders the homepage.
    """
    return render_template('index.html')


@app.route('/process_url', methods=['POST'])
def process_url():
    """
    Processes the YouTube URL to extract available video and audio formats.
    """
    video_url = request.form.get('video_url', '').strip()
    if not video_url:
        return jsonify({'status': 'error', 'message': 'No URL provided.'}), 400
    downloader = VideoDownloader(video_url)
    try:
        info = downloader.get_video_info()
        return jsonify({'status': 'success', 'info': info})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/download', methods=['POST'])
def download():
    """
    Handles the download of the selected format.
    """
    video_url = request.form.get('video_url', '').strip()
    format_id = request.form.get('format_id', '').strip()
    type = request.form.get('type', '').strip().lower()
    audio_format = request.form.get('audio_format', '').strip().lower()  # New parameter

    if not video_url or not format_id or type not in ['video', 'audio']:
        return jsonify({'status': 'error', 'message': 'Missing or invalid parameters.'}), 400

    if type == 'audio' and audio_format not in ['mp3', 'wav']:
        return jsonify({'status': 'error', 'message': 'Invalid audio format specified.'}), 400

    downloader = VideoDownloader(video_url)
    try:
        file_path = downloader.download_format(format_id, type, audio_format if type == 'audio' else None)
        if not os.path.exists(file_path):
            return jsonify({'status': 'error', 'message': 'File not found.'}), 404
        # Start a thread to remove the temp file after sending
        threading.Thread(target=remove_temp_file, args=(file_path,)).start()
        return send_file(
            file_path,
            as_attachment=True,
            download_name=os.path.basename(file_path),
            mimetype='application/octet-stream'
        )
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
