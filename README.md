# YTverter

YTverter is a web application that allows users to convert YouTube videos into various audio and video formats. It provides a simple interface for users to input a YouTube URL and download the desired format.

## Features

- Convert YouTube videos to MP3, WAV, and MP4 formats.
- Responsive design with light and dark themes.
- Progress bar and loading spinner for download status.
- Open Graph and Twitter Card metadata for link embedding.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DJJJNabba/YTverter.git
   cd YTverter
   ```

2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install FFmpeg**:
   - **Windows**: Download the latest version from [FFmpeg's official website](https://ffmpeg.org/download.html) and follow the installation instructions.
   - **macOS**: Use Homebrew to install FFmpeg:
     ```bash
     brew install ffmpeg
     ```
   - **Linux**: Use your package manager, for example, on Ubuntu:
     ```bash
     sudo apt update
     sudo apt install ffmpeg
     ```

4. Run the Flask application:
   ```bash
   python app.py
   ```

4. Open your browser and go to `http://localhost:5000`.

## Usage

- Enter a YouTube URL in the input field and click "Convert".
- Choose between video or audio formats.
- Click "Download" to save the file to your device.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries, please contact [DJJJNabba](https://github.com/DJJJNabba).