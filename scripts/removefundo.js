function analyzeImage(data, width, height) {
    let totalBrightness = 0;
    let edgeStrength = 0;
    let colorVariance = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        totalBrightness += (r + g + b) / 3;

        if (i % (width * 4) < width * 4 - 4) {
            const nextR = data[i + 4];
            const nextG = data[i + 5];
            const nextB = data[i + 6];
            edgeStrength += Math.abs(r - nextR) + Math.abs(g - nextG) + Math.abs(b - nextB);
        }

        colorVariance += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
    }

    const avgBrightness = totalBrightness / (width * height);
    const avgEdgeStrength = edgeStrength / (width * height);
    const avgColorVariance = colorVariance / (width * height);

    const edgeThreshold = Math.max(0.1, Math.min(0.5, avgEdgeStrength / 255));
    const sensitivity = Math.max(0.1, Math.min(0.9, 1 - (avgColorVariance / 255)));
    const smoothing = Math.max(0.1, Math.min(0.9, avgBrightness / 255));

    return { edgeThreshold, sensitivity, smoothing };
}

function detectEdges(data, width, height, threshold) {
    const edgeData = new Uint8ClampedArray(width * height);
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let pixelX = 0, pixelY = 0;
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    const idx = ((y + j) * width + (x + i)) * 4;
                    const gray = 0.3 * data[idx] + 0.59 * data[idx + 1] + 0.11 * data[idx + 2];
                    pixelX += gray * sobelX[(j + 1) * 3 + (i + 1)];
                    pixelY += gray * sobelY[(j + 1) * 3 + (i + 1)];
                }
            }
            const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
            edgeData[y * width + x] = magnitude > (threshold * 255) ? 255 : 0;
        }
    }
    return edgeData;
}

function regionGrowing(data, edgeData, width, height, sensitivity) {
    const mask = new Uint8ClampedArray(width * height);
    const queue = [];
    const threshold = sensitivity * 255;

    for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 20))) {
        queue.push(y * width);
        queue.push(y * width + width - 1);
    }
    for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 20))) {
        queue.push(x);
        queue.push((height - 1) * width + x);
    }

    while (queue.length > 0) {
        const pixel = queue.pop();
        const x = pixel % width;
        const y = Math.floor(pixel / width);

        if (mask[pixel] === 1 || edgeData[pixel] === 255) continue;

        mask[pixel] = 1;

        const idx = pixel * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const neighbors = [
            {dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: 0, dy: 1},
            {dx: -1, dy: -1}, {dx: -1, dy: 1}, {dx: 1, dy: -1}, {dx: 1, dy: 1}
        ];

        for (const neighbor of neighbors) {
            const nx = x + neighbor.dx;
            const ny = y + neighbor.dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nPixel = ny * width + nx;
                if (mask[nPixel] === 0 && edgeData[nPixel] !== 255) {
                    const nIdx = nPixel * 4;
                    const nr = data[nIdx];
                    const ng = data[nIdx + 1];
                    const nb = data[nIdx + 2];
                    const diff = Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb);
                    if (diff < threshold) {
                        queue.push(nPixel);
                    }
                }
            }
        }
    }

    return mask;
}

function smoothMask(mask, width, height, smoothingFactor) {
    const smoothedMask = new Uint8ClampedArray(mask.length);
    const kernelSize = Math.max(3, Math.floor(smoothingFactor * 10)) | 1;
    const halfKernel = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            let count = 0;

            for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                    const nx = x + kx;
                    const ny = y + ky;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        sum += mask[ny * width + nx];
                        count++;
                    }
                }
            }

            smoothedMask[y * width + x] = sum / count;
        }
    }

    return smoothedMask;
}

function removeBackground(imagePreview, processBtn, loading, resultImage, downloadBtn) {
    if (!imagePreview.src) return;

    loading.style.display = 'block';
    processBtn.disabled = true;

    setTimeout(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imagePreview.naturalWidth;
        canvas.height = imagePreview.naturalHeight;

        ctx.drawImage(imagePreview, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const { edgeThreshold, sensitivity, smoothing } = analyzeImage(data, canvas.width, canvas.height);

        const edgeData = detectEdges(data, canvas.width, canvas.height, edgeThreshold);
        const mask = regionGrowing(data, edgeData, canvas.width, canvas.height, sensitivity);

        const smoothedMask = smoothMask(mask, canvas.width, canvas.height, smoothing);

        for (let i = 0; i < data.length; i += 4) {
            const maskValue = smoothedMask[i / 4];
            data[i + 3] = Math.round(255 * (1 - maskValue));
        }

        ctx.putImageData(imageData, 0, 0);
        resultImage.src = canvas.toDataURL('image/png');
        resultImage.style.display = 'block';
        loading.style.display = 'none';
        processBtn.disabled = false;
        downloadBtn.style.display = 'inline-block';
    }, 100);
}
