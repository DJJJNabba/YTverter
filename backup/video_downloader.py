import yt_dlp
import tempfile
import os


class VideoDownloader:
    def __init__(self, url):
        self.url = url
        self.ydl_opts = {
            'quiet': True,
            'noplaylist': True,
            'no_warnings': True,
            'ignoreerrors': True,
        }

    def get_video_info(self):
        """
        Extracts video and audio formats from the provided YouTube URL.
        Accounts for audio format conversions and accurate size calculation.
        """
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            info_dict = ydl.extract_info(self.url, download=False)
            if not info_dict:
                raise Exception("Could not extract video information.")
            formats = info_dict.get('formats', [])
            video_info = {
                'title': info_dict.get('title', ''),
                'duration': info_dict.get('duration', 0),
                'thumbnail': info_dict.get('thumbnail', ''),
                'video_formats': [],
                'audio_formats': []
            }

            # Extract highest bitrate audio format
            best_audio = None
            for fmt in formats:
                if fmt.get('vcodec') == 'none' and fmt.get('acodec') != 'none':
                    abr = fmt.get('abr', 0) or 0  # Ensure abr is numeric
                    if not best_audio or abr > (best_audio.get('abr', 0) or 0):
                        best_audio = fmt

            # Add the highest bitrate audio in MP3, WAV, formats
            if best_audio:
                base_size = best_audio.get('filesize') or best_audio.get('filesize_approx') or 0
                base_size_mb = base_size / (1024 * 1024) if base_size else 0

                # Calculate sizes for different formats based on bitrate and codec overhead
                # These multipliers are approximate and can vary based on actual encoding
                audio_formats = [
                    {
                        'format': 'MP3',
                        'bitrate': '196 kbps',
                        'size': f"{(base_size_mb * 1.0):.2f} MB",
                        'format_id': best_audio['format_id'],
                        'preferredcodec': 'mp3'
                    },
                    {
                        'format': 'WAV',
                        'bitrate': '196 kbps',
                        'size': f"{(base_size_mb * 1.2):.2f} MB",
                        'format_id': best_audio['format_id'],
                        'preferredcodec': 'wav'
                    }
                ]
                video_info['audio_formats'] = audio_formats

            # Extract video formats
            seen_video_formats = {}
            best_audio_size = base_size
            for fmt in formats:
                if fmt.get('vcodec') != 'none' and fmt.get('ext') == 'mp4':
                    resolution = f"{fmt.get('height', 'Unknown')}p"
                    fps = int(fmt.get('fps', 0)) if fmt.get('fps') else 0
                    size = fmt.get('filesize') or fmt.get('filesize_approx') or 0
                    if size == 0:  # Skip entries with unknown size
                        continue
                    size_mb = f"{(size + best_audio_size) / (1024 * 1024):.2f} MB"

                    key = (resolution, fps)
                    if key not in seen_video_formats:
                        seen_video_formats[key] = {
                            'format_id': fmt.get('format_id'),
                            'resolution': resolution,
                            'fps': str(fps),
                            'size': size_mb
                        }

            video_info['video_formats'] = list(seen_video_formats.values())
            return video_info

    def download_format(self, format_id, type, audio_format=None):
        """
        Downloads the specified format based on type.
        
        Args:
            format_id (str): The format ID to download.
            type (str): 'video' or 'audio'.
            audio_format (str): Desired audio format ('mp3', 'wav') for audio downloads.
        
        Returns:
            str: The file path of the downloaded file.
        
        Raises:
            Exception: If the download fails or type is invalid.
        """
        # Create a temporary directory
        temp_dir = tempfile.mkdtemp()
        output_template = os.path.join(temp_dir, '%(title)s.%(ext)s')

        ydl_opts = {
            'quiet': True,
            'noplaylist': True,
            'no_warnings': True,
            'ignoreerrors': True,
            'outtmpl': output_template,
        }

        if type == 'video':
            # For video, download video and best audio and merge into MP4
            ydl_opts['format'] = f"{format_id}+bestaudio/best"
            ydl_opts['merge_output_format'] = 'mp4'
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }]
        elif type == 'audio':
            if not audio_format:
                raise Exception("Audio format not specified.")
            # For audio, download and convert to specified format
            ydl_opts['format'] = format_id
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': audio_format,
                'preferredquality': '192',
            }]
        else:
            raise Exception("Invalid type specified. Must be 'video' or 'audio'.")

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info_dict = ydl.extract_info(self.url, download=True)
                if not info_dict:
                    raise Exception("Failed to download the format.")
                # Depending on type, prepare filename
                if type == 'video':
                    # After merging, the filename should be MP4
                    filename = ydl.prepare_filename(info_dict)
                    if not filename.endswith('.mp4'):
                        filename = os.path.splitext(filename)[0] + '.mp4'
                elif type == 'audio':
                    # After conversion, set extension based on audio_format
                    filename = ydl.prepare_filename(info_dict)
                    if audio_format == 'mp3' and not filename.endswith('.mp3'):
                        filename = os.path.splitext(filename)[0] + '.mp3'
                    elif audio_format == 'wav' and not filename.endswith('.wav'):
                        filename = os.path.splitext(filename)[0] + '.wav'
                return filename
            except Exception as e:
                raise Exception(f"Error downloading format: {str(e)}")
