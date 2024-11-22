// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');

// Detect system theme preference if no theme is stored
let currentTheme = localStorage.getItem('theme');
if (!currentTheme) {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = systemPrefersDark ? 'dark-mode' : 'light-mode';
}

// Apply the theme on initial load
document.body.classList.add(currentTheme);
updateThemeIcon(currentTheme);

// Function to update the theme icon
function updateThemeIcon(theme) {
    console.log('Updating theme icon for:', theme); // Debugging log
    if (theme === 'dark-mode') {
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

// Event listener for theme toggle button
themeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    let theme = 'light-mode';
    if (document.body.classList.contains('dark-mode')) {
        theme = 'dark-mode';
    }
    console.log('Saving theme to localStorage:', theme); // Debugging log
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
});

// Existing YouTube Downloader Functionality
document.getElementById('convert-btn').addEventListener('click', function() {
    const videoUrl = document.getElementById('video-url').value.trim();
    if (!videoUrl) {
        alert('Please enter a YouTube URL.');
        return;
    }
    document.getElementById('loading-spinner').style.display = 'block';
    document.getElementById('content').style.display = 'none';
    fetch('/process_url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({'video_url': videoUrl})
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loading-spinner').style.display = 'none';
        if (data.status === 'success') {
            displayVideoInfo(data.info);
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        document.getElementById('loading-spinner').style.display = 'none';
        alert('An error occurred: ' + error);
    });
});

function displayVideoInfo(info) {
    document.getElementById('content').style.display = 'flex';
    document.getElementById('video-title').innerText = info.title;
    document.getElementById('video-thumbnail').src = info.thumbnail;
    document.getElementById('video-details').innerText = `Duration: ${formatDuration(info.duration)}`;
    setupFormatOptions(info.video_formats, info.audio_formats);
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

function setupFormatOptions(videoFormats, audioFormats) {
    const videoBtn = document.getElementById('video-btn');
    const audioBtn = document.getElementById('audio-btn');

    // Remove existing event listeners to prevent multiple bindings
    const newVideoBtn = videoBtn.cloneNode(true);
    videoBtn.parentNode.replaceChild(newVideoBtn, videoBtn);

    const newAudioBtn = audioBtn.cloneNode(true);
    audioBtn.parentNode.replaceChild(newAudioBtn, audioBtn);

    newVideoBtn.addEventListener('click', function() {
        setActiveTab('video');
        displayVideoFormats(videoFormats);
    });

    newAudioBtn.addEventListener('click', function() {
        setActiveTab('audio');
        displayAudioFormats(audioFormats);
    });

    // Display video formats by default
    setActiveTab('video');
    displayVideoFormats(videoFormats);
}

function setActiveTab(tab) {
    const videoBtn = document.getElementById('video-btn');
    const audioBtn = document.getElementById('audio-btn');
    if (tab === 'video') {
        videoBtn.classList.add('active');
        audioBtn.classList.remove('active');
    } else {
        audioBtn.classList.add('active');
        videoBtn.classList.remove('active');
    }
}

function displayVideoFormats(formats) {
    const container = document.getElementById('format-options');
    container.innerHTML = '';

    if (formats.length === 0) {
        container.innerHTML = '<p>No video formats available.</p>';
        return;
    }

    // Align columns for video formats
    const header = document.createElement('div');
    header.className = 'format-header';
    header.innerHTML = `
        <span class="col-resolution">Resolution</span>
        <span class="col-fps">FPS</span>
        <span class="col-size">Size</span>
        <span class="col-action">Action</span>
    `;
    container.appendChild(header);

    formats.forEach(f => {
        const card = document.createElement('div');
        card.className = 'format-card animate__animated animate__fadeInUp';

        const resolution = document.createElement('span');
        resolution.className = 'col-resolution';
        resolution.innerText = f.resolution;

        const fps = document.createElement('span');
        fps.className = 'col-fps';
        fps.innerText = f.fps;

        const size = document.createElement('span');
        size.className = 'col-size';
        size.innerText = f.size;

        const btn = document.createElement('button');
        btn.className = 'col-action-btn';
        btn.innerText = 'Download';
        btn.setAttribute('data-format-id', f.format_id);
        btn.setAttribute('data-type', 'video');
        btn.addEventListener('click', function() {
            handleDownload(this);
        });

        card.appendChild(resolution);
        card.appendChild(fps);
        card.appendChild(size);
        card.appendChild(btn);
        container.appendChild(card);
    });
}

function displayAudioFormats(formats) {
    const container = document.getElementById('format-options');
    container.innerHTML = '';

    if (formats.length === 0) {
        container.innerHTML = '<p>No audio formats available.</p>';
        return;
    }

    // Align columns for audio formats
    const header = document.createElement('div');
    header.className = 'format-header';
    header.innerHTML = `
        <span class="col-format">Format</span>
        <span class="col-bitrate">Bitrate</span>
        <span class="col-size">Size</span>
        <span class="col-action">Action</span>
    `;
    container.appendChild(header);

    formats.forEach(f => {
        const card = document.createElement('div');
        card.className = 'format-card animate__animated animate__fadeInUp';

        const format = document.createElement('span');
        format.className = 'col-format';
        format.innerText = f.format;

        const bitrate = document.createElement('span');
        bitrate.className = 'col-bitrate';
        bitrate.innerText = f.bitrate;

        const size = document.createElement('span');
        size.className = 'col-size';
        size.innerText = f.size;

        const btn = document.createElement('button');
        btn.className = 'col-action-btn';
        btn.innerText = 'Download';
        btn.setAttribute('data-format-id', f.format_id);
        btn.setAttribute('data-type', 'audio');
        btn.setAttribute('data-audio-format', f.format.toLowerCase());
        btn.addEventListener('click', function() {
            handleDownload(this);
        });

        card.appendChild(format);
        card.appendChild(bitrate);
        card.appendChild(size);
        card.appendChild(btn);
        container.appendChild(card);
    });
}

function handleDownload(button) {
    const formatId = button.getAttribute('data-format-id');
    const type = button.getAttribute('data-type');
    const audioFormat = button.getAttribute('data-audio-format'); // New attribute
    const videoUrl = document.getElementById('video-url').value.trim();

    if (!videoUrl) {
        alert('No video URL provided.');
        return;
    }

    // Disable the button and show 'Downloading' with spinner
    button.disabled = true;
    const originalText = button.innerText;
    button.innerText = 'Downloading';
    const spinner = document.createElement('span');
    spinner.className = 'button-spinner';
    button.appendChild(spinner);

    // Show the progress bar
    document.getElementById('progress-bar').style.display = 'block';
    const progress = document.getElementById('progress');
    progress.style.width = '0%';

    // Prepare the body parameters
    const params = new URLSearchParams({
        'video_url': videoUrl,
        'format_id': formatId,
        'type': type
    });

    if (type === 'audio') {
        params.append('audio_format', audioFormat);
    }

    fetch('/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => { throw new Error(data.message); });
        }
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'download';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) {
                filename = match[1];
            }
        }
        const contentLength = response.headers.get('Content-Length');
        if (!contentLength) {
            // If Content-Length is not provided, show indeterminate progress
            progress.style.width = '100%';
            return response.blob().then(blob => ({blob, filename}));
        }

        const total = parseInt(contentLength, 10);
        let loaded = 0;

        return new Promise((resolve, reject) => {
            const reader = response.body.getReader();
            const chunks = [];
            reader.read().then(function processResult(result) {
                if (result.done) {
                    const blob = new Blob(chunks);
                    resolve({blob, filename});
                    return;
                }
                loaded += result.value.length;
                chunks.push(result.value);
                const percent = ((loaded / total) * 100).toFixed(2);
                progress.style.width = `${percent}%`;
                return reader.read().then(processResult);
            }).catch(error => {
                reject(error);
            });
        });
    })
    .then(({blob, filename}) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        progress.style.width = '100%';
        setTimeout(() => {
            document.getElementById('progress-bar').style.display = 'none';
            progress.style.width = '0%';
        }, 500);
    })
    .catch(error => {
        document.getElementById('progress-bar').style.display = 'none';
        alert('Error: ' + error.message);
    })
    .finally(() => {
        // Revert the button to its original state
        button.disabled = false;
        button.innerText = originalText;
    });
}
