// ===== CONFIGURATION =====
const CONFIG = {
    letterPool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    colors: ['#00ffaa', '#ff6b9d', '#ffd93d', '#6bcfff', '#c77dff', '#ff5e78'],
    maxLetters: 30,
    defaultFontSize: 200,
    trailLength: 15,
    physics: {
        friction: 0.95,
        gravity: 0.1,
        bounce: 0.7
    }
};

// ===== LETTER CLASS =====
class Letter {
    constructor(char, x, y) {
        this.char = char;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.fontSize = CONFIG.defaultFontSize;
        this.targetFontSize = CONFIG.defaultFontSize;
        this.rotation = 0;
        this.targetRotation = 0;
        this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        this.alpha = 1;
        this.grabbed = false;
        this.scaleX = 1;
        this.scaleY = 1;
        this.targetScaleX = 1;
        this.targetScaleY = 1;
        this.shadow = 0;
        this.ripple = 0;
        this.trail = [];
        this.hue = Math.random() * 360;
    }

    update(canvas) {
        // Apply physics
        if (!this.grabbed) {
            this.vx *= CONFIG.physics.friction;
            this.vy *= CONFIG.physics.friction;
            this.vy += CONFIG.physics.gravity;

            this.x += this.vx;
            this.y += this.vy;

            // Boundary collision
            const width = this.fontSize * this.scaleX;
            const height = this.fontSize * this.scaleY;

            if (this.x - width/2 < 0) {
                this.x = width/2;
                this.vx *= -CONFIG.physics.bounce;
            }
            if (this.x + width/2 > canvas.width) {
                this.x = canvas.width - width/2;
                this.vx *= -CONFIG.physics.bounce;
            }
            if (this.y - height/2 < 0) {
                this.y = height/2;
                this.vy *= -CONFIG.physics.bounce;
            }
            if (this.y + height/2 > canvas.height) {
                this.y = canvas.height - height/2;
                this.vy *= -CONFIG.physics.bounce;
            }
        }

        // Smooth scaling
        this.scaleX += (this.targetScaleX - this.scaleX) * 0.15;
        this.scaleY += (this.targetScaleY - this.scaleY) * 0.15;
        this.fontSize += (this.targetFontSize - this.fontSize) * 0.15;
        this.rotation += (this.targetRotation - this.rotation) * 0.1;

        // Decay effects
        this.shadow *= 0.95;
        this.ripple *= 0.9;

        // Update trail
        if (Math.abs(this.vx) + Math.abs(this.vy) > 0.5) {
            this.trail.push({
                x: this.x,
                y: this.y,
                alpha: 1,
                size: this.fontSize,
                rotation: this.rotation,
                scaleX: this.scaleX,
                scaleY: this.scaleY
            });
        }

        // Limit trail length
        if (this.trail.length > CONFIG.trailLength) {
            this.trail.shift();
        }

        // Fade trail
        this.trail.forEach(point => {
            point.alpha *= 0.92;
        });
    }

    draw(ctx) {
        // Draw trail
        this.trail.forEach(point => {
            ctx.save();
            ctx.translate(point.x, point.y);
            ctx.rotate(point.rotation);
            ctx.scale(point.scaleX, point.scaleY);
            ctx.globalAlpha = point.alpha * 0.3;
            ctx.font = `bold ${point.size}px Arial`;
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.char, 0, 0);
            ctx.restore();
        });

        // Draw main letter
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scaleX, this.scaleY);

        // Shadow effect
        if (this.shadow > 0) {
            ctx.shadowBlur = this.shadow;
            ctx.shadowColor = this.color;
        }

        // Ripple effect
        if (this.ripple > 0) {
            ctx.globalAlpha = this.ripple * 0.5;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.fontSize * this.ripple, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.globalAlpha = this.alpha;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.char, 0, 0);

        // Outline for grabbed letters
        if (this.grabbed) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeText(this.char, 0, 0);
        }

        ctx.restore();
    }

    isNear(x, y, threshold = 100) {
        const dx = this.x - x;
        const dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
    }

    applyForce(fx, fy) {
        this.vx += fx;
        this.vy += fy;
    }
}

// ===== GESTURE DETECTOR =====
class GestureDetector {
    constructor() {
        this.prevHandData = new Map();
    }

    detectGesture(landmarks) {
        const tips = {
            thumb: landmarks[4],
            index: landmarks[8],
            middle: landmarks[12],
            ring: landmarks[16],
            pinky: landmarks[20]
        };
        const palm = landmarks[0];
        const wrist = landmarks[0];

        // Calculate finger states
        const thumbIndexDist = this.distance(tips.thumb, tips.index);
        const thumbMiddleDist = this.distance(tips.thumb, tips.middle);

        // Pinch detection
        const isPinching = thumbIndexDist < 0.05;

        // Open hand detection (all fingers extended)
        const isOpen = this.isFingerExtended(landmarks, 8) &&
                       this.isFingerExtended(landmarks, 12) &&
                       this.isFingerExtended(landmarks, 16) &&
                       this.isFingerExtended(landmarks, 20);

        // Closed fist detection
        const isClosed = !this.isFingerExtended(landmarks, 8) &&
                         !this.isFingerExtended(landmarks, 12) &&
                         !this.isFingerExtended(landmarks, 16) &&
                         !this.isFingerExtended(landmarks, 20);

        return {
            isPinching,
            isOpen,
            isClosed,
            indexTip: tips.index,
            thumbTip: tips.thumb,
            palm: palm,
            wrist: wrist,
            landmarks: landmarks
        };
    }

    distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    isFingerExtended(landmarks, tipIndex) {
        const tip = landmarks[tipIndex];
        const pip = landmarks[tipIndex - 2];
        const mcp = landmarks[tipIndex - 3];

        // Check if tip is further from wrist than pip
        const wrist = landmarks[0];
        const tipDist = this.distance(tip, wrist);
        const pipDist = this.distance(pip, wrist);

        return tipDist > pipDist;
    }

    detectSwipe(handLabel, currentPos) {
        const key = handLabel;
        const prev = this.prevHandData.get(key);

        let velocity = { x: 0, y: 0 };
        if (prev) {
            velocity.x = currentPos.x - prev.x;
            velocity.y = currentPos.y - prev.y;
        }

        this.prevHandData.set(key, { ...currentPos });

        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        const isSwipe = speed > 15;

        return { isSwipe, velocity, speed };
    }
}

// ===== MAIN APPLICATION =====
class TypographySandbox {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.video = document.getElementById('video');
        this.letters = [];
        this.hands = null;
        this.camera = null;
        this.gestureDetector = new GestureDetector();
        this.handCursors = new Map();

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.setupUI();
        this.initializeHands();
        this.addInitialLetters();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupUI() {
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                this.addRandomLetter();
            } else if (e.key === 'c') {
                this.letters = [];
            }
        });
    }

    addRandomLetter() {
        if (this.letters.length >= CONFIG.maxLetters) {
            this.letters.shift();
        }

        const char = CONFIG.letterPool[Math.floor(Math.random() * CONFIG.letterPool.length)];
        const x = this.canvas.width / 2 + (Math.random() - 0.5) * 200;
        const y = this.canvas.height / 2 + (Math.random() - 0.5) * 200;

        this.letters.push(new Letter(char, x, y));
    }

    addInitialLetters() {
        const word = "HELLO";
        const spacing = 220;
        const startX = this.canvas.width / 2 - (word.length * spacing) / 2;
        const startY = this.canvas.height / 2;

        for (let i = 0; i < word.length; i++) {
            const letter = new Letter(
                word[i],
                startX + i * spacing,
                startY + Math.sin(i) * 50
            );
            this.letters.push(letter);
        }
    }

    initializeHands() {
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.hands.onResults((results) => this.onHandsDetected(results));

        this.startCamera();
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 }
            });
            this.video.srcObject = stream;

            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    await this.hands.send({ image: this.video });
                },
                width: 1280,
                height: 720
            });
            this.camera.start();
        } catch (error) {
            console.error('Camera error:', error);
        }
    }

    onHandsDetected(results) {
        // Clear previous cursors
        this.handCursors.forEach((cursor) => cursor.remove());
        this.handCursors.clear();

        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            this.updateGestureIndicator('left', '-', false);
            this.updateGestureIndicator('right', '-', false);
            return;
        }

        const handsData = [];

        results.multiHandLandmarks.forEach((landmarks, index) => {
            const handLabel = results.multiHandedness[index].label.toLowerCase();
            const gesture = this.gestureDetector.detectGesture(landmarks);

            // Convert normalized coordinates to canvas coordinates
            const indexTip = {
                x: (1 - landmarks[8].x) * this.canvas.width,
                y: landmarks[8].y * this.canvas.height
            };

            handsData.push({
                label: handLabel,
                gesture: gesture,
                position: indexTip,
                landmarks: landmarks
            });

            // Create hand cursor
            this.createHandCursor(handLabel, indexTip, gesture);

            // Detect swipe
            const swipe = this.gestureDetector.detectSwipe(handLabel, indexTip);

            // Update UI
            let gestureName = '-';
            if (gesture.isPinching) gestureName = 'Pinching';
            else if (gesture.isOpen) gestureName = 'Open';
            else if (gesture.isClosed) gestureName = 'Closed';

            this.updateGestureIndicator(handLabel, gestureName, true);

            // Apply single-hand gestures
            this.applySingleHandGestures(gesture, indexTip, swipe, handLabel);
        });

        // Apply two-hand gestures
        if (handsData.length === 2) {
            this.applyTwoHandGestures(handsData[0], handsData[1]);
        }
    }

    createHandCursor(label, position, gesture) {
        const cursor = document.createElement('div');
        cursor.className = 'hand-cursor';
        cursor.style.left = position.x + 'px';
        cursor.style.top = position.y + 'px';

        if (gesture.isPinching) {
            cursor.classList.add('pinching');
        } else if (gesture.isClosed) {
            cursor.classList.add('closed');
        }

        document.body.appendChild(cursor);
        this.handCursors.set(label, cursor);
    }

    updateGestureIndicator(hand, gestureName, active) {
        const indicator = document.getElementById(`${hand}-hand-indicator`);
        indicator.querySelector('.gesture-name').textContent = gestureName;

        if (active) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }

    applySingleHandGestures(gesture, position, swipe, handLabel) {
        this.letters.forEach(letter => {
            const isNear = letter.isNear(position.x, position.y, 250);

            if (gesture.isPinching && isNear) {
                // Grab and move
                letter.grabbed = true;
                letter.x = position.x;
                letter.y = position.y;
                letter.vx = 0;
                letter.vy = 0;
                letter.shadow = 30;
            } else if (letter.grabbed && !gesture.isPinching) {
                letter.grabbed = false;
            }

            if (gesture.isOpen && isNear) {
                // Stretch letters - horizontal stretch for wide movements
                const dx = Math.abs(position.x - letter.x);
                const dy = Math.abs(position.y - letter.y);

                if (dx > dy) {
                    // Horizontal stretch
                    letter.targetScaleX = 2.0;
                    letter.targetScaleY = 0.8;
                } else {
                    // Vertical stretch
                    letter.targetScaleX = 0.8;
                    letter.targetScaleY = 2.0;
                }

                letter.targetFontSize = CONFIG.defaultFontSize * 1.2;
                letter.shadow = 25;

                // Cycle colors
                letter.hue = (letter.hue + 2) % 360;
                letter.color = `hsl(${letter.hue}, 80%, 60%)`;
            } else if (gesture.isClosed && isNear) {
                // Compress letters - squish dramatically
                letter.targetScaleX = 0.4;
                letter.targetScaleY = 0.4;
                letter.targetFontSize = CONFIG.defaultFontSize * 0.5;
                letter.shadow = 15;
            } else if (!letter.grabbed) {
                // Reset to normal
                letter.targetScaleX = 1;
                letter.targetScaleY = 1;
                letter.targetFontSize = CONFIG.defaultFontSize;
            }

            // Swipe to fling
            if (swipe.isSwipe && isNear) {
                letter.applyForce(swipe.velocity.x * 0.8, swipe.velocity.y * 0.8);
                letter.shadow = 40;

                // Change color on fling
                letter.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            }
        });
    }

    applyTwoHandGestures(hand1, hand2) {
        const dist = Math.sqrt(
            Math.pow(hand1.position.x - hand2.position.x, 2) +
            Math.pow(hand1.position.y - hand2.position.y, 2)
        );

        const centerX = (hand1.position.x + hand2.position.x) / 2;
        const centerY = (hand1.position.y + hand2.position.y) / 2;

        // Both hands pinching - merge letters
        if (hand1.gesture.isPinching && hand2.gesture.isPinching) {
            this.letters.forEach(letter => {
                const distToCenter = Math.sqrt(
                    Math.pow(letter.x - centerX, 2) +
                    Math.pow(letter.y - centerY, 2)
                );

                if (distToCenter < 400) {
                    // Pull letters toward center
                    const dx = centerX - letter.x;
                    const dy = centerY - letter.y;
                    letter.applyForce(dx * 0.015, dy * 0.015);
                    letter.shadow = 30;
                    letter.targetScaleX = 0.7;
                    letter.targetScaleY = 0.7;
                }
            });
        }

        // Both hands open - ripple effect and stretch
        if (hand1.gesture.isOpen && hand2.gesture.isOpen) {
            this.letters.forEach(letter => {
                const distToCenter = Math.sqrt(
                    Math.pow(letter.x - centerX, 2) +
                    Math.pow(letter.y - centerY, 2)
                );

                if (distToCenter < 450) {
                    letter.ripple = 2.0;

                    // Push letters away from center
                    const dx = letter.x - centerX;
                    const dy = letter.y - centerY;
                    const angle = Math.atan2(dy, dx);
                    letter.applyForce(Math.cos(angle) * 3, Math.sin(angle) * 3);

                    // Stretch based on distance from hands
                    letter.targetScaleX = 1.5;
                    letter.targetScaleY = 1.5;
                }
            });
        }

        // One open, one closed - rotate and squish
        if ((hand1.gesture.isOpen && hand2.gesture.isClosed) ||
            (hand1.gesture.isClosed && hand2.gesture.isOpen)) {
            this.letters.forEach(letter => {
                const distToCenter = Math.sqrt(
                    Math.pow(letter.x - centerX, 2) +
                    Math.pow(letter.y - centerY, 2)
                );

                if (distToCenter < 400) {
                    letter.targetRotation += 0.15;
                    letter.shadow = 25;

                    // Alternate squish direction
                    const rotAmount = Math.floor(letter.targetRotation / (Math.PI / 2)) % 2;
                    if (rotAmount === 0) {
                        letter.targetScaleX = 1.3;
                        letter.targetScaleY = 0.7;
                    } else {
                        letter.targetScaleX = 0.7;
                        letter.targetScaleY = 1.3;
                    }
                }
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw letters
        this.letters.forEach(letter => {
            letter.update(this.canvas);
            letter.draw(this.ctx);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ===== INITIALIZE =====
window.addEventListener('load', () => {
    new TypographySandbox();
});
