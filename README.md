# 🎨 Hand Typography Sandbox

An interactive digital typography sandbox that uses webcam hand tracking to manipulate letters and words in real-time. Create dynamic typographic art using intuitive hand gestures!

## ✨ Features

### Hand Gestures

#### Single Hand Controls
- **Open Hand** ✋ - Stretch and enlarge letters, cycle through colors
- **Closed Fist** ✊ - Compress and shrink letters
- **Pinch** 🤏 - Grab and move letters around the canvas
- **Swipe** 👋 - Fling letters across the canvas with colorful trails

#### Two Hand Controls
- **Both Hands Pinching** - Merge letters into clusters (pull toward center)
- **Both Hands Open** - Create ripple effects and push letters away from center
- **One Open + One Closed** - Rotate letters around the center point

### Visual Effects
- **Motion Trails** - Letters leave colorful trails when moving fast
- **Dynamic Shadows** - Shadow effects respond to interactions
- **Color Transitions** - Letters change colors based on gestures
- **Physics Simulation** - Realistic gravity, friction, and collision detection
- **Ripple Waves** - Expanding circular waves from hand gestures

### User Interface
- **Live Camera Feed** - See your hands in the top-right corner
- **Gesture Indicators** - Real-time display of detected gestures for each hand
- **Hand Cursors** - Visual feedback showing hand position and state
- **Control Panel** - Add letters manually or clear the canvas

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A webcam
- HTTPS connection (required for webcam access)
  - Use a local server or deploy to a hosting service

### Installation

1. Clone or download this repository
2. Serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open your browser and navigate to `http://localhost:8000`
4. Allow webcam access when prompted

## 🎮 How to Use

1. **Grant Camera Permission** - Allow the browser to access your webcam
2. **Position Yourself** - Sit about 2-3 feet from your camera
3. **Show Your Hands** - Hold your hands up where the camera can see them
4. **Interact with Letters** - Use the gestures described above to manipulate the typography

### Tips for Best Results
- Ensure good lighting for better hand detection
- Keep your hands visible and unobstructed
- Start with one hand to get familiar with the controls
- The letters respond to proximity - get close to interact
- Experiment with different gesture combinations!

## 🛠️ Technical Details

### Technologies Used
- **MediaPipe Hands** - Google's hand tracking solution
- **HTML5 Canvas** - For rendering graphics
- **Vanilla JavaScript** - No frameworks required
- **CSS3** - Modern styling and animations

### Key Components

#### Letter Class
Each letter is an independent object with:
- Position and velocity (physics simulation)
- Scale and rotation (transformations)
- Color and alpha (visual properties)
- Trail history (motion effects)
- Interaction state (grabbed, stretched, etc.)

#### Gesture Detection
The `GestureDetector` class identifies:
- Finger positions and extensions
- Hand openness/closedness
- Pinch gestures (thumb-index distance)
- Swipe velocity and direction

#### Physics Engine
Simple but effective physics including:
- Gravity and friction
- Boundary collision with bounce
- Velocity-based trail generation
- Smooth interpolation for all transformations

## 🎨 Customization

Edit the `CONFIG` object in `app.js` to customize:

```javascript
const CONFIG = {
    letterPool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // Available letters
    colors: ['#00ffaa', '#ff6b9d', ...],      // Color palette
    maxLetters: 30,                            // Maximum letters on canvas
    defaultFontSize: 80,                       // Base letter size
    trailLength: 15,                           // Length of motion trails
    physics: {
        friction: 0.95,   // Movement dampening
        gravity: 0.1,     // Downward force
        bounce: 0.7       // Wall bounce factor
    }
};
```

## 🎯 Performance

- Optimized for smooth 60 FPS animation
- Efficient canvas rendering
- MediaPipe runs at ~30 FPS for hand tracking
- Trail system with automatic cleanup
- Responsive design for different screen sizes

## 🐛 Troubleshooting

### Camera Not Working
- Ensure you're using HTTPS or localhost
- Check browser permissions for camera access
- Try refreshing the page
- Check if another application is using the camera

### Hand Detection Issues
- Improve lighting conditions
- Remove gloves or hand coverings
- Ensure hands are fully visible
- Try reducing camera distance

### Performance Issues
- Close other browser tabs
- Reduce the number of letters on canvas
- Lower the `maxNumHands` in MediaPipe config
- Use a more powerful device

## 📝 Browser Compatibility

- ✅ Chrome/Edge (Chromium) - Recommended
- ✅ Firefox
- ⚠️ Safari - May have limited WebRTC support
- ❌ Internet Explorer - Not supported

## 🔒 Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- Camera feed is never recorded or transmitted
- MediaPipe models are loaded from CDN

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **MediaPipe** by Google for hand tracking technology
- Inspired by creative coding and interactive typography

## 🎉 Ideas for Enhancement

- Add word/sentence mode
- Save canvas as image
- More gesture types (victory sign, thumbs up, etc.)
- Letter particle systems
- Sound effects
- Mobile support with touch fallback
- Custom fonts and styles
- Recording and playback
- Multiplayer collaboration

---

**Enjoy creating typographic art with your hands!** ✋🎨
