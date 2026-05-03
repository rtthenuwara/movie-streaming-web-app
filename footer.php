<?php
// ==========================================
// PLEXZONE AI - ADVANCED BRAIN (VERSION 2.0)
// ==========================================

// 1. SESSION & CONFIGURATION
session_start();

// USER IDENTIFICATION (PERSONALIZATION)
$userName = "Guest";
if (isset($_SESSION['user']) && isset($_SESSION['user']['first_name'])) {
    $userName = htmlspecialchars($_SESSION['user']['first_name']); // User ගේ නම ගැනීම
}
?>

<footer class="main-footer">
    <div class="footer-container">

        <div class="footer-column">
            <div class="logo-footer" onclick="window.location = 'index.php'" style="cursor: pointer;">
                <img src="images/plexzone-logo.png" alt="PlexZone Logo">
                <span>PlexZone</span>
            </div>
            <p>Your ultimate destination for unlimited movies, TV shows, and cinematic adventures. Dive into the world of entertainment.</p>
        </div>

        <div class="footer-column">
            <h3>Quick Links</h3>
            <ul>
                <li><a href="index">Home</a></li>
                <li><a href="movies">Movies</a></li>
                <li><a href="series">TV Shows</a></li>
                <li><a href="pricing">Subscription</a></li>
                <li class="app-only-visible">
                    <a href="app/Plexzone.lk.apk" style="color: var(--color-neon-blue); font-weight: bold;">
                        <i class="fab fa-android"></i> Download App
                    </a>
                </li>
            </ul>
        </div>

        <div class="footer-column">
            <h3>Support</h3>
            <ul>
                <li><a href="#" onclick="openPolicyModal('terms')">Terms of Service</a></li>
                <li><a href="#" onclick="openPolicyModal('privacy')">Privacy Policy</a></li>
                <li><a href="contact">Contact Us</a></li>
            </ul>
        </div>

        <div class="footer-column">
            <h3>Follow Us</h3>
            <div class="social-icons">
                <a href="https://www.facebook.com/share/17RkgkBdvw/"><i class="fab fa-facebook-f"></i></a>
                <a href="https://t.me/plexzoneofficial"><i class="fab fa-telegram"></i></a>
                <a href="https://www.tiktok.com/@plexzone.lk"><i class="fab fa-tiktok"></i></a>
                </div>
        </div>

    </div>
    <div class="footer-bottom">
        <p>&copy; <span id="current-year"></span> PlexZone. All Rights Reserved.</p>
    </div>
</footer>

<div id="policy-modal-overlay">
    <div id="policy-modal-box">
        <button id="policy-modal-close-btn" onclick="closePolicyModal()">
            <i class="fas fa-times"></i>
        </button>

        <h2 id="policy-modal-title"></h2>

        <div id="policy-modal-content">
        </div>
    </div>
</div>

<div id="trailer-modal-overlay">
    <div id="trailer-modal-box">
        <button id="trailer-modal-close-btn" onclick="closeTrailerModal()">
            <i class="fas fa-times"></i>
        </button>

        <div id="trailer-video-container">
        </div>
    </div>
</div>

<script>
    // ==================================================
    // ==       TERMS & PRIVACY MODAL LOGIC (NEW)      ==
    // ==================================================

    // Modal එකේ අන්තර්ගතය (Content)
    const policyContent = {
        terms: {
            title: "Terms of Service",
            content: `
            <p>Welcome to PLEXZONE. By accessing or using our service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
            
            <h3>1. Subscription</h3>
            <p>Access to our content library requires a paid subscription. Subscriptions are billed on a monthly basis and are non-refundable. Trial periods may be offered and are subject to their own terms.</p>
            
            <h3>2. Content Usage License</h3>
            <p>Your subscription grants you a limited, non-exclusive, non-transferable license to stream content for personal, non-commercial use only. You agree not to archive, download (other than through caching necessary for personal use), reproduce, distribute, or create derivative works from the content.</p>
            
            <h3>3. Prohibited Conduct</h3>
            <p>You agree not to:</p>
            <ul>
                <li>Share your account credentials with any third party.</li>
                <li>Use any automated means (bots, scrapers) to access the service.</li>
                <li>Attempt to bypass any content protection technologies.</li>
                <li>Use the service for any illegal or unauthorized purpose.</li>
            </ul>

            <h3>4. Termination</h3>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        `
        },
        privacy: {
            title: "Privacy Policy",
            content: `
            <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
            
            <h3>1. Information We Collect</h3>
            <ul>
                <li><strong>Account Information:</strong> When you register, we collect your name, email address, and password.</li>
                <li><strong>Payment Information:</strong> When you subscribe, we collect payment details.</li>
                <li><strong>Usage Data:</strong> We may collect information on how you use the service, such as your watch history or favorite list, to improve recommendations.</li>
            </ul>

            <h3>2. How We Use Information</h3>
            <p>We use the information we collect to:</p>
            <ul>
                <li>Provide, maintain, and improve our services.</li>
                <li>Process your subscription payments.</li>
                <li>Communicate with you regarding your account or our services.</li>
                <li>Prevent fraud and enforce our Terms of Service.</li>
            </ul>

            <h3>3. Information Sharing</h3>
            <p>We do not sell or rent your personal information to third parties. We may share information only as required by law or to protect our services and users.</p>
        `
        }
    };

    // Modal elements globalව ලබා ගැනීම
    const policyModalOverlay = document.getElementById('policy-modal-overlay');
    const policyModalTitle = document.getElementById('policy-modal-title');
    const policyModalContent = document.getElementById('policy-modal-content');

    /**
     * අදාළ content එක සමඟින් modal එක open කිරීම
     * @param {string} type - 'terms' or 'privacy'
     */
    function openPolicyModal(type) {
        if (event) event.preventDefault(); // <a> link එක click වීම නැවැත්වීම

        const content = policyContent[type];

        if (content && policyModalOverlay) {
            policyModalTitle.innerHTML = content.title;
            policyModalContent.innerHTML = content.content;
            policyModalOverlay.style.display = 'flex';
            policyModalOverlay.scrollTop = 0; // දිගු text එකකදී, modal එක උඩ සිට පෙන්වීම
        }
    }

    /**
     * Modal එක වැසීම
     */
    function closePolicyModal() {
        if (policyModalOverlay) {
            policyModalOverlay.style.display = 'none';
        }
    }

    // Modal එක වැසීමට event listeners
    if (policyModalOverlay) {
        // අඳුරු background එක click කළ විට වැසීම
        policyModalOverlay.addEventListener('click', function(event) {
            // 'policy-modal-box' එක click කළ විට වැසීම වැළැක්වීම
            if (event.target === policyModalOverlay) {
                closePolicyModal();
            }
        });
    }
</script>

<style>
    /* --- 1. FONTS & VARS --- */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    :root {
        --chat-primary: #00c8ff;
        --chat-bg: #121212;
        --chat-surface: #1e1e1e;
        --chat-text: #ffffff;
        --chat-user-msg: #005a87;
        --chat-bot-msg: #2a2a2a;
    }

    /* --- 2. GREETING BUBBLE (RESTORED & STYLED) --- */
    .chat-greeting-bubble {
        position: fixed;
        bottom: 100px;
        /* Launcher එකට උඩින් */
        right: 25px;
        background: rgba(255, 255, 255, 0.95);
        color: #000;
        padding: 12px 18px;
        border-radius: 15px;
        border-bottom-right-radius: 2px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 9999;
        display: none;
        /* JS handle */
        align-items: center;
        gap: 10px;
        animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
        max-width: 280px;
    }

    .chat-greeting-bubble .close-greet {
        margin-left: auto;
        cursor: pointer;
        color: #888;
        font-size: 1.2rem;
        padding-left: 10px;
    }

    .chat-greeting-bubble .close-greet:hover {
        color: #f00;
    }

    @keyframes popIn {
        0% {
            transform: scale(0) translateY(20px);
            opacity: 0;
        }

        100% {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }

    /* --- 3. LAUNCHER BUTTON --- */
    .chat-launcher {
        position: fixed;
        bottom: 25px;
        right: 25px;
        width: 65px;
        height: 65px;
        background: linear-gradient(135deg, #00c8ff, #0088cc);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 10px 25px rgba(0, 200, 255, 0.4);
        z-index: 10000;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .chat-launcher:hover {
        transform: scale(1.1) rotate(5deg);
    }

    .chat-launcher i {
        font-size: 28px;
        color: #fff;
        transition: transform 0.3s;
    }

    .chat-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background: #ff3b30;
        color: white;
        font-size: 11px;
        font-weight: bold;
        padding: 4px 8px;
        border-radius: 10px;
        border: 2px solid #121212;
        display: none;
    }

    /* --- 4. MAIN CHAT WINDOW (FIXED HEIGHT) --- */
    .chat-window {
        position: fixed;
        bottom: 100px;
        right: 25px;
        width: 380px;
        /* ⭐ HEIGHT FIX: 600px වෙනුවට auto සහ max-height */
        height: auto;
        max-height: 70vh;
        /* Screen එකෙන් 70% කට වඩා ලොකු වෙන්න බෑ */
        min-height: 400px;
        background: rgba(18, 18, 18, 0.95);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        display: none;
        flex-direction: column;
        z-index: 10000;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        overflow: hidden;
        font-family: 'Inter', sans-serif;
        transform-origin: bottom right;
        animation: openChat 0.3s cubic-bezier(0.19, 1, 0.22, 1);
    }

    @keyframes openChat {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
        }

        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    /* Header */
    .chat-header {
        padding: 15px 20px;
        background: linear-gradient(90deg, #005a87, #0088cc);
        display: flex;
        align-items: center;
        gap: 15px;
        flex-shrink: 0;
        /* Header එක හැකිලෙන්න දෙන්න එපා */
    }

    .bot-avatar-large {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        position: relative;
    }

    .status-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        background: #00ff88;
        border: 2px solid #0088cc;
        border-radius: 50%;
    }

    .header-info h3 {
        margin: 0;
        font-size: 15px;
        color: #fff;
        font-weight: 600;
    }

    .header-info p {
        margin: 0;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.8);
    }

    .close-chat {
        margin-left: auto;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.7);
    }

    .close-chat:hover {
        color: #fff;
    }

    /* Messages Area */
    .chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
        scrollbar-width: thin;
    }

    /* Message Rows */
    .msg-row {
        display: flex;
        gap: 10px;
        align-items: flex-end;
        opacity: 0;
        animation: fadeInMsg 0.3s forwards;
    }

    @keyframes fadeInMsg {
        to {
            opacity: 1;
        }
    }

    .msg-row.user {
        flex-direction: row-reverse;
    }

    .chat-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        flex-shrink: 0;
        color: white;
    }

    .bot-icon {
        background: linear-gradient(135deg, #00c8ff, #005a87);
    }

    .user-icon {
        background: #555;
    }

    .msg-bubble {
        max-width: 80%;
        padding: 10px 14px;
        font-size: 13px;
        line-height: 1.5;
        border-radius: 18px;
        word-wrap: break-word;
    }

    .msg-row.bot .msg-bubble {
        background: var(--chat-bot-msg);
        color: #eee;
        border-bottom-left-radius: 4px;
    }

    .msg-row.user .msg-bubble {
        background: var(--chat-user-msg);
        color: #fff;
        border-bottom-right-radius: 4px;
    }

    .msg-bubble a {
        color: #00c8ff;
        text-decoration: none;
        font-weight: 600;
        border-bottom: 1px dotted #00c8ff;
    }

    /* Typing & Chips */
    .typing-container {
        padding: 5px 20px;
        display: none;
    }

    .typing-dots {
        display: flex;
        gap: 4px;
    }

    .dot {
        width: 6px;
        height: 6px;
        background: #666;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;
    }

    .dot:nth-child(1) {
        animation-delay: -0.32s;
    }

    .dot:nth-child(2) {
        animation-delay: -0.16s;
    }

    @keyframes bounce {

        0%,
        80%,
        100% {
            transform: scale(0);
        }

        40% {
            transform: scale(1);
        }
    }

    .quick-chips {
        padding: 10px 20px;
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
        flex-shrink: 0;
    }

    .chip {
        background: rgba(255, 255, 255, 0.1);
        color: #ccc;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        cursor: pointer;
        white-space: nowrap;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .chip:hover {
        background: rgba(0, 200, 255, 0.2);
        border-color: #00c8ff;
        color: #fff;
    }

    /* Footer */
    .chat-footer {
        padding: 12px;
        background: rgba(30, 30, 30, 0.8);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
        /* Footer එක හැකිලෙන්න දෙන්න එපා */
    }

    .chat-input {
        flex: 1;
        background: #121212;
        border: 1px solid #333;
        padding: 10px 15px;
        border-radius: 25px;
        color: white;
        outline: none;
        font-size: 13px;
    }

    .chat-input:focus {
        border-color: #00c8ff;
    }

    .send-btn {
        width: 35px;
        height: 35px;
        background: transparent;
        border: none;
        color: #00c8ff;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }

    .send-btn:hover {
        background: rgba(0, 200, 255, 0.1);
    }

    /* ==================================================
       HIDE AI CHAT WHEN VIDEO PLAYER IS ACTIVE
       ================================================== */
    
    /* වීඩියෝ Player එක Active වූ විට Chat Icon, Window සහ Greeting හංගන්න */
    body.player-active .chat-launcher,
    body.player-active .chat-window,
    body.player-active .chat-greeting-bubble {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -1 !important;
    }

    /* Mobile */
    @media (max-width: 480px) {
        .chat-window {
            width: 90%;
            height: 75vh;
            bottom: 100px;
            right: 5%;
        }

        .chat-greeting-bubble {
            bottom: 100px;
            right: 5%;
            width: auto;
            max-width: 80%;
        }

        .chat-window {
            width: 90%;
            /* ⭐ FIX: 75vh වෙනුවට 60vh දැම්මා. එතකොට උඩ ඉඩ ඉතුරු වෙනවා */
            height: auto;
            max-height: 60vh;
            bottom: 100px;
            right: 5%;
            z-index: 10000000000;
        }

        .chat-greeting-bubble {
            bottom: 100px;
            right: 5%;
            width: auto;
            max-width: 85%;
            /* බබල් එකත් ගානට හැදුවා */
        }

        /* පොඩි ෆෝන් වල චැට් එකේ අකුරු ටිකක් පොඩි කරමු කියවන්න ලේසි වෙන්න */
        .msg-bubble {
            font-size: 13px;
        }

        .chat-header h3 {
            font-size: 14px;
        }
    }
</style>

<div class="chat-greeting-bubble" id="chatGreeting" onclick="toggleChat()">
    <i class="fas fa-comment-dots" style="color: #00c8ff;"></i>
    <span>👋 Hi! Need help finding a movie?</span>
    <span class="close-greet" onclick="closeGreeting(event)">&times;</span>
</div>

<div class="chat-launcher" onclick="toggleChat()">
    <div class="chat-badge" id="chatBadge">1</div>
    <i class="fas fa-robot" id="launcherIcon"></i>
</div>

<div class="chat-window" id="chatWindow">
    <div class="chat-header">
        <div class="bot-avatar-large">
            <i class="fas fa-robot"></i>
            <div class="status-dot"></div>
        </div>
        <div class="header-info">
            <h3>Plexzone AI</h3>
            <p>Online | Replies Instantly</p>
        </div>
        <div class="close-chat" onclick="toggleChat()">
            <i class="fas fa-times"></i>
        </div>
    </div>

    <div class="chat-messages" id="chatMessages">
        <div class="msg-row bot">
            <div class="chat-avatar bot-icon"><i class="fas fa-robot"></i></div>
            <div class="msg-bubble">
                <?php
                if ($userName !== "") {
                ?> Hi <?php echo htmlspecialchars($userName); ?>! 👋 I'm your AI assistant. <br>Ask me about movies, TV series, or subscription plans!
                <?php } else {
                ?> Hi there! 👋 I'm your AI assistant. <br>Ask me about movies, TV series, or subscription plans !
                <?php }
                ?>
            </div>
        </div>
    </div>

    <div class="typing-container" id="typingIndicator">
        <div class="msg-row bot">
            <div class="chat-avatar bot-icon"><i class="fas fa-robot"></i></div>
            <div class="msg-bubble" style="padding: 10px 15px;">
                <div class="typing-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="quick-chips">
        <div class="chip" onclick="sendQuickMsg('How to pay?')">💳 Payment</div>
        <div class="chip" onclick="sendQuickMsg('Download App')">📱 App</div>
        <div class="chip" onclick="sendQuickMsg('Latest Movies')">🎬 Latest</div>
        <div class="chip" onclick="sendQuickMsg('Pricing')">💰 Plans</div>
    </div>

    <div class="chat-footer">
        <input type="text" class="chat-input" id="chatInput" placeholder="Type a message..." onkeypress="handleEnter(event)">
        <button class="send-btn" onclick="sendMessage()">
            <i class="fas fa-paper-plane"></i>
        </button>
    </div>
</div>

<audio id="msgSound" src="https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3" preload="auto"></audio>

<script>
    const chatWindow = document.getElementById('chatWindow');
    const launcherIcon = document.getElementById('launcherIcon');
    const msgSound = document.getElementById('msgSound');

    // ⭐ GREETING LOGIC: Auto Show & Auto Hide
    setTimeout(function() {
        const greet = document.getElementById('chatGreeting');
        const win = document.getElementById('chatWindow');

        // Chat එක දැනටමත් Open වෙලා නැත්නම් විතරක් Greeting එක පෙන්වන්න
        if (greet && win.style.display !== 'flex') {
            
            // 1. පෙන්වන්න (Show)
            greet.style.display = 'flex';

            // 2. ⭐ AUTO HIDE: තත්පර 8කට පස්සේ ඉබේම වහන්න
            setTimeout(function() {
                // තාම කවුරුත් ඒක වහලා නැත්නම් සහ Chat එක Open කරලත් නැත්නම් විතරක් වහන්න
                if (greet.style.display === 'flex' && win.style.display !== 'flex') {
                    greet.style.display = 'none';
                }
            }, 8000); // 8000ms = තත්පර 8යි (මෙතන කැමති වෙලාවක් දාගන්න)
        }
    }, 3000); // Page load වී තත්පර 3කට පසු පෙන්වයි

    function closeGreeting(event) {
        if (event) event.stopPropagation();
        const greet = document.getElementById('chatGreeting');
        if (greet) greet.style.display = 'none';
    }

    function toggleChat() {
        const greet = document.getElementById('chatGreeting');

        if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
            // Open Chat
            if (greet) greet.style.display = 'none'; // Hide greeting
            chatWindow.style.display = 'flex';
            launcherIcon.classList.remove('fa-robot');
            launcherIcon.classList.add('fa-chevron-down');
            document.getElementById('chatBadge').style.display = 'none';
            setTimeout(() => document.getElementById('chatInput').focus(), 100);
        } else {
            // Close Chat
            chatWindow.style.display = 'none';
            launcherIcon.classList.remove('fa-chevron-down');
            launcherIcon.classList.add('fa-robot');
        }
    }

    function handleEnter(e) {
        if (e.key === 'Enter') sendMessage();
    }

    function sendQuickMsg(text) {
        document.getElementById('chatInput').value = text;
        sendMessage();
    }

    async function sendMessage() {
        const input = document.getElementById('chatInput');
        const msg = input.value.trim();
        const chatBox = document.getElementById('chatMessages');
        const typing = document.getElementById('typingIndicator');

        if (!msg) return;

        // User Msg
        const userHTML = `
            <div class="msg-row user">
                <div class="chat-avatar user-icon"><i class="fas fa-user"></i></div>
                <div class="msg-bubble">${escapeHtml(msg)}</div>
            </div>
        `;
        chatBox.insertAdjacentHTML('beforeend', userHTML);
        input.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        // Typing
        typing.style.display = 'block';
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch('plexzone_ai.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: msg
                })
            });

            const data = await response.json();
            let botText = data.reply;

            // ❌ පැරණි REGEX කෝඩ් එක අයින් කළා (REMOVE THIS PART)
            // const urlRegex = /(https?:\/\/[^\s]+)/g;
            // botText = botText.replace(urlRegex, function(url) { ... });

            // ✅ අලුත් කෝඩ් එක: PHP එකෙන් එන HTML කෙලින්ම පෙන්වන්න
            // අපි PHP එකෙන්ම ලස්සනට Link හදලා එවන නිසා මෙතන මුකුත් කරන්න ඕන නෑ.
            
            // New lines <br> වලට හරවමු (PHP එකෙන් එවන <br> අවුලක් නෑ)
            // botText = botText.replace(/\n/g, '<br>'); // PHP එකෙන්ම <br> එවනවා නම් මේකත් ඕන නෑ

            try {
                msgSound.currentTime = 0;
                msgSound.play();
            } catch (e) {}

            const botHTML = `
                <div class="msg-row bot">
                    <div class="chat-avatar bot-icon"><i class="fas fa-robot"></i></div>
                    <div class="msg-bubble">${botText}</div>
                </div>
            `;
            chatBox.insertAdjacentHTML('beforeend', botHTML);

        } catch (error) {
            console.error("AI Error:", error);
            const errorHTML = `
                <div class="msg-row bot">
                    <div class="chat-avatar bot-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="msg-bubble" style="color:#ff5555;">Thinking failed. Please try again.</div>
                </div>
            `;
            chatBox.insertAdjacentHTML('beforeend', errorHTML);
        }

        typing.style.display = 'none';
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // ==================================================
    // ==      CLOSE CHAT ON OUTSIDE CLICK (NEW)       ==
    // ==================================================
    document.addEventListener('click', function(event) {
        const chatWindow = document.getElementById('chatWindow');
        const launcher = document.querySelector('.chat-launcher');
        const greeting = document.getElementById('chatGreeting');

        // Chat එක Open වෙලා තියෙනවද බලන්න
        if (chatWindow.style.display === 'flex') {
            // Click කළේ Chat Window එක, Launcher එක හෝ Greeting Bubble එක ඇතුලේ නෙමෙයිද?
            const isClickInsideChat = chatWindow.contains(event.target);
            const isClickInsideLauncher = launcher.contains(event.target);
            const isClickInsideGreeting = greeting && greeting.contains(event.target);

            // පිටත Click කළා නම් පමණක් Chat එක වහන්න
            if (!isClickInsideChat && !isClickInsideLauncher && !isClickInsideGreeting) {
                toggleChat();
            }
        }
    });
</script>