/* global firebase */

// Main application logic will go here.

function initializeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyCVsByhovnQ2ECVjFDibc-V_EH_SNQNJxI",
        authDomain: "jtvc-fire-tv-app.firebaseapp.com",
        projectId: "jtvc-fire-tv-app",
        storageBucket: "jtvc-fire-tv-app.appspot.com",
        messagingSenderId: "850347198128",
        appId: "1:850347198128:android:5c85d27241b0f9049a5d75"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    } else {
        firebase.app(); // if already initialized, use that one
    }
}

function loadVideos() {
    const db = firebase.firestore();
    const grid = document.getElementById('video-grid-container');

    db.collection("videos").orderBy("title").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const video = doc.data();
            const tile = document.createElement('div');
            tile.className = 'video-tile';
            tile.style.backgroundImage = `url(${video.thumbnailUrl})`;
            tile.dataset.videoUrl = video.videoUrl; // Store video URL

            const title = document.createElement('div');
            title.className = 'video-title';
            title.innerText = video.title;

            tile.appendChild(title);
            grid.appendChild(tile);
        });
        // After loading, initialize navigation
        if (grid.children.length > 0) {
            grid.children[0].classList.add('focused');
            focusableElements = Array.from(grid.children);
            updateFocus();
        }
    }).catch((error) => {
        console.error("Error getting documents: ", error);
    });
}

// Global state
let focusableElements = [];
let currentIndex = 0;
let playerOpen = false;

function updateFocus() {
    focusableElements.forEach((el, index) => {
        el.classList.toggle('focused', index === currentIndex);
    });
}

function playVideo(url) {
    const playerContainer = document.getElementById('player-container');
    const videoPlayer = document.getElementById('video-player');
    videoPlayer.src = url;
    playerContainer.style.display = 'block';
    videoPlayer.play();
    playerOpen = true;
}

function closePlayer() {
    const playerContainer = document.getElementById('player-container');
    const videoPlayer = document.getElementById('video-player');
    videoPlayer.pause();
    videoPlayer.src = '';
    playerContainer.style.display = 'none';
    playerOpen = false;
}

window.onload = function () {
    console.log('Jewel TV App Initialized');
    initializeFirebase();
    loadVideos();

    // Add event listener for remote control keys
    document.addEventListener('keydown', function(e) {
        if (playerOpen) {
            if (e.keyCode === 10009) { // RETURN button
                closePlayer();
            }
            return; // Ignore other keys when player is open
        }

        if (focusableElements.length === 0) { return; } // Don't handle navigation if no items

        const grid = document.getElementById('video-grid-container');
        const itemsPerRow = Math.floor(grid.offsetWidth / focusableElements[0].offsetWidth);

        switch(e.keyCode){
            case 37: // LEFT arrow
                if (currentIndex > 0) { currentIndex--; }
                break;
            case 38: // UP arrow
                if (currentIndex >= itemsPerRow) { currentIndex -= itemsPerRow; }
                break;
            case 39: // RIGHT arrow
                if (currentIndex < focusableElements.length - 1) { currentIndex++; }
                break;
            case 40: // DOWN arrow
                if (currentIndex < focusableElements.length - itemsPerRow) { currentIndex += itemsPerRow; }
                break;
            case 13: // OK button
                const selectedTile = focusableElements[currentIndex];
                if (selectedTile && selectedTile.dataset.videoUrl) {
                    playVideo(selectedTile.dataset.videoUrl);
                }
                break;
            case 10009: // RETURN button
                tizen.application.getCurrentApplication().exit();
                break;
            default:
                console.log('Key code : ' + e.keyCode);
                break;
        }
        updateFocus();
    });
};
