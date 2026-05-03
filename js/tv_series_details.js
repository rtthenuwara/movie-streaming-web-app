// ==================================================================
// ==           TV SERIES DETAILS - TAB SWITCHING LOGIC            ==
// ==================================================================

document.addEventListener('DOMContentLoaded', () => {
    const tabContainer = document.querySelector('.season-tabs');
    if (tabContainer) {
        const tabButtons = tabContainer.querySelectorAll('.season-tab-btn');
        const episodeLists = document.querySelectorAll('.episode-list');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSeasonId = button.dataset.seasonId;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                episodeLists.forEach(list => list.classList.remove('active'));
                button.classList.add('active');
                const targetList = document.getElementById(`season-${targetSeasonId}`);
                if (targetList) {
                    targetList.classList.add('active');
                }
            });
        });
    }

    // ⭐ Initial state - Hide Now Playing Bar
    const nowPlayingBar = document.getElementById('now-playing-bar');
    if (nowPlayingBar) {
        nowPlayingBar.style.display = 'none';
        nowPlayingBar.style.visibility = 'hidden';
        nowPlayingBar.style.opacity = '0';
    }
});

// ==================================================================
// ==           TV SERIES - VIDEO PLAYER LOGIC                     ==
// ==================================================================

/**
 * Wrapper function called by the onclick attribute.
 */
function handlePlayEpisode(element) {
    const episodeLink = element.getAttribute('data-link');
    const subtitlesDataJson = element.getAttribute('data-subs');
    const episodeId = element.getAttribute('data-id');

    const seasonName = element.getAttribute('data-season-name');
    const epName = element.getAttribute('data-ep-name');
    const epTitle = element.getAttribute('data-ep-title');

    const hasAccess = true;

    if (!episodeLink) {
        console.error("Episode link not found.");
        return;
    }

    if (episodeId && typeof updateViewCount === 'function') {
        updateViewCount(episodeId, 'episode');
    }

    // ⭐ HIGHLIGHT LOGIC

    // 1. කලින් Active වෙලා තිබුන එක්කොම අයින් කරනවා
    document.querySelectorAll('.episode-item').forEach(item => {
        item.classList.remove('playing-active');
        if (item.dataset.originalHtml) {
            item.innerHTML = item.dataset.originalHtml;
        }
    });

    // 2. දැන Click කරපු එක Highlight කරනවා
    element.classList.add('playing-active');

    // Main play function එකට විස්තර පාස් කරනවා
    playEpisode(episodeLink, hasAccess, subtitlesDataJson, seasonName, epName, epTitle, episodeId);
}

/**
 * Plays episode in the MAIN BANNER area with Now Playing Info
 */
async function playEpisode(episodeLink, hasAccess, subtitlesDataJson, seasonName, epName, epTitle, episodeId) {

    try {
        // 1. Get Saved Time from Server (Sync Logic)
        let response = await fetch(`get_watch_progress.php?id=${episodeId}&type=episode`);
        let data = await response.text();
        savedPlaybackTime = parseFloat(data); // Update global variable
        console.log(`Synced Time for Episode ${episodeId}: ${savedPlaybackTime}`);
    } catch (error) {
        console.error("Error syncing episode progress:", error);
        savedPlaybackTime = 0;
    }

    // 2. PREVENT DUPLICATE PLAYERS
    const existingWrapper = document.getElementById('video-wrapper');
    if (existingWrapper) {
        if (window.player) {
            window.player.destroy();
            window.player = null;
        }
        existingWrapper.remove();
        const banner = document.querySelector('#movie-banner');
        if (banner) {
            banner.classList.remove('video-mode');
        }
    }

    if (hasAccess) {
        const banner = document.querySelector('#movie-banner'); // Note: Check if ID is correct for TV series page
        if (!banner) return;

        banner.classList.add('video-mode');
        document.body.classList.add('player-active');

        // Parse Subtitles
        let trackElementsHTML = '';
        let hasDefaultSubtitle = false;
        try {
            const decodeHtml = (html) => {
                var txt = document.createElement("textarea");
                txt.innerHTML = html;
                return txt.value;
            };
            if (subtitlesDataJson) {
                const availableSubtitles = JSON.parse(decodeHtml(subtitlesDataJson));
                if (Array.isArray(availableSubtitles)) {
                    availableSubtitles.forEach(sub => {
                        if (sub.kind && sub.label && sub.srclang && sub.src) {
                            const isDefault = sub.srclang === 'si';
                            if (isDefault) hasDefaultSubtitle = true;
                            trackElementsHTML += `<track kind="${sub.kind}" label="${sub.label}" srclang="${sub.srclang}" src="${sub.src}" ${isDefault ? 'default' : ''}>`;
                        }
                    });
                }
            }
        } catch (e) { console.error("Subtitle error", e); }

        const safeEpisodeLink = episodeLink.replace(/"/g, '&quot;');

        let videoPlayerHTML = `
            <div id="video-wrapper">
                <button class="inner-close-btn" id="player-close-btn">
                    <i class="fas fa-times"></i>
                </button>

                <video id="plyr-player" controls crossorigin playsinline poster="images/plexzone-logo-2.png">
                    <source src="${safeEpisodeLink}" type="video/mp4">
                    ${trackElementsHTML}
                </video>
            </div>
        `;

        banner.insertAdjacentHTML('beforeend', videoPlayerHTML);

        // Update Now Playing Bar (Ensure this function handles args)
        if (typeof showNowPlayingBar === 'function') {
            showNowPlayingBar(seasonName, epName, epTitle); 
        }

        setTimeout(() => {
            const wrapper = document.getElementById('video-wrapper');
            if (wrapper) {
                wrapper.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
        }, 500);

        // Initialize Plyr
        try {
            const player = new Plyr('#plyr-player', {
                captions: { active: hasDefaultSubtitle, language: hasDefaultSubtitle ? 'si' : 'auto', update: true },
                ratio: '16:9',
                fullscreen: { enabled: true, fallback: true, iosNative: true }
            });

            window.player = player;

            // ⭐ MISSING PART ADDED: RESUME LOGIC ⭐
            player.on('ready', event => {
                if (typeof savedPlaybackTime !== 'undefined' && savedPlaybackTime > 10) {
                    const resumeModal = document.getElementById('resume-modal-overlay');
                    const timeDisplay = document.getElementById('resume-time-display');
                    const btnYes = document.getElementById('btn-resume-yes');
                    const btnNo = document.getElementById('btn-resume-no');

                    if(resumeModal && timeDisplay) {
                        timeDisplay.innerText = new Date(savedPlaybackTime * 1000).toISOString().substr(11, 8);
                        resumeModal.style.display = 'flex';

                        // RESUME
                        btnYes.onclick = function() {
                            resumeModal.style.display = 'none';
                            var playPromise = player.play();
                            if (playPromise !== undefined) {
                                playPromise.then(_ => { player.currentTime = savedPlaybackTime; })
                                .catch(error => { player.currentTime = savedPlaybackTime; });
                            }
                        };

                        // START OVER
                        btnNo.onclick = function() {
                            player.currentTime = 0;
                            savedPlaybackTime = 0;
                            
                            // Reset Server Side
                            const formData = new FormData();
                            formData.append('id', episodeId); // Use episodeId
                            formData.append('type', 'episode');
                            formData.append('action', 'reset');
                            // Call your save/reset PHP if you have logic for it, or just let the next auto-save handle it
                            // fetch('save_watch_progress.php', { method: 'POST', body: formData });

                            player.play();
                            resumeModal.style.display = 'none';
                        };
                    }
                }
            });
            // ⭐ END OF ADDED PART ⭐


            // FORCE LANDSCAPE ON FULLSCREEN
            player.on('enterfullscreen', () => {
                try {
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape').catch((e) => {});
                    }
                } catch (e) {}

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

            // UNLOCK ORIENTATION ON EXIT
            player.on('exitfullscreen', () => {
                try {
                    if (screen.orientation && screen.orientation.unlock) {
                        screen.orientation.unlock();
                    }
                } catch (e) {}

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

            // Auto Save Interval
            window.saveInterval = setInterval(() => {
                if (player.playing && player.currentTime > 0) {
                    if (typeof saveWatchProgress === 'function') {
                         // Ensure saveWatchProgress uses 'episode' type
                         saveWatchProgress(episodeId, 'episode', player.currentTime);
                    }
                }
            }, 10000);

            // Close Button
            const closeBtn = document.getElementById('player-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', function () {
                    // Save on close
                    if(player.currentTime > 0) {
                        saveWatchProgress(episodeId, 'episode', player.currentTime);
                    }
                    closeVideoPlayer();
                });
            }

        } catch (e) { console.error("Plyr Init Error:", e); }

    } else {
        window.location.href = 'pricing';
    }
}

/**
 * ⭐ SHOW NOW PLAYING BAR (TV Series - Only on Mobile)
 */
function showNowPlayingBar(seasonName, epName, epTitle) {
    const nowPlayingBar = document.getElementById('now-playing-bar');
    const banner = document.getElementById('movie-banner');

    if (nowPlayingBar && banner) {
        // Update title with season and episode info
        const titleElement = nowPlayingBar.querySelector('.np-title');
        if (titleElement) {
            titleElement.textContent = `${seasonName} | ${epName}`;
        }

        // Show bar only on mobile AND only when video mode is active
        if (window.innerWidth <= 768 && banner.classList.contains('video-mode')) {
            nowPlayingBar.style.display = 'flex';
            nowPlayingBar.style.visibility = 'visible';
            nowPlayingBar.style.opacity = '1';
            nowPlayingBar.style.position = 'fixed';
            nowPlayingBar.style.bottom = '0';
            nowPlayingBar.style.zIndex = '2147483646';
        }
    }
}

/**
 * ⭐ UPDATED: Close Video Player with Episode Bar Reset
 */
function closeVideoPlayer() {
    // Stop player
    if (window.player) {
        window.player.pause();
        window.player.destroy();
        window.player = null;
    }

    const wrapper = document.getElementById('video-wrapper');
    if (wrapper) wrapper.remove();

    const banner = document.getElementById('movie-banner');
    if (banner) {
        banner.classList.remove('video-mode');
        banner.style.display = '';
    }

    // ⭐ Hide Now Playing Bar - Force Hide
    const npBar = document.getElementById('now-playing-bar');
    if (npBar) {
        npBar.style.display = 'none';
        npBar.style.visibility = 'hidden';
        npBar.style.opacity = '0';
    }

    // ⭐ Reset Episode Highlighting - Remove playing-active from all episodes
    document.querySelectorAll('.episode-item').forEach(item => {
        item.classList.remove('playing-active');
    });

    document.body.classList.remove('player-active');
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.overflow = '';

    if (window.saveInterval) clearInterval(window.saveInterval);

    // ⭐ UPDATED: Scroll back to episode list smoothly
    setTimeout(() => {
        const episodeSection = document.querySelector('.episode-section-container');
        if (episodeSection) {
            episodeSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            // Fallback: scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, 300);
}

/* ============================================================
   RESPONSIVE PLAYER RESIZE HANDLER
   ============================================================ */
let resizeTimer;

window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {
        const banner = document.getElementById('movie-banner');
        const videoWrapper = document.getElementById('video-wrapper');
        const nowPlayingBar = document.getElementById('now-playing-bar');

        if (banner && banner.classList.contains('video-mode')) {
            document.body.classList.add('player-active');

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
   MONITOR NOW PLAYING BAR - TV Series Version
   ============================================================ */
function monitorNowPlayingBar() {
    const banner = document.getElementById('movie-banner');
    const nowPlayingBar = document.getElementById('now-playing-bar');

    if (banner && banner.classList.contains('video-mode') && window.innerWidth <= 768) {
        if (nowPlayingBar && nowPlayingBar.style.display === 'none') {
            nowPlayingBar.style.display = 'flex';
            nowPlayingBar.style.visibility = 'visible';
            nowPlayingBar.style.opacity = '1';
            nowPlayingBar.style.position = 'fixed';
            nowPlayingBar.style.bottom = '0';
            nowPlayingBar.style.zIndex = '2147483646';
        }
    }
}

// Monitor bar visibility constantly
setInterval(function () {
    const banner = document.getElementById('movie-banner');
    if (banner && banner.classList.contains('video-mode') && window.innerWidth <= 768) {
        monitorNowPlayingBar();
    }
}, 300);

/* ============================================================
   SCROLL EVENT HANDLER
   ============================================================ */
let scrollTimeout;
window.addEventListener('scroll', function () {
    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(function () {
        const banner = document.getElementById('movie-banner');
        if (banner && banner.classList.contains('video-mode') && window.innerWidth <= 768) {
            monitorNowPlayingBar();
        }
    }, 100);
});

/* ============================================================
   ORIENTATION CHANGE HANDLER
   ============================================================ */
window.addEventListener('orientationchange', function () {
    const banner = document.getElementById('movie-banner');
    const nowPlayingBar = document.getElementById('now-playing-bar');

    if (banner && banner.classList.contains('video-mode')) {
        setTimeout(function () {
            if (nowPlayingBar && window.innerWidth <= 768) {
                nowPlayingBar.style.display = 'flex';
                nowPlayingBar.style.visibility = 'visible';
                nowPlayingBar.style.opacity = '1';
                nowPlayingBar.style.position = 'fixed';
                nowPlayingBar.style.bottom = '0';
                nowPlayingBar.style.left = '0';
                nowPlayingBar.style.right = '0';
                nowPlayingBar.style.zIndex = '2147483646';
            }
        }, 500);
    }
});

/* ============================================================
   TOUCH EVENT HANDLERS
   ============================================================ */
document.addEventListener('touchstart', function () {
    const banner = document.getElementById('movie-banner');
    if (banner && banner.classList.contains('video-mode') && window.innerWidth <= 768) {
        setTimeout(() => {
            monitorNowPlayingBar();
        }, 100);
    }
});

document.addEventListener('touchend', function () {
    const banner = document.getElementById('movie-banner');
    if (banner && banner.classList.contains('video-mode') && window.innerWidth <= 768) {
        setTimeout(() => {
            monitorNowPlayingBar();
        }, 100);
    }
});

/* ============================================================
   VISIBILITY CHANGE HANDLER
   ============================================================ */
document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
        const banner = document.getElementById('movie-banner');
        if (banner && banner.classList.contains('video-mode') && window.innerWidth <= 768) {
            setTimeout(() => {
                monitorNowPlayingBar();
            }, 200);
        }
    }
});