class AnimationLoop {
    constructor(calculateFrameRate = false) {
        // The animation frame ID of the current frame
        // Used to cancel the animation if necessary
        this.animationFrameID = -1;

        // Time
        this.time = 0.0;

        // Callback function for each update
        this.callback = null;

        // True if started, false if stopped
        this.running = false;

        // Frame rate
        this.lastSecond = this.previousMillis;
        this.framesSinceLastSecond = 0;
        this.currentFrameRate = 0;

        this.frameRateAlpha = 0.3; // Controls falloff of previous frames influence on average framerate
        this.averageFrameRate = 0;

        this.calculateFrameRate = calculateFrameRate;
    }

    // Set update callback
    // Will be called each animation frame
    onUpdate(callback) {
        this.callback = callback;
    }

    start(callback = null) {
        if( this.running ) return;

        if(callback) this.onUpdate(callback);
        this.running = true;

        // Animation callback
        let then = 0;
        const animate = (now) => { 
            now *= 0.001; // Convert to seconds
            const delta = now - then;
            this.time += delta;
            then = now;

            // Recursively request another frame
            this.frameID = requestAnimationFrame( animate );

            // Call callback function
            this.callback && this.callback(delta, this.time);

            // Calculate framerate 
            if(this.calculateFrameRate) this._calculateFrameRate(now);
        };

        // Start animation
        requestAnimationFrame(animate);
    }

    stop() {
        cancelAnimationFrame(this.animationFrameID);
        this.running = false;
    }

    _calculateFrameRate(now) {
        // Calculate framerate
        this.framesSinceLastSecond++;

        //TODO calculate each update not just every second
        if(now - this.lastSecond > 1000) {
            this.currentFrameRate = this.framesSinceLastSecond;
            this.framesSinceLastSecond = 0;
            this.lastSecond = now;

            // Calculate a weighted frame rate average
            this.averageFrameRate = 
                this.frameRateAlpha * this.currentFrameRate +
                (1.0 - this.frameRateAlpha) * this.averageFrameRate;
        }
    }
}

export { 
    AnimationLoop
}