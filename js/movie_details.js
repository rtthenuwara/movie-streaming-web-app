// movie_details.js
// ==================================================================
// ==           MOVIE DETAILS PAGE - VIDEO PLAYER LOGIC            ==
// ==================================================================



/**
 * Checks user access before playing a movie.
 * Refactored to Sync Watch Progress from DB (App <-> Web Sync)
 */
async function checkAccessAndPlay(movieLink, hasAccess) {
    if (hasAccess) {

        // ⭐ NEW: Play කරන්න කලින්ම අලුත්ම Timestamp එක Server එකෙන් ගන්නවා (App Sync)
        try {
            // දැනට global variable එකේ තියෙන අගය update කරනවා
            let response = await fetch(`get_watch_progress.php?id=${currentMovieId}&type=movie`);
            let data = await response.text();
            savedPlaybackTime = parseFloat(data); // Update global variable
            console.log("Synced Time from Server: " + savedPlaybackTime);
        } catch (error) {
            console.error("Error syncing watch progress:", error);
        }

        // 1. View Count Update
        if (typeof currentMovieId !== 'undefined') {
            updateViewCount(currentMovieId, 'movie');
        }

        // 2. UI Setup
        document.body.classList.add('player-active');
        const banner = document.querySelector('#movie-banner');
        if (!banner) {
            console.error('Movie detail banner not found.');
            return;
        }
        banner.classList.add('video-mode');

        // 3. Subtitles Setup
        let trackElementsHTML = '';
        let hasDefaultSubtitle = false;
        if (typeof availableSubtitles !== 'undefined' && Array.isArray(availableSubtitles)) {
            availableSubtitles.forEach(sub => {
                if (sub.kind && sub.label && sub.srclang && sub.src) {
                    const isDefault = sub.srclang === 'si';
                    if (isDefault) hasDefaultSubtitle = true;
                    trackElementsHTML += `<track kind="${sub.kind}" label="${sub.label}" srclang="${sub.srclang}" src="${sub.src}" ${isDefault ? 'default' : ''}>`;
                }
            });
        }

        // 4. Create Video HTML
        let videoPlayerHTML = `
            <div id="video-wrapper">
                <button class="inner-close-btn" id="player-close-btn">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="player-branding-overlay">PLEXZONE STREAM</div> 
                
                <video id="plyr-player" controls crossorigin playsinline poster="images/plexzone-logo-2.png">
                    <source src="${movieLink}" type="video/mp4">
                    ${trackElementsHTML} 
                </video>
            </div>
        `;

        banner.insertAdjacentHTML('beforeend', videoPlayerHTML);

        // ⭐ 5. SHOW NOW PLAYING BAR (Only on Mobile)
        showNowPlayingBar();

        // 6. Focus & Scroll
        setTimeout(() => {
            const wrapper = document.getElementById('video-wrapper');
            if (wrapper) {
                wrapper.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
        }, 300);

        // 7. Initialize Plyr
        try {
            const player = new Plyr('#plyr-player', {
                captions: { active: hasDefaultSubtitle, language: hasDefaultSubtitle ? 'si' : 'auto', update: true },
                ratio: null,
                fullscreen: { enabled: true, fallback: true, iosNative: true }
            });

            // Store player globally for resize handler
            window.player = player;

            // --- App Rotation Logic ---
            player.on('enterfullscreen', () => {
                const nowPlayingBar = document.getElementById('now-playing-bar');
                if (nowPlayingBar && window.innerWidth <= 768) {
                    setTimeout(() => {
                        nowPlayingBar.style.display = 'flex';
                        nowPlayingBar.style.visibility = 'visible';
                        nowPlayingBar.style.opacity = '1';
                        nowPlayingBar.style.position = 'fixed';
                        nowPlayingBar.style.bottom = '0';
                        nowPlayingBar.style.zIndex = '2147483646';
                    }, 100);
                }
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ENTER_FULLSCREEN' }));
                }
            });

            player.on('exitfullscreen', () => {
                const nowPlayingBar = document.getElementById('now-playing-bar');
                const banner = document.getElementById('movie-banner');
                if (nowPlayingBar && banner && banner.classList.contains('video-mode') && window.innerWidth <= 768) {
                    setTimeout(() => {
                        nowPlayingBar.style.display = 'flex';
                        nowPlayingBar.style.visibility = 'visible';
                        nowPlayingBar.style.opacity = '1';
                        nowPlayingBar.style.position = 'fixed';
                        nowPlayingBar.style.bottom = '0';
                        nowPlayingBar.style.zIndex = '2147483646';
                    }, 200);
                }
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_FULLSCREEN' }));
                }
            });

            // --- Resume Logic (Updated) ---
            player.on('ready', event => {
                // මෙතන දැන් වැඩ කරන්නේ අපි උඩදි fetch කරපු අලුත් savedPlaybackTime එක
                if (typeof savedPlaybackTime !== 'undefined' && savedPlaybackTime > 10) {
                    const resumeModal = document.getElementById('resume-modal-overlay');
                    const timeDisplay = document.getElementById('resume-time-display');
                    const btnYes = document.getElementById('btn-resume-yes');
                    const btnNo = document.getElementById('btn-resume-no');

                    // Convert timestamp to HH:MM:SS format
                    timeDisplay.innerText = new Date(savedPlaybackTime * 1000).toISOString().substr(11, 8);
                    resumeModal.style.display = 'flex';

                    btnYes.onclick = function() {
                        resumeModal.style.display = 'none';
                        var playPromise = player.play();
                        if (playPromise !== undefined) {
                            playPromise.then(_ => { player.currentTime = savedPlaybackTime; })
                            .catch(error => { player.currentTime = savedPlaybackTime; });
                        }
                    };

                    btnNo.onclick = function() {
                        player.currentTime = 0;
                        savedPlaybackTime = 0; // Reset local
                        
                        // Reset Server Side
                        const formData = new FormData();
                        formData.append('id', currentMovieId);
                        formData.append('type', 'movie');
                        formData.append('action', 'reset');
                        // Note: ඔයාට save_watch_progress.php එකේ 'reset' logic එක handle කරන්න වෙයි.
                        // නැත්නම් නිකන්ම 0 යවලා update කරන්න.
                        // saveWatchProgress(currentMovieId, 'movie', 0); <--- මෙහෙම call කරානම් වඩා හොදයි.
                        
                        player.play();
                        resumeModal.style.display = 'none';
                    };
                }
            });

            // --- Auto Save Logic ---
            setInterval(() => {
                if (player.playing && player.currentTime > 0) {
                    savedPlaybackTime = player.currentTime;
                    saveWatchProgress(currentMovieId, 'movie', player.currentTime);
                }
            }, 10000);

            // --- Close Button Handling ---
            const closeBtn = document.getElementById('player-close-btn');
            if(closeBtn) {
                closeBtn.addEventListener('click', function() {
                    savedPlaybackTime = player.currentTime;
                    saveWatchProgress(currentMovieId, 'movie', player.currentTime);
                    closeVideoPlayer();
                });
            }

            // --- Mobile Tap Fix ---
            const playerContainer = document.querySelector('.plyr');
            if (playerContainer) {
                playerContainer.addEventListener('click', (event) => {
                    if (window.innerWidth <= 768) {
                        const isBottomControls = event.target.closest('.plyr__controls');
                        const isAnyButton = event.target.closest('button') || event.target.closest('.plyr__control');
                        if (!isBottomControls && !isAnyButton) {
                            player.togglePlay(); 
                        }
                    }
                });
            }

        } catch (e) {
            console.error("Plyr Error:", e);
        }

    } else {
        window.location.href = 'pricing';
    }
}

/**
 * ⭐ SHOW NOW PLAYING BAR (Only on Mobile)
 */
function showNowPlayingBar() {
    const nowPlayingBar = document.getElementById('now-playing-bar');
    const banner = document.getElementById('movie-banner');
    
    if (nowPlayingBar && banner) {
        // Get movie title
        const movieTitle = typeof currentMovieTitle !== 'undefined' ? currentMovieTitle : 
                          (document.querySelector('h1')?.textContent || 'Movie');
        
        // Update title in bar
        const titleElement = nowPlayingBar.querySelector('.np-title');
        if (titleElement) {
            titleElement.textContent = movieTitle;
        }
        
        // Show bar only on mobile AND only when video mode is active
        if (window.innerWidth <= 768 && banner.classList.contains('video-mode')) {
            nowPlayingBar.style.display = 'flex';
            nowPlayingBar.style.visibility = 'visible';
            nowPlayingBar.style.opacity = '1';
        }
    }
}

/**
 * Closes the video player and resets the UI.
 */
function closeVideoPlayer() {
    // Stop player
    if (window.player) {
        window.player.pause();
        window.player.destroy();
        window.player = null;
    }

    // 1. Remove Player Wrapper
    const wrapper = document.getElementById('video-wrapper');
    if (wrapper) {
        wrapper.remove();
    }

    // 2. Reset Banner Styles
    const banner = document.getElementById('movie-banner');
    if (banner) {
        banner.classList.remove('video-mode');
        banner.style.display = '';
    }

    // ⭐ 3. HIDE NOW PLAYING BAR - Force Hide
    const npBar = document.getElementById('now-playing-bar');
    if (npBar) {
        npBar.style.display = 'none';
        npBar.style.visibility = 'hidden';
        npBar.style.opacity = '0';
    }

    // 4. Reset Body Scroll
    document.body.classList.remove('player-active');
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.overflow = '';

    // 5. Scroll to Top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/* ============================================================
   RESPONSIVE PLAYER RESIZE HANDLER
   ============================================================ */
let resizeTimer;

window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    
    resizeTimer = setTimeout(function() {
        const banner = document.getElementById('movie-banner');
        const videoWrapper = document.getElementById('video-wrapper');
        const nowPlayingBar = document.getElementById('now-playing-bar');
        
        // Video mode එකේ තිබ්බොත්
        if (banner && banner.classList.contains('video-mode')) {
            
            // Body lock maintain කරන්න
            document.body.classList.add('player-active');
            
            // Now Playing Bar එක mobile එකේදී විතරක් show කරන්න
            if (nowPlayingBar) {
                if (window.innerWidth <= 768) {
                    nowPlayingBar.style.display = 'flex';
                    nowPlayingBar.style.visibility = 'visible';
                    nowPlayingBar.style.opacity = '1';
                } else {
                    nowPlayingBar.style.display = 'none';
                    nowPlayingBar.style.visibility = 'hidden';
                    nowPlayingBar.style.opacity = '0';
                }
            }
            
            // Player එක update කරන්න
            if (window.player && videoWrapper) {
                const video = videoWrapper.querySelector('video');
                if (video) {
                    const resizeEvent = new Event('resize');
                    window.dispatchEvent(resizeEvent);
                }
            }
        }
    }, 250);
});

/* ============================================================
   ORIENTATION CHANGE HANDLER (Mobile) - UPDATED
   ============================================================ */
window.addEventListener('orientationchange', function() {
    const banner = document.getElementById('movie-banner');
    const nowPlayingBar = document.getElementById('now-playing-bar');
    
    if (banner && banner.classList.contains('video-mode')) {
        setTimeout(function() {
            // Always re-show bar on mobile after orientation change
            if (nowPlayingBar && window.innerWidth <= 768) {
                nowPlayingBar.style.display = 'flex';
                nowPlayingBar.style.visibility = 'visible';
                nowPlayingBar.style.opacity = '1';
                nowPlayingBar.style.position = 'fixed';
                nowPlayingBar.style.bottom = '0';
                nowPlayingBar.style.zIndex = '2147483646';
                
                console.log('Now Playing Bar restored after orientation change');
            }
        }, 300);
    }
});

// ⭐ NEW: Screen Resize එකක් detection කරලා bar එක maintain කරන්න
let fullscreenCheckInterval;

function monitorNowPlayingBar() {
    const banner = document.getElementById('movie-banner');
    const nowPlayingBar = document.getElementById('now-playing-bar');
    
    if (banner && banner.classList.contains('video-mode') && window.innerWidth <= 768) {
        if (nowPlayingBar) {
            // Force bar එක visible කරන්න if hidden
            if (nowPlayingBar.style.display === 'none' || nowPlayingBar.style.visibility === 'hidden') {
                nowPlayingBar.style.display = 'flex';
                nowPlayingBar.style.visibility = 'visible';
                nowPlayingBar.style.opacity = '1';
            }
        }
    }
}

// Start monitoring when player opens
document.addEventListener('DOMContentLoaded', function() {
    // Monitor bar visibility every 500ms when player is active
    setInterval(function() {
        const banner = document.getElementById('movie-banner');
        if (banner && banner.classList.contains('video-mode')) {
            monitorNowPlayingBar();
        }
    }, 500);
});

/* ============================================================
   PAGE LOAD - ENSURE BAR IS HIDDEN INITIALLY
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    const nowPlayingBar = document.getElementById('now-playing-bar');
    
    // Initial state - Always hidden
    if (nowPlayingBar) {
        nowPlayingBar.style.display = 'none';
        nowPlayingBar.style.visibility = 'hidden';
        nowPlayingBar.style.opacity = '0';
    }
});

/* ============================================================
   USER GUIDE MODAL FUNCTIONS
   ============================================================ */

function openGuideModal() {
    const modal = document.getElementById('guide-modal-overlay');
    if (modal) {
        modal.style.display = 'flex';
        switchGuideTab('watch');
    }
}

function closeGuideModal() {
    const modal = document.getElementById('guide-modal-overlay');
    if (modal) {
        modal.style.display = 'none';
    }
}

function switchGuideTab(tabName) {
    document.querySelectorAll('.guide-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.guide-tab').forEach(el => el.classList.remove('active'));
    document.getElementById('guide-content-' + tabName).classList.add('active');
    
    const buttons = document.querySelectorAll('.guide-tab');
    if(tabName === 'watch') buttons[0].classList.add('active');
    if(tabName === 'direct') buttons[1].classList.add('active');
    if(tabName === 'telegram') buttons[2].classList.add('active');
}

// Close when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('guide-modal-overlay');
    if(modal) {
        modal.addEventListener('click', function(e) {
            if(e.target === modal) closeGuideModal();
        });
    }
});