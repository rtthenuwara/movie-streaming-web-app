<?php
// Session එක ආරම්භ කිරීම (header එකට අවශ්‍යයි)
session_start();
require "connection.php";
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us - PlexZone</title>
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon.ico">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/index.css">

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <style>
        /* Main container for the contact page */
        .contact-page-modern {
            display: grid;
            grid-template-columns: 1fr 1fr;
            /* Two equal columns */
            gap: 3rem;
            width: 100%;
            max-width: 1100px;
            /* Wider container */
            margin: 3rem auto;
            /* Center the container */
            padding: 2rem;
            background: rgba(12, 12, 12, 0.5);
            /* Dark semi-transparent bg */
            border: 1px solid var(--color-purple);
            border-radius: 10px;
        }

        /* ⭐️ FIX: Contact page එකේ search bar එක hide කිරීම ⭐️ */
        .main-header .search-bar {
            display: none;
        }

        /* Left Column: Info */
        .contact-info-col h1 {
            font-size: 2.5rem;
            color: var(--color-neon-blue);
            margin-bottom: 1rem;
        }

        .contact-info-col .subtitle {
            font-size: 1.1rem;
            margin-bottom: 2.5rem;
            line-height: 1.7;
        }

        .contact-info-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
            font-weight: 500;
            background: rgba(0, 0, 0, 0.2);
            padding: 12px 15px;
            border-radius: 8px;
            border-left: 3px solid var(--color-neon-blue);
        }

        .contact-info-item i {
            font-size: 1.5rem;
            color: var(--color-neon-blue);
            width: 25px;
            text-align: center;
        }

        .contact-social-links {
            margin-top: 2.5rem;
        }

        .contact-social-links a {
            font-size: 1.8rem;
            margin-right: 1.5rem;
            color: var(--color-silver);
            transition: color 0.3s ease, transform 0.3s ease;
        }

        .contact-social-links a:hover {
            color: var(--color-neon-blue);
            transform: scale(1.1);
        }

        /* Right Column: Form */
        .contact-form-col {
            background: rgba(43, 0, 64, 0.3);
            /* Purple tint */
            padding: 2.5rem;
            border-radius: 10px;
        }

        .contact-form-col h2 {
            font-size: 2rem;
            margin-bottom: 2rem;
            text-align: center;
        }

        /* Input Group Styles (style.css එකෙන් උපුටා ගන්නා ලදී) */
        .input-group {
            position: relative;
            margin-bottom: 2.5rem;
        }

        .input-group input,
        .input-group textarea {
            width: 100%;
            padding: 10px 0;
            background: transparent;
            border: none;
            border-bottom: 2px solid var(--color-silver);
            color: var(--color-white);
            font-size: 1rem;
            font-family: var(--font-main);
        }

        .input-group input:focus,
        .input-group textarea:focus {
            outline: none;
            border-bottom-color: var(--color-neon-blue);
        }

        .input-group label {
            position: absolute;
            top: 10px;
            left: 0;
            color: var(--color-silver);
            pointer-events: none;
            transition: all 0.3s ease;
        }

        .input-group input:focus~label,
        .input-group input:valid~label,
        .input-group textarea:focus~label,
        .input-group textarea:valid~label {
            top: -15px;
            font-size: 0.8rem;
            color: var(--color-neon-blue);
        }

        /* Readonly input එකේ label එක උඩට ගැනීමට */
        .input-group input[readonly]+label {
            top: -15px;
            font-size: 0.8rem;
            color: var(--color-neon-blue);
        }

        .input-group input[readonly] {
            border-bottom-color: var(--color-purple);
        }

        /* Button Styles (style.css එකෙන් උපුටා ගන්නා ලදී) */
        .cta-button {
            display: inline-block;
            padding: 0.8rem 2rem;
            background: var(--color-purple);
            color: var(--color-white);
            border: 2px solid var(--color-neon-blue);
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
            width: 100%;
        }

        .cta-button:hover {
            background: var(--color-neon-blue);
            color: var(--color-black);
            transform: translateY(-3px);
        }

        .cta-button:disabled {
            background: #555;
            border-color: #777;
            cursor: not-allowed;
            box-shadow: none;
        }

        /* Responsive: Stack columns on mobile */
        @media (max-width: 850px) {
            .contact-page-modern {
                grid-template-columns: 1fr;
                /* Single column */
                gap: 2rem;
                margin-top: 1rem;
                padding: 1rem;
            }

            .contact-form-col {
                padding: 2rem 1.5rem;
            }
        }

        /* ==================================================================
        // ==               CONTACT PAGE RESPONSIVE (NEW)                ==
        // ================================================================== */

        /* --- Small Devices (Tablets and below - 850px) --- */
        @media (max-width: 850px) {
            .contact-page-modern {
                grid-template-columns: 1fr;
                /* Single column */
                gap: 2rem;
                margin: 0 auto 1rem auto;
                /* උඩින් margin අයින් කරමු */
                padding: 1.5rem;
            }

            .contact-info-col h1 {
                font-size: 2rem;
                /* Title කුඩා කිරීම */
            }

            .contact-info-col .subtitle {
                font-size: 1rem;
                margin-bottom: 2rem;
            }

            .contact-info-item {
                font-size: 1rem;
                padding: 10px 12px;
            }

            .contact-social-links {
                text-align: center;
                /* Social icons මැදට align කිරීම */
            }

            .contact-social-links a {
                margin: 0 1rem;
                /* Icons අතර ඉඩ සකස් කිරීම */
            }

            .contact-form-col {
                padding: 2rem 1.5rem;
                /* Form padding සකස් කිරීම */
            }

            .contact-form-col h2 {
                font-size: 1.8rem;
            }
        }

        /* --- Extra Small Devices (Phones - 576px and down) --- */
        @media (max-width: 576px) {
            .contact-page-modern {
                padding: 1rem;
                margin-top: 0;
            }

            .contact-info-col h1 {
                font-size: 1.8rem;
            }

            .contact-info-col .subtitle {
                font-size: 0.9rem;
            }

            .contact-info-item {
                font-size: 0.9rem;
                gap: 0.8rem;
                padding: 8px 10px;
            }

            .contact-info-item i {
                font-size: 1.3rem;
            }

            .contact-social-links a {
                font-size: 1.6rem;
            }

            .contact-form-col h2 {
                font-size: 1.6rem;
            }

        }
    </style>
</head>
</style>
</head>

<body class="centered-page-bg">

    <?php
    // ⭐️ 3. HEADER එක INCLUDE කිරීම ⭐️
    include "header.php";
    ?>

    <main class="contact-page-modern">

        <div class="contact-info-col">
            <h1>Get in Touch</h1>
            <p class="subtitle">
                Have a question or feedback? We'd love to hear from you.
                Reach out via our channels or send a message directly.
            </p>

            <div class="contact-info-item">
                <i class="fab fa-whatsapp"></i>
                <span>0705613151</span>
            </div>
            <div class="contact-info-item">
                <i class="fas fa-envelope"></i>
                <span>info@plexzone.lk</span>
            </div>

            <div class="contact-social-links">
                <a href="https://www.facebook.com/share/17RkgkBdvw/"><i class="fab fa-facebook-f"></i></a>
                <a href="https://t.me/plexzoneofficial"><i class="fab fa-telegram"></i></a>
                <a href="https://www.tiktok.com/@plexzone.lk"><i class="fab fa-tiktok"></i></a>
            </div>
        </div>

        <div class="contact-form-col">
            <h2>Send a Message</h2>

            <form class="contact-form-modern" id="contact-form" onsubmit="submitContactForm(event)">

                <?php if (isset($_SESSION['user']['email'])): ?>
                    <div class="input-group">
                        <input type="email" id="contact-email" name="email" value="<?php echo htmlspecialchars($_SESSION['user']['email']); ?>" readonly required>
                        <label for="contact-email">Your Email</label>
                    </div>
                <?php else: ?>
                    <div class="input-group">
                        <input type="email" id="contact-email" name="email" required>
                        <label for="contact-email">Your Email</label>
                    </div>
                <?php endif; ?>

                <div class="input-group">
                    <textarea id="contact-message" name="message" rows="4" required></textarea>
                    <label for="contact-message">Your Message (min 10 characters)</label>
                </div>

                <button type="submit" id="contact-submit-btn" class="cta-button">Send Message</button>
            </form>
        </div>

    </main>

    <?php
    // ⭐️ 5. FOOTER එක INCLUDE කිරීම ⭐️
    include "footer.php";
    ?>
    <div id="custom-modal-overlay">
        <div id="custom-modal-box">
            <h2 id="modal-title"></h2>
            <p id="modal-message"></p>
            <button id="modal-close-btn">OK</button>
        </div>
    </div>
    <script src="js/main.js"></script>
    <script src="js/index.js"></script>
</body>

</html>