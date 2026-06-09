document.addEventListener('DOMContentLoaded', () => {

    const introContainer = document.getElementById('introContainer');
    const clickHereBtn = document.getElementById('clickHereBtn');
    const scene1 = document.getElementById('scene1');
    const scene3 = document.getElementById('scene3');
    const typewriterText = document.getElementById('typewriterText');
    const finalBtn = document.getElementById('finalBtn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const musicBtn = document.getElementById('musicBtn');
    const bgMusic = document.getElementById('bgMusic');
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    // Canvas Setup
    let width, height;
    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle System (Raining Petals)
    let particles = [];
    let hearts = [];

    const colors = ['#e91e63', '#d81b60', '#ff4081', '#f06292', '#ff80ab'];

    class Petal {
        constructor(x, y, isBurst = false) {
            this.x = x || Math.random() * width;
            this.y = y || Math.random() * height - height; // Start above screen
            this.size = Math.random() * 5 + 3;

            this.isBurst = isBurst;
            if (isBurst) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 15 + 5;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed;
                this.life = 100;
                this.opacity = 1;
            } else {
                this.speedX = (Math.random() - 0.5) * 1;
                this.speedY = Math.random() * 2 + 1;
                this.life = Infinity;
                this.opacity = Math.random() * 0.5 + 0.3;
            }

            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.angle = Math.random() * 360;
            this.spin = (Math.random() - 0.5) * 5;
        }

        update() {
            if (this.isBurst) {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life--;
                this.opacity = this.life / 100;
                this.speedX *= 0.92;
                this.speedY *= 0.92;
            } else {
                // Swaying falling motion
                this.x += Math.sin(this.y / 50) * 1 + this.speedX;
                this.y += this.speedY;
                this.angle += this.spin;

                // Reset to top
                if (this.y > height) {
                    this.y = -10;
                    this.x = Math.random() * width;
                }
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate((this.angle * Math.PI) / 180);

            // Draw a petal shape
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    class Heart {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 15 + 10;
            this.speedY = -Math.random() * 3 - 1;
            this.speedX = (Math.random() - 0.5) * 2;
            this.life = 100;
            this.opacity = 1;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.life -= 1.5;
            this.opacity = this.life / 100;
        }

        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#ff6b81';
            ctx.font = `${this.size}px Arial`;
            ctx.fillText('❤️', this.x, this.y);
            ctx.globalAlpha = 1;
        }
    }

    // Initialize raining petals
    for (let i = 0; i < 60; i++) {
        particles.push(new Petal(null, Math.random() * height));
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Render Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }

        // Render Hearts
        for (let i = hearts.length - 1; i >= 0; i--) {
            hearts[i].update();
            hearts[i].draw();
            if (hearts[i].life <= 0) {
                hearts.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }
    animate();

    // Mouse/Touch Interaction
    window.addEventListener('click', (e) => {
        if (e.target.closest('#introContainer')) return;
        createHearts(e.clientX, e.clientY);
    });

    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('#introContainer')) return;
        createHearts(e.touches[0].clientX, e.touches[0].clientY);
    });

    function createHearts(x, y) {
        for (let i = 0; i < 3; i++) {
            hearts.push(new Heart(x, y));
        }
    }

    // Intro Click Event (Scene 1 -> Scene 3)
    let introClicked = false;
    clickHereBtn.addEventListener('click', () => {
        if (introClicked) return;
        introClicked = true;

        // 1. Petal Burst
        const rect = clickHereBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 100; i++) {
            particles.push(new Petal(centerX, centerY, true));
        }

        // 2. Fade out Scene 1
        introContainer.style.transition = 'opacity 1s ease, transform 1s ease';
        introContainer.style.opacity = '0';
        introContainer.style.transform = 'scale(0.8)';

        setTimeout(() => {
            scene1.classList.remove('active');

            // 3. Fade in Scene 3
            setTimeout(() => {
                scene3.classList.add('active');
                startTypewriter();
            }, 1000);

        }, 1000);
    });

    // Typewriter Effect
    const message = [
        "I love you so much...",
        "More than the stars on the sky.",
        "Because even the stars have a limit...",
        "But my love for you doesn't.",
        "Every day with you becomes my favorite day.",
        "Thank you for being in my life ❤️"
    ];

    function startTypewriter() {
        let pIndex = 0;
        let charIndex = 0;
        let currentP = null;

        function type() {
            if (pIndex < message.length) {
                if (charIndex === 0) {
                    currentP = document.createElement('p');
                    currentP.style.opacity = '1';
                    typewriterText.appendChild(currentP);
                }

                if (charIndex < message[pIndex].length) {
                    currentP.innerHTML += message[pIndex].charAt(charIndex);
                    charIndex++;
                    setTimeout(type, 50); // Typing speed
                } else {
                    pIndex++;
                    charIndex = 0;
                    setTimeout(type, 1000); // Pause between paragraphs
                }
            } else {
                // Show final button
                setTimeout(() => {
                    finalBtn.classList.add('visible');
                }, 1000);
            }
        }

        setTimeout(type, 500);
    }

    // Modal Interaction
    finalBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Music Control
    let isPlaying = false;
    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.classList.remove('playing');
        } else {
            bgMusic.play().catch(() => {
                // Handle autoplay prevention
                console.log("Audio playback requires user interaction first.");
            });
            musicBtn.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });
});
