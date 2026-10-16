/* ===== Tiny visual repair bundle V16 ===== */
(() => {
  'use strict';

  // GitHub Pages paths are case-sensitive: the uploaded file starts with uppercase C.
  const healthArt = document.getElementById('woman-complete-mobile');
  if (healthArt) {
    healthArt.src = new URL('Cô gái ôm trái tim.png', document.baseURI).href;
    healthArt.decoding = 'async';
    healthArt.loading = 'eager';
  }

  // FIX 1: Put the hose between the actual nozzle and actual fuel port.
  const device = document.getElementById('share-flight-device');
  const hose = device && device.querySelector('.share-fuel-hose');
  const nozzle = device && device.querySelector('.share-fuel-nozzle');
  const fuelPort = document.querySelector('#share-aircraft .share-fuel-port');

  if (device && hose && nozzle && fuelPort) {
    const hosePaths = Array.from(hose.querySelectorAll('path'));
    let scheduled = false;
    let previousBox = '';

    function updateHose() {
      scheduled = false;
      if (!device.isConnected || !hose.isConnected) return;

      const deviceRect = device.getBoundingClientRect();
      const nozzleRect = nozzle.getBoundingClientRect();
      const portRect = fuelPort.getBoundingClientRect();
      if (deviceRect.width < 1 || nozzleRect.width < 1 || portRect.width < 1) return;

      const x0 = nozzleRect.left + nozzleRect.width / 2;
      const y0 = nozzleRect.top + nozzleRect.height / 2;
      const x1 = portRect.left + portRect.width / 2;
      const y1 = portRect.top + portRect.height / 2;
      if (x1 <= x0 + 8) return;

      const top = Math.min(y0, y1) - 12;
      const height = Math.max(76, Math.abs(y1 - y0) + 28);
      const width = x1 - x0;
      const boxKey = [x0, y0, x1, y1, deviceRect.width, deviceRect.height]
        .map(v => Math.round(v * 10) / 10).join(':');

      if (boxKey === previousBox) return;
      previousBox = boxKey;

      hose.style.left = `${x0 - deviceRect.left}px`;
      hose.style.top = `${top - deviceRect.top}px`;
      hose.style.right = 'auto';
      hose.style.bottom = 'auto';
      hose.style.width = `${width}px`;
      hose.style.height = `${height}px`;

      const startY = Math.max(3, Math.min(112, ((y0 - top) / height) * 115));
      const endY = Math.max(3, Math.min(112, ((y1 - top) / height) * 115));
      const pathData = `M 0 ${startY.toFixed(2)} C 70 ${startY.toFixed(2)}, 120 ${endY.toFixed(2)}, 205 ${endY.toFixed(2)} S 365 ${endY.toFixed(2)}, 450 ${endY.toFixed(2)}`;
      hose.setAttribute('viewBox', '0 0 450 115');
      hosePaths.forEach(path => path.setAttribute('d', pathData));
    }

    function requestHoseUpdate() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(updateHose);
    }

    requestHoseUpdate();
    window.addEventListener('resize', requestHoseUpdate, { passive: true });
    window.addEventListener('orientationchange', requestHoseUpdate, { passive: true });
    window.addEventListener('load', requestHoseUpdate, { once: true });
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(requestHoseUpdate);
      [device, nozzle, fuelPort].forEach(element => observer.observe(element));
    }
  }

  // FIX 4: The embedded WebM has a flat teal matte (about RGB 0,37,54), not alpha.
  // Draw each decoded frame onto a canvas and remove only pixels close to that hue.
  const smileScene = document.getElementById('smile-stage');
  const animeVideo = document.getElementById('waguri-smile-video');

  if (smileScene && animeVideo && animeVideo.parentElement) {
    const keyedCanvas = document.createElement('canvas');
    keyedCanvas.className = 'waguri-figure waguri-keyed-canvas';
    keyedCanvas.setAttribute('aria-hidden', 'true');
    keyedCanvas.tabIndex = -1;
    keyedCanvas.width = 408;
    keyedCanvas.height = 540;
    keyedCanvas.style.aspectRatio = '408 / 540';
    animeVideo.insertAdjacentElement('afterend', keyedCanvas);

    const ctx = keyedCanvas.getContext('2d', { willReadFrequently: true });
    let scheduledFrame = false;
    let callbackId = 0;
    let callbackMode = '';
    let lastVideoTime = -1;
    let hasKeyedFrame = false;
    const clamp01 = value => Math.max(0, Math.min(1, value));

    function sceneIsActive() {
      return !document.hidden
        && smileScene.classList.contains('hien-thi')
        && smileScene.classList.contains('waguri-frame-visible')
        && animeVideo.readyState >= 2
        && animeVideo.videoWidth > 0;
    }

    function drawKeyedFrame() {
      if (!ctx || animeVideo.readyState < 2 || !animeVideo.videoWidth || !animeVideo.videoHeight) return false;
      const width = animeVideo.videoWidth;
      const height = animeVideo.videoHeight;

      if (keyedCanvas.width !== width || keyedCanvas.height !== height) {
        keyedCanvas.width = width;
        keyedCanvas.height = height;
        keyedCanvas.style.aspectRatio = `${width} / ${height}`;
      }

      ctx.drawImage(animeVideo, 0, 0, width, height);
      let frame;
      try {
        frame = ctx.getImageData(0, 0, width, height);
      } catch (_) {
        return false;
      }

      const pixels = frame.data;
      for (let i = 0; i < pixels.length; i += 4) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];

        const dr = red;
        const dg = green - 37;
        const db = blue - 54;
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);

        // Teal hue gate protects dark hair, purple clothing, skin and neutral details.
        const proximity = clamp01((58 - distance) / 30);
        const tealHue = clamp01((green - red - 4) / 18)
          * clamp01((blue - green - 2) / 12)
          * clamp01((blue - 20) / 35);
        const remove = proximity * tealHue;
        if (remove > 0) pixels[i + 3] = Math.round(pixels[i + 3] * (1 - remove));
      }

      ctx.putImageData(frame, 0, 0);
      hasKeyedFrame = true;
      return true;
    }

    function stopFrameLoop() {
      if (!scheduledFrame) return;
      if (callbackMode === 'video' && typeof animeVideo.cancelVideoFrameCallback === 'function') {
        animeVideo.cancelVideoFrameCallback(callbackId);
      } else if (callbackMode === 'raf') {
        cancelAnimationFrame(callbackId);
      }
      scheduledFrame = false;
      callbackId = 0;
      callbackMode = '';
    }

    function processFrame() {
      scheduledFrame = false;
      callbackId = 0;
      callbackMode = '';
      if (!sceneIsActive()) {
        if (!smileScene.classList.contains('hien-thi')
            || !smileScene.classList.contains('waguri-frame-visible')) {
          smileScene.classList.remove('waguri-keying');
        }
        return;
      }

      if (animeVideo.currentTime !== lastVideoTime) {
        if (drawKeyedFrame()) {
          lastVideoTime = animeVideo.currentTime;
          if (hasKeyedFrame) smileScene.classList.add('waguri-keying');
        }
      }
      scheduleFrame();
    }

    function scheduleFrame() {
      if (scheduledFrame || !sceneIsActive()) return;
      scheduledFrame = true;
      if (typeof animeVideo.requestVideoFrameCallback === 'function') {
        callbackMode = 'video';
        callbackId = animeVideo.requestVideoFrameCallback(processFrame);
      } else {
        callbackMode = 'raf';
        callbackId = requestAnimationFrame(processFrame);
      }
    }

    function syncKeyedVideo() {
      if (sceneIsActive()) {
        scheduleFrame();
      } else {
        stopFrameLoop();
        lastVideoTime = -1;
        if (!smileScene.classList.contains('hien-thi')
            || !smileScene.classList.contains('waguri-frame-visible')) {
          smileScene.classList.remove('waguri-keying');
        }
      }
    }

    animeVideo.addEventListener('loadeddata', syncKeyedVideo);
    animeVideo.addEventListener('playing', syncKeyedVideo);
    animeVideo.addEventListener('timeupdate', syncKeyedVideo);
    document.addEventListener('visibilitychange', syncKeyedVideo);
    new MutationObserver(syncKeyedVideo).observe(smileScene, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
})();
