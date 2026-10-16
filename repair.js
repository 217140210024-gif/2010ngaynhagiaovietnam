/* Tiny visual repair V17.
   Deliberately does NOT modify clickCount, canClick, activeWish, or scene transitions. */
(() => {
  'use strict';

  const onReady = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  onReady(() => {
    /* Force a versioned, case-correct URL so GitHub Pages fetches the PNG asset. */
    const healthArt = document.getElementById('woman-complete-mobile');
    if (healthArt) {
      const correctImageUrl = new URL('Cô gái ôm trái tim.png?v=20261017', document.baseURI).href;
      if (healthArt.src !== correctImageUrl) healthArt.src = correctImageUrl;
      healthArt.decoding = 'async';
      healthArt.loading = 'eager';
      healthArt.addEventListener('error', () => {
        console.error('[Tiny V17] Không tải được ảnh:', healthArt.currentSrc || healthArt.src);
      });
    }

    /* 1) Route the hose from inside the tank nozzle to the actual SVG fuel port.
       Do not look for a made-up selector: the real target is .share-fuel-port. */
    const device = document.getElementById('share-flight-device');
    const hose = device && device.querySelector('.share-fuel-hose');
    const nozzle = device && device.querySelector('.share-fuel-nozzle');
    const plane = document.getElementById('share-aircraft');
    const fuelPort = plane && plane.querySelector('.share-fuel-port');

    if (device && hose && nozzle && plane && fuelPort) {
      const paths = Array.from(hose.querySelectorAll('path'));
      const flowPath = document.getElementById('share-hose-flow-path');
      let scheduled = false;
      let previousKey = '';

      function updateHose() {
        scheduled = false;
        if (!device.isConnected || !hose.isConnected) return;

        const d = device.getBoundingClientRect();
        const n = nozzle.getBoundingClientRect();
        const p = fuelPort.getBoundingClientRect();
        if (d.width < 1 || d.height < 1 || n.width < 1 || p.width < 1) return;

        // Start under the protruding nozzle cap; the nozzle's higher z-index covers the seam.
        const x0 = n.right - Math.max(2, n.width * 0.16);
        const y0 = n.top + n.height * 0.5;
        // Stop at the left edge of the plane's fuel-port circle so the hose appears plugged in.
        const x1 = p.left + Math.max(1, p.width * 0.12);
        const y1 = p.top + p.height * 0.5;
        const width = x1 - x0;
        if (width < 24) return;

        // Extra space below the route creates a natural hanging curve; endpoints are measured.
        const slack = Math.max(34, Math.min(60, width * 0.11));
        const top = Math.min(y0, y1) - 12;
        const bottom = Math.max(y0, y1) + slack;
        const height = Math.max(50, bottom - top);
        const key = [x0, y0, x1, y1, d.width, d.height].map(v => Math.round(v * 10) / 10).join('|');
        if (key === previousKey) return;
        previousKey = key;

        hose.style.left = `${x0 - d.left}px`;
        hose.style.top = `${top - d.top}px`;
        hose.style.right = 'auto';
        hose.style.bottom = 'auto';
        hose.style.width = `${width}px`;
        hose.style.height = `${height}px`;
        hose.setAttribute('viewBox', '0 0 100 100');
        hose.setAttribute('preserveAspectRatio', 'none');

        const yStart = Math.max(2, Math.min(96, ((y0 - top) / height) * 100));
        const yEnd = Math.max(2, Math.min(96, ((y1 - top) / height) * 100));
        const base = Math.max(yStart, yEnd);
        const sag = Math.min(95, base + Math.max(15, (100 - base) * 0.52));
        const path = `M 0 ${yStart.toFixed(2)} C 19 ${yStart.toFixed(2)}, 20 ${sag.toFixed(2)}, 47 ${sag.toFixed(2)} S 79 ${yEnd.toFixed(2)}, 100 ${yEnd.toFixed(2)}`;
        paths.forEach(el => el.setAttribute('d', path));
        if (flowPath) flowPath.setAttribute('d', path);
      }

      function requestUpdate() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(updateHose);
      }

      requestUpdate();
      // Re-measure as the responsive layout and share scene settle into place.
      [120, 450, 1000].forEach(ms => setTimeout(requestUpdate, ms));
      window.addEventListener('resize', requestUpdate, { passive: true });
      window.addEventListener('orientationchange', requestUpdate, { passive: true });
      const resizeObserver = ('ResizeObserver' in window) ? new ResizeObserver(requestUpdate) : null;
      if (resizeObserver) [device, nozzle, plane, fuelPort].forEach(el => resizeObserver.observe(el));
      const shareScene = document.getElementById('share-flight-scene');
      if (shareScene) new MutationObserver(() => {
        previousKey = '';
        requestUpdate();
        setTimeout(requestUpdate, 400);
      }).observe(shareScene, { attributes: true, attributeFilter: ['class'] });
    } else {
      console.warn('[Tiny V17] Không tìm thấy đủ phần tử để nối ống:', {
        device: !!device, hose: !!hose, nozzle: !!nozzle, plane: !!plane, fuelPort: !!fuelPort
      });
    }

    /* 4) Chroma-key the solid background of the animated Waguri video into alpha.
       Processing is isolated to the video scene and stops when that scene is hidden. */
    const smileScene = document.getElementById('smile-stage');
    const video = document.getElementById('waguri-smile-video');
    if (!smileScene || !video || !video.parentElement) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'waguri-figure waguri-keyed-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.tabIndex = -1;
    canvas.style.aspectRatio = '408 / 540';
    video.insertAdjacentElement('afterend', canvas);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let pending = false;
    let handle = 0;
    let handleType = '';
    let lastTime = -1;
    let hasFrame = false;

    const isSceneActive = () => !document.hidden
      && smileScene.classList.contains('hien-thi')
      && smileScene.classList.contains('waguri-frame-visible')
      && video.readyState >= 2 && video.videoWidth > 0;

    const colorDistance = (r, g, b, kr, kg, kb) => {
      const dr = r - kr, dg = g - kg, db = b - kb;
      return Math.sqrt(dr * dr + dg * dg + db * db);
    };

    function keyVideoFrame() {
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return false;
      // A smaller working canvas keeps mobile CPU use bounded; CSS keeps the original aspect ratio.
      const w = Math.min(256, video.videoWidth);
      const h = Math.max(1, Math.round(video.videoHeight * w / video.videoWidth));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.aspectRatio = `${w} / ${h}`;
      }
      ctx.drawImage(video, 0, 0, w, h);
      let frame;
      try { frame = ctx.getImageData(0, 0, w, h); }
      catch (error) {
        console.warn('[Tiny V17] Không thể đọc khung hình video để tách nền.', error);
        return false;
      }

      const data = frame.data;
      // Find the most common quantized border color rather than assuming one RGB value.
      const bins = new Map();
      const addBorder = (x, y) => {
        const i = (y * w + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const bin = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
        const item = bins.get(bin) || { count: 0, r: 0, g: 0, b: 0 };
        item.count++; item.r += r; item.g += g; item.b += b;
        bins.set(bin, item);
      };
      const step = Math.max(1, Math.floor(Math.min(w, h) / 150));
      for (let x = 0; x < w; x += step) { addBorder(x, 0); addBorder(x, h - 1); }
      for (let y = step; y < h - 1; y += step) { addBorder(0, y); addBorder(w - 1, y); }
      let mode = null;
      for (const item of bins.values()) if (!mode || item.count > mode.count) mode = item;
      if (!mode || mode.count < 2) return false;
      const kr = mode.r / mode.count, kg = mode.g / mode.count, kb = mode.b / mode.count;

      // Flood-fill only background-colored pixels connected to the frame edge. This protects
      // dark hair/black outlines even if a few internal pixels happen to resemble the backdrop.
      const total = w * h;
      const visited = new Uint8Array(total);
      const stack = new Int32Array(total);
      let top = 0, tail = 0;
      const addPixel = (index) => {
        if (visited[index]) return;
        visited[index] = 1;
        const i = index * 4;
        if (colorDistance(data[i], data[i + 1], data[i + 2], kr, kg, kb) <= 66) stack[tail++] = index;
      };
      for (let x = 0; x < w; x++) { addPixel(x); addPixel((h - 1) * w + x); }
      for (let y = 1; y < h - 1; y++) { addPixel(y * w); addPixel(y * w + w - 1); }
      while (top < tail) {
        const index = stack[top++];
        const i = index * 4;
        const dist = colorDistance(data[i], data[i + 1], data[i + 2], kr, kg, kb);
        if (dist <= 24) data[i + 3] = 0;
        else if (dist < 66) data[i + 3] = Math.round(data[i + 3] * ((dist - 24) / 42));
        const x = index % w, y = (index / w) | 0;
        if (x > 0) addPixel(index - 1);
        if (x + 1 < w) addPixel(index + 1);
        if (y > 0) addPixel(index - w);
        if (y + 1 < h) addPixel(index + w);
      }
      ctx.putImageData(frame, 0, 0);
      hasFrame = true;
      return true;
    }

    function cancelFrame() {
      if (!pending) return;
      if (handleType === 'video' && typeof video.cancelVideoFrameCallback === 'function') video.cancelVideoFrameCallback(handle);
      else if (handleType === 'raf') cancelAnimationFrame(handle);
      pending = false; handle = 0; handleType = '';
    }
    function renderFrame() {
      pending = false; handle = 0; handleType = '';
      if (!isSceneActive()) {
        if (!smileScene.classList.contains('hien-thi') || !smileScene.classList.contains('waguri-frame-visible'))
          smileScene.classList.remove('waguri-keying');
        return;
      }
      if (video.currentTime !== lastTime) {
        if (keyVideoFrame()) {
          lastTime = video.currentTime;
          if (hasFrame) smileScene.classList.add('waguri-keying');
        }
      }
      scheduleFrame();
    }
    function scheduleFrame() {
      if (pending || !isSceneActive()) return;
      pending = true;
      if (typeof video.requestVideoFrameCallback === 'function') {
        handleType = 'video';
        handle = video.requestVideoFrameCallback(renderFrame);
      } else {
        handleType = 'raf';
        handle = requestAnimationFrame(renderFrame);
      }
    }
    function syncVideo() {
      if (isSceneActive()) scheduleFrame();
      else {
        cancelFrame();
        lastTime = -1;
        if (!smileScene.classList.contains('hien-thi') || !smileScene.classList.contains('waguri-frame-visible'))
          smileScene.classList.remove('waguri-keying');
      }
    }
    video.addEventListener('loadeddata', syncVideo);
    video.addEventListener('playing', syncVideo);
    video.addEventListener('timeupdate', syncVideo);
    document.addEventListener('visibilitychange', syncVideo);
    new MutationObserver(syncVideo).observe(smileScene, { attributes: true, attributeFilter: ['class'] });
  });
})();
