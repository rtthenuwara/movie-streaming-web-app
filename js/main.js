// ==================================================================
// ==                 PLEXZONE GLOBAL JAVASCRIPT                   ==
// ==================================================================

// 1. Define Constants at the very top
const DIRECT_AD_LINK = "ok";

document.addEventListener('DOMContentLoaded', function () {

    // --- Setup for the LOGIN PAGE ---
    if (document.body.classList.contains('form-page-bg')) {
        setupLoginPage();
    }

    // --- Setup for the MAIN PAGE (index.php) ---
    const trendingCarousel = document.querySelector('.trending-carousel');
    if (trendingCarousel) {
        // (Add your functions for the main page here, e.g., loadTrendingMovies())
    }

    // --- Setup for the FOOTER (Global) ---
    const footerYear = document.getElementById('current-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
});

function isAdEnabled() {
    // PHP වලින් එවන window.showAds variable එක check කරනවා
    return (typeof window.showAds !== 'undefined' && window.showAds === true);
}

/**
 * Initializes all functionality for the Login/Register page.
 */
function setupLoginPage() {
    // 1. Form Switcher Logic
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');
    const showRegisterLink = document.querySelector('#show-register');
    const showLoginLink = document.querySelector('#show-login');

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        });
    }

    // 2. Creative Background Image Loader
    const bgGrid = document.getElementById('bg-grid');
    if (bgGrid) {
        const posterUrls = [
            'https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg', 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', 'https://image.tmdb.org/t/p/w500/uJYYeQagKKQucGjoWp0g9VnmE0.jpg', 'https://image.tmdb.org/t/p/w500/7WsyChQLEftloC9zhU8tNsJkaDs.jpg', 'https://image.tmdb.org/t/p/w500/lJA2RCMfsWoskqlQhXPSLFQGXEJ.jpg', 'https://image.tmdb.org/t/p/w500/s9YTxwaByYeoSqugYjG8VEWWd3H.jpg', 'https://image.tmdb.org/t/p/w500/xOMo8BRK7PfcJv9JCnx7s5NJ02l.jpg', 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg'
        ];
        for (let i = 0; i < 50; i++) {
            const item = document.createElement('div');
            item.className = 'poster-item';
            item.style.backgroundImage = `url(${posterUrls[i % posterUrls.length]})`;
            bgGrid.appendChild(item);
        }
    }

    // 3. Real-time Password Strength Validator
    const passwordInput = document.getElementById('reg-password');
    const indicator = document.getElementById('password-strength-indicator');
    if (passwordInput && indicator) {
        const criteria = {
            length: document.getElementById('length'),
            lowercase: document.getElementById('lowercase'),
            uppercase: document.getElementById('uppercase'),
            number: document.getElementById('number'),
            symbol: document.getElementById('symbol')
        };
        passwordInput.addEventListener('focus', () => { indicator.style.display = 'grid'; });
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            validateCriterion(criteria.length, password.length >= 8);
            validateCriterion(criteria.lowercase, /[a-z]/.test(password));
            validateCriterion(criteria.uppercase, /[A-Z]/.test(password));
            validateCriterion(criteria.number, /[0-9]/.test(password));
            validateCriterion(criteria.symbol, /[^A-Za-z0-9]/.test(password));
        });
    }
}

/**
 * AJAX function to handle user registration.
 */
function register() {
    const form = document.getElementById('register-form');
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';

    fetch('register_process.php', { method: 'POST', body: formData })
        .then(res => res.text())
        .then(data => {
            if (data.trim() === 'success') {
                showModal('Registration Successful!', 'Please check your email for the verification code. You will be redirected shortly.', true);
                // Redirect after a short delay so user can read the message
                setTimeout(() => {
                    window.location.href = `verification.php?email=${formData.get('email')}`;
                }, 3000); // 3-second delay
            } else {
                showModal('Registration Failed!', data, false); // Show error from PHP
                submitButton.disabled = false;
                submitButton.textContent = 'Register';
            }
        });
}

/**
 * AJAX function to handle user login.
 */
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const form = document.getElementById('login-form');
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    fetch('login_process.php', { method: 'POST', body: formData })
        .then(res => res.text())
        .then(data => {

            // ⭐ පිළිතුර කඩා ගන්නවා (success | url)
            const parts = data.trim().split('|');
            const status = parts[0];
            const redirectUrl = parts[1] || '/'; // URL එකක් නැත්නම් index එකට

            if (status === 'success') {
                // සාර්ථකයි නම් අදාල පිටුවට යවනවා
                window.location.href = redirectUrl;
            } else if (data.trim() === 'not_verified') {
                showModal('Verification Required!', 'Please verify your email address before logging in.', false);
                setTimeout(() => {
                    window.location.href = `verification.php?email=${email}`;
                }, 4000);
            } else {
                showModal('Login Failed!', data, false);
                submitButton.disabled = false;
                submitButton.textContent = 'Login';
            }
        });
}


/**
 * Toggles the visibility of a password field and changes the eye icon.
 * @param {HTMLElement} icon - The eye icon element that was clicked.
 */
function togglePasswordVisibility(icon) {
    const passwordField = icon.previousElementSibling;
    if (passwordField && passwordField.type) {
        if (passwordField.type === "password") {
            passwordField.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            passwordField.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    }
}

/**
 * Helper function for the password strength indicator.
 */
function validateCriterion(element, isValid) {
    if (element) {
        element.classList.toggle('valid', isValid);
    }
}

/**
 * Displays a custom-styled modal for success or error messages.
 * @param {string} title The title of the modal.
 * @param {string} message The message to display.
 * @param {boolean} isSuccess True for success style, false for error style.
 */
function showModal(title, message, isSuccess) {
    const modalOverlay = document.getElementById('custom-modal-overlay');
    const modalBox = document.getElementById('custom-modal-box');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const closeBtn = document.getElementById('modal-close-btn'); // Button එක අල්ලගන්නවා

    // 1. කලින් හංගලා තිබුනොත් ආයෙත් පෙන්නන්න (Reset State)
    if (closeBtn) {
        closeBtn.style.display = 'block';
    }

    modalTitle.textContent = title;
    modalMessage.innerHTML = message; // HTML වැඩ කරන්න මේක ඕන

    modalBox.className = isSuccess ? 'success' : 'error';

    modalOverlay.style.display = 'flex';
    setTimeout(() => {
        modalBox.style.transform = 'scale(1)';
        modalBox.style.opacity = '1';
    }, 50);
}

/**
 * Hides the custom message modal.
 */
function hideModal() {
    const modalOverlay = document.getElementById('custom-modal-overlay');
    const modalBox = document.getElementById('custom-modal-box');
    modalBox.style.transform = 'scale(0.9)';
    modalBox.style.opacity = '0';
    setTimeout(() => {
        modalOverlay.style.display = 'none';
    }, 300);
}

// Event listener for the custom modal close button
const modalCloseBtn = document.getElementById('modal-close-btn');
if(modalCloseBtn) modalCloseBtn.addEventListener('click', hideModal);

const customModalOverlay = document.getElementById('custom-modal-overlay');
if(customModalOverlay) {
    customModalOverlay.addEventListener('click', function (e) {
        if (e.target === this) {
            hideModal();
        }
    });
}

// ==================================================================
// ==             FORGOT PASSWORD & RESET LOGIC                    ==
// ==================================================================

/**
 * Shows the "Forgot Password" modal.
 */
function showForgotPasswordModal(event) {
    event.preventDefault();
    // 1. Element ටික function එක ඇතුළේදී select කරගැනීම
    const formContainer = document.querySelector('.form-container');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');

    if (formContainer) formContainer.style.display = 'none';
    if (forgotPasswordModal) forgotPasswordModal.style.display = 'block';
}

/**
 * Hides all modals, resets their forms, and shows the main login form.
 */
function closeAllModals() {
    // 1. Select all necessary elements
    const formContainer = document.querySelector('.form-container');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const resetPasswordModal = document.getElementById('reset-password-modal');

    // --- THE FIX: Select the FORMS inside the modals ---
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetPasswordForm = document.getElementById('reset-password-form');

    // 2. Hide the modals
    if (forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
        // Reset the FORM, not the modal div
        if (forgotPasswordForm) {
            forgotPasswordForm.reset();
        }
    }

    if (resetPasswordModal) {
        resetPasswordModal.style.display = 'none';
        // Reset the FORM, not the modal div
        if (resetPasswordForm) {
            resetPasswordForm.reset();
        }
    }

    // 3. Show the main login/register form container
    if (formContainer) {
        formContainer.style.display = 'block';
    }
}

/**
 * Sends the password reset code to the user's email.
 */
function sendResetCode(event) {
    event.preventDefault();
    // 3. Element ටික function එක ඇතුළේදී select කරගැනීම
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const resetPasswordModal = document.getElementById('reset-password-modal');
    const form = document.getElementById('forgot-password-form');
    const email = document.getElementById('forgot-email').value;
    const button = form.querySelector('button');

    button.disabled = true;
    button.textContent = 'Sending...';

    const formData = new FormData();
    formData.append('email', email);

    fetch('send_password_reset_code.php', { method: 'POST', body: formData })
        .then(res => res.text())
        .then(data => {
            if (data.trim() === 'success') {
                if (forgotPasswordModal) forgotPasswordModal.style.display = 'none';
                if (resetPasswordModal) resetPasswordModal.style.display = 'flex';
                document.getElementById('reset-email').value = email;
            } else {
                showModal('Error!', data, false);
            }
        })
        .finally(() => {
            button.disabled = false;
            button.textContent = 'Send Verification Code';
        });
}

/**
 * Resets the user's password using the code and new password.
 */
function resetPassword(event) {
    event.preventDefault();
    const form = document.getElementById('reset-password-form');
    const button = form.querySelector('button');
    const formData = new FormData(form);

    button.disabled = true;
    button.textContent = 'Resetting...';

    fetch('reset_password_process.php', { method: 'POST', body: formData })
        .then(res => res.text())
        .then(data => {
            if (data.trim() === 'success') {
                showModal('Success!', 'Your password has been reset successfully. You can now log in.', true);
                setTimeout(() => {
                    hideModal();
                    closeAllModals();
                }, 3000);
            } else {
                showModal('Error!', data, false);
            }
        })
        .finally(() => {
            button.disabled = false;
            button.textContent = 'Reset Password';
        });
}

// ==================================================================
// ==                 MY PROFILE PAGE LOGIC                        ==
// ==================================================================

// This runs when the page is loaded, to set up the profile page functionality
document.addEventListener('DOMContentLoaded', function () {
    const profilePage = document.querySelector('.profile-page');
    if (profilePage) {
        setupProfilePageTabs();
    }
});

/**
 * Initializes the tab switching functionality on the Profile Page.
 */
function setupProfilePageTabs() {
    const tabsContainer = document.querySelector('.profile-page .tabs');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-link')) {
                const tabId = event.target.dataset.tab;
                const tabLinks = tabsContainer.querySelectorAll('.tab-link');
                const tabContents = document.querySelectorAll('.profile-page .tab-content');

                tabLinks.forEach(link => link.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                event.target.classList.add('active');
                const activeTabContent = document.getElementById(tabId);
                if (activeTabContent) { activeTabContent.classList.add('active'); }
            }
        });
    }
}

/**
 * Handles the AJAX submission for changing the password.
 * This function is called by onsubmit="changePassword(event)" in the HTML form.
 */
function changePassword(event) {
    event.preventDefault();
    const form = document.getElementById('change-password-form');
    const formData = new FormData(form);
    const button = form.querySelector('button');

    button.disabled = true;
    button.textContent = 'Updating...';

    fetch('change_password_process.php', { method: 'POST', body: formData })
        .then(res => res.text())
        .then(data => {
            if (data.trim() === 'success') {
                showModal('Success!', 'Your password has been updated successfully.', true);
                form.reset();
            } else {
                showModal('Update Failed!', data, false); // Shows the specific error from PHP
            }
        })
        .catch(error => {
            console.error('Password change error:', error);
            showModal('Error!', 'An unexpected network error occurred.', false);
        })
        .finally(() => {
            button.disabled = false;
            button.textContent = 'Update Password';
        });
}

// ==================================================================
// ==                 RECEIPT IMAGE PREVIEW LOGIC                  ==
// ==================================================================

/**
 * Opens the image preview modal with the specified image source.
 * @param {string} imgSrc The source URL of the image to display.
 */
function openReceiptPreview(imgSrc) {
    const modal = document.getElementById("imagePreviewModal");
    const modalImg = document.getElementById("imgPreview");
    modal.style.display = "flex"; // Flexbox භාවිතයෙන් image එක මධ්‍යගත කරයි
    modalImg.src = imgSrc;
}

/**
 * Closes the image preview modal.
 */
function closeReceiptPreview() {
    const modal = document.getElementById("imagePreviewModal");
    modal.style.display = "none";
}

// Modal එකෙන් පිටත click කළ විට වසා දැමීමට
window.onclick = function (event) {
    const modal = document.getElementById("imagePreviewModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


// ==================================================
// ==            REQUEST MODAL LOGIC (FIXED)       ==
// ==================================================

/**
 * User ට access ඇත්දැයි බලා Modal එක open කිරීම
 * @param {boolean} hasAccess - PHP මගින් එවන අගය (true = paid sub)
 */
function openRequestModal(hasAccess) {
    if (event) event.preventDefault(); // <a> link එක click වීම නැවැත්වීම

    // Element එක Function එක ඇතුලේදී සොයාගන්න (එතකොට null වෙන්නෙ නෑ)
    const requestModalOverlay = document.getElementById('request-modal-overlay');

    if (hasAccess) {
        // Paid subscriber, modal එක පෙන්වීම
        if (requestModalOverlay) {
            requestModalOverlay.style.display = 'flex';
        }
    } else {
        // Trial or No subscription
        showModal(
            'Feature Locked',
            'This feature is available for paid subscribers only. Please upgrade your plan to make requests.',
            false
        );
    }
}

/**
 * Request modal එක වැසීම
 */
function closeRequestModal() {
    const requestModalOverlay = document.getElementById('request-modal-overlay');
    if (requestModalOverlay) {
        requestModalOverlay.style.display = 'none';
    }
}

/**
 * Form එක submit කිරීම (AJAX/Fetch)
 * @param {Event} event
 */
function submitRequest(event) {
    event.preventDefault(); // Form එක refresh වීම නැවැත්වීම

    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('#request-submit-btn');

    // Client-side validation
    const movieName = formData.get('name').trim();
    if (movieName.length < 3) {
        showModal('Validation Error', 'Please enter a valid movie or series name (at least 3 characters).', false);
        return;
    }

    // Button එක disable කිරීම
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    fetch('submit_request.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                closeRequestModal();
                form.reset();
                showModal('Success!', data.message, true);
            } else {
                showModal('Error', data.message, false);
            }
        })
        .catch(error => {
            showModal('Error', 'A network error occurred. Please try again.', false);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Request';
        });
}

// Event Listeners (HTML Load වුනාට පස්සේ Run වෙන්න දානවා)
document.addEventListener('DOMContentLoaded', function () {
    const requestCloseBtn = document.getElementById('request-close-btn');
    const requestModalOverlay = document.getElementById('request-modal-overlay');

    // Close Button එකට
    if (requestCloseBtn) {
        requestCloseBtn.addEventListener('click', closeRequestModal);
    }

    // අඳුරු background එක click කළ විට වැසීම
    if (requestModalOverlay) {
        requestModalOverlay.addEventListener('click', function (event) {
            if (event.target === requestModalOverlay) {
                closeRequestModal();
            }
        });
    }
});


// ==================================================================
// ==             CONTACT PAGE - FORM SUBMISSION LOGIC             ==
// ==================================================================

/**
 * Handles the AJAX submission for the contact form.
 * (මෙය contact.php හි onsubmit="" මගින් call කරයි)
 * @param {Event} event
 */
function submitContactForm(event) {
    event.preventDefault(); // Page refresh වීම නැවැත්වීම

    const form = document.getElementById('contact-form');
    const button = document.getElementById('contact-submit-btn');
    const formData = new FormData(form);

    // Client-side validation (Basic)
    const message = formData.get('message').trim();
    if (message.length < 10) {
        showModal('Error', 'Message must be at least 10 characters long.', false);
        return;
    }

    button.disabled = true;
    button.textContent = 'Sending...';

    fetch('send_message_process.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // සාර්ථකයි!
                showModal('Success!', data.message, true);
                form.reset(); // Form එක clear කිරීම

            } else {
                // Error (PHP එකෙන් එවන ඕනෑම error එකක්)
                showModal('Error', data.message, false);
            }
        })
        .catch(error => {
            // Network error
            showModal('Error', 'A network error occurred. Please try again.', false);
        })
        .finally(() => {
            // Button එක නැවත enable කිරීම
            button.disabled = false;
            button.textContent = 'Send Message';
        });
}

// ==================================================================
// ==          UPGRADE PROMPT MODAL FUNCTION (NEW)                 ==
// ==================================================================

/**
 * Shows a modal prompting the user to upgrade to the Premium plan 
 * when trying to access 1080p content without the required subscription.
 */
function promptUpgradeToPremium() {
    // 1. පණිවිඩය ඇතුලෙම ලස්සනට Layout එක හදනවා
    const message = `
        <div style="text-align: center;">
            <p style="margin-bottom: 20px; color: #ccc;">
                This feature is available for <b>Basic & Premium</b> users only.<br>
                Please upgrade your plan to unlock downloads.
            </p>
            
            <button class="cta-button" style="width: 100%; padding: 12px; margin-bottom: 15px; font-size: 1rem;" onclick="window.location.href='pricing'">
                <i class="fas fa-crown"></i> Get Upgrade
            </button>
            
            <a href="javascript:void(0)" onclick="hideModal()" 
               style="color: #666; font-size: 0.85rem; text-decoration: none; border-bottom: 1px dotted #666; transition: 0.3s;">
               Maybe Later
            </a>
        </div>
    `;

    // 2. Modal එක පෙන්වනවා
    showModal(
        'Upgrade Required',
        message,
        false
    );

    // 3. ⭐️ Default 'OK' Button එක හංගනවා ⭐️
    const defaultBtn = document.getElementById('modal-close-btn');
    if (defaultBtn) {
        defaultBtn.style.display = 'none';
    }
}

// ==================================================
// ==          TRAILER MODAL LOGIC (NEW)           ==
// ==================================================

/**
 * Opens the trailer modal and embeds the video.
 * Converts YouTube links to embeddable, autoplaying links.
 * @param {string} videoLink - The original URL of the trailer.
 */
function openTrailerModal(videoLink) {
    const overlay = document.getElementById('trailer-modal-overlay');
    const videoContainer = document.getElementById('trailer-video-container');

    if (!overlay || !videoContainer) {
        console.error('Trailer modal elements not found!');
        return;
    }

    // --- Convert YouTube link to embeddable link ---
    let embedLink = videoLink;

    try {
        if (videoLink.includes("youtube.com/watch?v=")) {
            const videoId = new URL(videoLink).searchParams.get('v');
            embedLink = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        } else if (videoLink.includes("youtu.be/")) {
            const videoId = new URL(videoLink).pathname.substring(1);
            embedLink = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        }
    } catch (e) {
        console.error("Error parsing trailer URL:", e);
        // Use original link if parsing fails
        embedLink = videoLink;
    }

    // Create iframe
    videoContainer.innerHTML = `
        <iframe 
            src="${embedLink}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>`;

    // Show modal (display: flex)
    overlay.style.display = 'flex';
}

/**
 * Closes the trailer modal and stops the video from playing.
 */
function closeTrailerModal() {
    const overlay = document.getElementById('trailer-modal-overlay');
    const videoContainer = document.getElementById('trailer-video-container');

    if (overlay) {
        overlay.style.display = 'none';
    }
    if (videoContainer) {
        // ⭐️ IMPORTANT: This stops the video from playing in the background
        videoContainer.innerHTML = '';
    }
}

/**
 * Updates view count for a movie or episode
 * @param {number} id - The ID of the movie or episode
 * @param {string} type - 'movie' or 'episode'
 */
function updateViewCount(id, type) {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('type', type);

    fetch('update_views.php', {
        method: 'POST',
        body: formData
    }).then(response => response.text())
        .then(data => console.log("View updated:", data))
        .catch(err => console.error("View update failed", err));
}

// ==================================================================
// ==                 PLEXZONE GLOBAL JAVASCRIPT                   ==
// ==================================================================

/**
 * Movie Card Click (Simple Ad + Redirect)
 * Home page cards සදහා
 */
function openAdAndNavigate(url) {
    if (isAdEnabled()) {
        // Ads Enabled: Open Ad -> Redirect
        window.open(DIRECT_AD_LINK, '_blank');
        if (url) {
            setTimeout(() => {
                window.location.href = url;
            }, 500);
        }
    } else {
        // Ads Disabled: Direct Redirect
        if (url) window.location.href = url;
    }
}

/**
 * Simple Ad + Action Callback
 */
function openAdAndAction(callback) {
    if (isAdEnabled()) {
        window.open(DIRECT_AD_LINK, '_blank');
    }
    // Callback runs immediately (or after ad open)
    if (typeof callback === 'function') {
        callback();
    }
}

/**
 * 3-Step Ad Countdown Logic for Watch & Download Buttons
 * Used for generic buttons that need multiple ad views
 */
function startAdCountdown(btnElement, finalAction, finalLabel = "Access Now") {

    if (!isAdEnabled()) {
        // Ads Disabled (Premium/Basic): Run action immediately without countdown
        if (typeof finalAction === 'function') {
            finalAction();
        }
        return;
    }

    if (!btnElement.dataset.step) {
        btnElement.dataset.step = "0";
    }

    let step = parseInt(btnElement.dataset.step);
    const TOTAL_AD_STEPS = 3; 

    // --- AD STEPS (0, 1, 2) ---
    if (step < TOTAL_AD_STEPS) {
        window.open(DIRECT_AD_LINK, '_blank');

        btnElement.disabled = true;
        btnElement.style.opacity = "0.7";
        btnElement.style.cursor = "wait";

        let seconds = 5; 

        btnElement.innerHTML = `<i class="fas fa-clock"></i> Please Wait... ${seconds}s`;

        let timer = setInterval(() => {
            seconds--;
            if (seconds > 0) {
                btnElement.innerHTML = `<i class="fas fa-clock"></i> Please Wait... ${seconds}s`;
            } else {
                clearInterval(timer);
                step++; 
                btnElement.dataset.step = step;

                btnElement.disabled = false;
                btnElement.style.opacity = "1";
                btnElement.style.cursor = "pointer";

                if (step < TOTAL_AD_STEPS) {
                    btnElement.innerHTML = `<i class="fas fa-sync-alt"></i> Try Again (${step}/${TOTAL_AD_STEPS})`;
                } else {
                    btnElement.innerHTML = `<i class="fas fa-check-circle"></i> ${finalLabel}`;
                    btnElement.classList.add('glow-button'); 
                }
            }
        }, 1000);

    } else {
        // --- FINAL STEP: Action ---
        if (typeof finalAction === 'function') {
            finalAction();
        }
    }
}

// ==========================================
// DIRECT LINK AD LOGIC (Button Restore Fix)
// ==========================================

window.pendingAdCallback = null;
window.adCheckListener = null;
window.adTimerInterval = null;

// Helper: Close Modal
function closeAdTimerModal() {
    const overlay = document.getElementById('ad-timer-modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Helper: Update Modal UI
function updateAdModal(type, title, message, showBtn) {
    const overlay = document.getElementById('ad-timer-modal-overlay');
    const iconEl = document.getElementById('ad-modal-icon');
    const titleEl = document.getElementById('ad-modal-title');
    const msgEl = document.getElementById('ad-modal-message');
    const btnEl = document.getElementById('ad-modal-btn');
    const barEl = document.getElementById('ad-progress-bar');

    if (!overlay) return;

    overlay.style.display = 'flex';
    titleEl.textContent = title;
    msgEl.innerHTML = message;

    if (type === 'wait') {
        iconEl.textContent = '⏳';
        titleEl.style.color = '#fff';
        if(barEl && barEl.parentElement) barEl.parentElement.style.display = 'block';
    } else if (type === 'error') {
        iconEl.textContent = '⚠️';
        titleEl.style.color = '#ff4444';
        if(barEl && barEl.parentElement) barEl.parentElement.style.display = 'none';
    } else if (type === 'success') {
        iconEl.textContent = '✅';
        titleEl.style.color = '#00c853';
        if(barEl && barEl.parentElement) barEl.parentElement.style.display = 'none';
    }

    if (showBtn) {
        btnEl.style.display = 'inline-block';
        btnEl.onclick = closeAdTimerModal; 
    } else {
        btnEl.style.display = 'none';
    }
}

// 3. App/Browser Callback Logic
window.onAdClosedInApp = function(status) {
    // Reset Buttons & Episode Items (Restore Original Text)
    // ⭐ FIX: .episode-item පන්තියත් මෙතනට එකතු කළා
    const btns = document.querySelectorAll('.cta-button, .episode-item'); 
    
    btns.forEach(btn => {
        // අපි Disabled කරපු Button එක හොයාගන්නවා
        if(btn.style.pointerEvents === 'none') {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
            
            // කලින් Save කරපු නම තියෙනවා නම් ඒක දානවා (Button Restore)
            if (btn.dataset.originalHtml) {
                btn.innerHTML = btn.dataset.originalHtml;
            } else {
                // Default fallback (Playing Now එක අයින් කරන්න)
                btn.classList.remove('playing-active');
            }
        }
    });

    if (status === 'success') {
        if (!window.ReactNativeWebView) {
            updateAdModal('success', 'Verification Success!', 'Enjoy the episode!', false);
            setTimeout(() => { closeAdTimerModal(); }, 1500);
        }
        if (window.pendingAdCallback) {
            window.pendingAdCallback(); 
            window.pendingAdCallback = null; 
        }
    } else {
        if (!window.ReactNativeWebView) {
             updateAdModal('error', 'Verification Failed!', 'You closed the ad too early.<br>Please watch the ad to unlock.', true);
        }
    }
};

// 4. Main Function to Start Process
function startSmartAdProcess(element, onAdCompletedCallback) {
    window.pendingAdCallback = onAdCompletedCallback;
    var directAdLink = "https://plexzone.lk/ok?t=" + new Date().getTime();

    // UI Update (Loading)
    if(element) {
        // ⭐ FIX: Button එකේ දැනට තියෙන නම Save කරගන්නවා (Attribute එකක් විදිහට)
        if (!element.dataset.originalHtml) {
            element.dataset.originalHtml = element.innerHTML;
        }

        element.style.pointerEvents = 'none';
        element.style.opacity = '0.7';
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    }

    // --- APP LOGIC ---
    if(window.ReactNativeWebView) {
        window.location.href = directAdLink;
    } 
    // --- BROWSER LOGIC ---
    else {
        window.open(directAdLink, '_blank');

        // Timer Setup
        var waitTime = 8;
        var startTime = Date.now();
        var endTime = startTime + (waitTime * 1000);

        updateAdModal('wait', 'Verifying Ad...', `Please wait on the ad page for<br><span style="color:#00c8ff;font-weight:bold;font-size:24px;">${waitTime}</span> seconds.`, false);

        if(window.adTimerInterval) clearInterval(window.adTimerInterval);
        
        window.adTimerInterval = setInterval(() => {
            var now = Date.now();
            var remaining = Math.ceil((endTime - now) / 1000);
            
            var elapsed = waitTime - remaining;
            var progress = (elapsed / waitTime) * 100;
            if (progress > 100) progress = 100;

            const countSpan = document.getElementById('ad-timer-count');
            const barEl = document.getElementById('ad-progress-bar');
            
            if(countSpan) countSpan.textContent = remaining > 0 ? remaining : 0;
            if(barEl) barEl.style.width = progress + "%";

            if (remaining <= 0) {
                clearInterval(window.adTimerInterval);
                updateAdModal('wait', 'Almost There!', 'Please return to this tab to start the movie.', false);
            }
        }, 200);

        if(window.adCheckListener) window.removeEventListener('focus', window.adCheckListener);

        window.adCheckListener = function() {
            var now = Date.now();
            if (now >= endTime) {
                clearInterval(window.adTimerInterval);
                window.onAdClosedInApp('success');
            } else {
                clearInterval(window.adTimerInterval);
                window.onAdClosedInApp('canceled');
            }
            window.removeEventListener('focus', window.adCheckListener);
            window.adCheckListener = null;
        };

        window.addEventListener('focus', window.adCheckListener);
    }
}

// Progress Save කරන Function එක
function saveWatchProgress(id, type, time) {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('type', type);
    formData.append('time', time);

    fetch('save_watch_progress.php', {
        method: 'POST',
        body: formData
    }).catch(err => console.error("Save progress failed", err));
}

// Time Format (Helper)
function formatTime(seconds) {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
}