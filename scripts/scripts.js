function pixelsToCm(pixels) {
    return Math.round((pixels / 37.8) * 10) / 10;
}

function cmToPixels(cm) {
    return Math.round(cm * 37.8);
}

const outerCanvas = new fabric.Canvas('outer-canvas', {
    backgroundColor: '#16213e',
    selection: false,
    skipTargetFind: true
});

const canvas = new fabric.Canvas('canvas', {
    width: cmToPixels(21),
    height: cmToPixels(29.7),
    backgroundColor: 'white',
    preserveObjectStacking: true
});

// History system for undo
let history = [];
let historyIndex = -1;
const MAX_HISTORY = 10;

// Save the current state to history
function saveToHistory() {
    // Remove any states after current index if we're in middle of history
    history = history.slice(0, historyIndex + 1);

    // Save current canvas state
    history.push(JSON.stringify(canvas));

    // Keep only last MAX_HISTORY states
    if (history.length > MAX_HISTORY) {
        history.shift();
    }

    historyIndex = history.length - 1;
}

// Undo function
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const state = JSON.parse(history[historyIndex]);
        canvas.loadFromJSON(state, () => {
            canvas.renderAll();
            updateLayersList();
        });
    }
}

// Add event listeners for canvas modifications
canvas.on('object:modified', saveToHistory);
canvas.on('object:added', saveToHistory);
canvas.on('object:removed', saveToHistory);

// Keyboard event listener for Ctrl+Z
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
    }
});

// New keyboard event listener for Ctrl+D
document.addEventListener('keydown', function(e) {
    // Check for Ctrl+D
    if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault(); // Prevent browser's default "Add Bookmark" action

        // Get active object
        const activeObject = canvas.getActiveObject();

        // Only proceed if it's an image
        if (activeObject && activeObject instanceof fabric.Image) {
            // Clone the image object
            activeObject.clone(function(cloned) {
                cloned.set({
                    left: activeObject.left + 20,
                    top: activeObject.top + 20,
                    filename: `${activeObject.filename || 'Imagem'} (cópia)`
                });
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
                canvas.requestRenderAll();
                updateLayersList();
                saveToHistory();
            });
        }
    }
});

// Save initial state
saveToHistory();

// Resize outer canvas to fit container
function resizeOuterCanvas() {
    const container = document.getElementById('container');
    outerCanvas.setWidth(container.offsetWidth);
    outerCanvas.setHeight(container.offsetHeight);
    outerCanvas.renderAll();
    centerInnerCanvas();
}

// Center the inner canvas
function centerInnerCanvas() {
    const wrapper = document.querySelector('.canvas-wrapper');
    wrapper.style.left = (outerCanvas.width / 2) + 'px';
    wrapper.style.top = (outerCanvas.height / 2) + 'px';
}

// Initial resize
resizeOuterCanvas();
window.addEventListener('resize', resizeOuterCanvas);

// Zoom functionality
let currentZoom = 1;

// Remove the existing mouse wheel handler on outerCanvas
outerCanvas.off('mouse:wheel');

// Add mouse wheel handlers for both canvases
function handleZoom(opt) {
    opt.e.preventDefault();
    const delta = opt.e.deltaY;
    let newZoom;

    if (delta > 0) {
        newZoom = Math.max(0.1, currentZoom - 0.1);
    } else {
        newZoom = Math.min(5, currentZoom + 0.1);
    }

    const wrapper = document.querySelector('.canvas-wrapper');
    wrapper.style.transform = `translate(-50%, -50%) scale(${newZoom})`;
    currentZoom = newZoom;

    // Update rulers after zoom change
    requestAnimationFrame(updateRulers);
}

// Add zoom handling to outer canvas
outerCanvas.on('mouse:wheel', handleZoom);

// Add zoom handling to inner canvas
canvas.on('mouse:wheel', handleZoom);

// Pan functionality
let isDragging = false;
let lastPosX;
let lastPosY;

outerCanvas.on('mouse:down', function(opt) {
    if (opt.e.altKey) {
        isDragging = true;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
    }
});

outerCanvas.on('mouse:move', function(opt) {
    if (isDragging) {
        const wrapper = document.querySelector('.canvas-wrapper');
        const deltaX = opt.e.clientX - lastPosX;
        const deltaY = opt.e.clientY - lastPosY;

        const currentLeft = parseInt(wrapper.style.left) || outerCanvas.width / 2;
        const currentTop = parseInt(wrapper.style.top) || outerCanvas.height / 2;

        wrapper.style.left = (currentLeft + deltaX) + 'px';
        wrapper.style.top = (currentTop + deltaY) + 'px';

        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;

        // Update rulers when panning
        updateRulers();
    }
});

outerCanvas.on('mouse:up', function() {
    isDragging = false;
});

// Modified file upload handling for multiple files
document.getElementById('fileInput').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            fabric.Image.fromURL(event.target.result, function(img) {
                const scale = Math.min(
                    (canvas.width) / img.width,
                    (canvas.height) / img.height
                ) * 0.8;

                img.scale(scale);
                img.set({
                    left: (canvas.width - img.width * scale) / 2,
                    top: (canvas.height - img.height * scale) / 2,
                    filename: file.name
                });

                canvas.add(img);
                canvas.requestRenderAll();
                updateLayersList();
            });
        };
        reader.readAsDataURL(file);
    });
});

// Layers list with drag and drop
function updateLayersList() {
    const layersList = document.getElementById('layersList');
    layersList.innerHTML = '';

    const objects = canvas.getObjects().slice().reverse();

    objects.forEach((obj, index) => {
        const li = document.createElement('li');
        li.textContent = obj.filename || `Objeto ${objects.length - index}`;
        li.draggable = true;

        li.onclick = function(e) {
            canvas.setActiveObject(obj);
            canvas.requestRenderAll();
            updateSelectedLayer();
        };

        li.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', index);
            this.classList.add('dragging');
        });

        li.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            const items = document.querySelectorAll('.layers-list li');
            items.forEach(item => item.classList.remove('over'));
        });

        li.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('over');
        });

        li.addEventListener('dragleave', function(e) {
            this.classList.remove('over');
        });

        li.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('over');
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = index;

            if (fromIndex !== toIndex) {
                const objects = canvas.getObjects().slice().reverse();
                const [movedObj] = objects.splice(fromIndex, 1);
                objects.splice(toIndex, 0, movedObj);

                canvas._objects = objects.slice().reverse();
                canvas.renderAll();
                updateLayersList();
            }
        });

        layersList.appendChild(li);
    });

    updateSelectedLayer();
}

function updateSelectedLayer() {
    const activeObject = canvas.getActiveObject();
    const layerItems = document.querySelectorAll('.layers-list li');
    const objects = canvas.getObjects().slice().reverse();

    layerItems.forEach((li, index) => {
        if (objects[index] === activeObject) {
            li.classList.add('selected');
        } else {
            li.classList.remove('selected');
        }
    });
}

const rotateBtn = document.getElementById('rotateBtn');
const mirrorBtn = document.getElementById('mirrorBtn');

// Update button state when selection changes
function updateButtonsState() {
    const activeObject = canvas.getActiveObject();
    rotateBtn.disabled = !activeObject;
    mirrorBtn.disabled = !activeObject;
}

// Replace previous event listeners with this combined one
canvas.on('selection:created', updateButtonsState);
canvas.on('selection:cleared', updateButtonsState);
canvas.on('selection:updated', updateButtonsState);

// Rotate functionality
rotateBtn.addEventListener('click', function() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.rotate((activeObject.angle || 0) + 90);
        canvas.requestRenderAll();
    }
});

// Mirror functionality
mirrorBtn.addEventListener('click', function() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set('flipX', !activeObject.flipX);
        canvas.requestRenderAll();
    }
});

canvas.on('selection:created', updateSelectedLayer);
canvas.on('selection:cleared', updateSelectedLayer);
canvas.on('selection:updated', updateSelectedLayer);

// Handle canvas dimension changes
const widthInput = document.getElementById('canvasWidth');
const heightInput = document.getElementById('canvasHeight');
const swapButton = document.getElementById('swapDimensions');

function updateCanvasDimensions(width, height) {
    const pixelWidth = cmToPixels(width);
    const pixelHeight = cmToPixels(height);

    canvas.setWidth(pixelWidth);
    canvas.setHeight(pixelHeight);
    canvas.setDimensions({
        width: pixelWidth,
        height: pixelHeight
    });
    canvas.renderAll();
    saveToHistory(); // Add this line
}

widthInput.addEventListener('change', function() {
    updateCanvasDimensions(parseFloat(this.value), parseFloat(heightInput.value));
});

heightInput.addEventListener('change', function() {
    updateCanvasDimensions(parseFloat(widthInput.value), parseFloat(this.value));
});

swapButton.addEventListener('click', function() {
    const tempWidth = widthInput.value;
    widthInput.value = heightInput.value;
    heightInput.value = tempWidth;
    updateCanvasDimensions(parseFloat(widthInput.value), parseFloat(heightInput.value));
});

// Image dimensions controls
const imageWidthInput = document.getElementById('imageWidth');
const imageHeightInput = document.getElementById('imageHeight');
const swapImageButton = document.getElementById('swapImageDimensions');

function updateImageDimensionsInputs(obj) {
    if (obj) {
        const width = pixelsToCm(obj.width * obj.scaleX);
        const height = pixelsToCm(obj.height * obj.scaleY);

        imageWidthInput.value = Math.round(width * 10) / 10;
        imageHeightInput.value = Math.round(height * 10) / 10;

        imageWidthInput.disabled = false;
        imageHeightInput.disabled = false;
        swapImageButton.disabled = false;
    } else {
        imageWidthInput.value = '';
        imageHeightInput.value = '';
        imageWidthInput.disabled = true;
        imageHeightInput.disabled = true;
        swapImageButton.disabled = true;
    }
}

function updateSelectedObjectDimensions() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        const newWidth = cmToPixels(parseFloat(imageWidthInput.value));
        const newHeight = cmToPixels(parseFloat(imageHeightInput.value));

        const scaleX = newWidth / activeObject.width;
        const scaleY = newHeight / activeObject.height;

        activeObject.set({
            scaleX: scaleX,
            scaleY: scaleY
        });

        canvas.requestRenderAll();
    }
}

// Update the dimension inputs when selection changes
canvas.on('selection:created', function(e) {
    updateImageDimensionsInputs(e.selected[0]);
});

canvas.on('selection:updated', function(e) {
    updateImageDimensionsInputs(e.selected[0]);
});

canvas.on('selection:cleared', function() {
    updateImageDimensionsInputs(null);
});

// Handle dimension input changes
imageWidthInput.addEventListener('change', updateSelectedObjectDimensions);
imageHeightInput.addEventListener('change', updateSelectedObjectDimensions);

// Handle image dimension swap
swapImageButton.addEventListener('click', function() {
    const tempWidth = imageWidthInput.value;
    imageWidthInput.value = imageHeightInput.value;
    imageHeightInput.value = tempWidth;
    updateSelectedObjectDimensions();
});

// Update dimensions when object is scaled or rotated
canvas.on('object:modified', function(e) {
    if (e.target === canvas.getActiveObject()) {
        updateImageDimensionsInputs(e.target);
    }
});

// Tool handling
let currentTool = 'select';
const toolButtons = {
    select: document.getElementById('selectTool'),
    brush: document.getElementById('brushTool'),
    eraser: document.getElementById('eraserTool'),
    text: document.getElementById('textTool')
};

let paintingCanvas, paintingCtx, originalImage;

function setActiveTool(tool) {
    currentTool = tool;

    // Update button states
    Object.keys(toolButtons).forEach(key => {
        toolButtons[key].classList.remove('active');
    });
    toolButtons[tool].classList.add('active');

    // Set canvas interaction mode
    if (tool === 'select') {
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.forEachObject(obj => {
            obj.selectable = true;
            obj.evented = true;
        });
    } else if (tool === 'brush' || tool === 'eraser') {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'image') {
            openPaintingModal(activeObject);
        }
    } else if (tool === 'text') {
        addDefaultText();
    }
}

// Updated addDefaultText function
function addDefaultText() {
    const text = new fabric.IText('CloudApp', {
        left: canvas.width / 2,
        top: canvas.height / 2,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: '#000000',
        originX: 'center',
        originY: 'center',
        stroke: null,
        strokeWidth: 0,
        strokeUniform: true, // Add this to maintain consistent stroke width
        paintFirst: 'stroke', // Make sure stroke is painted first (outside)
        filename: `Texto ${Date.now()}` // Add unique identifier for layers list
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    updateLayersList(); // Make sure layers list is updated
    saveToHistory(); // Add this line
}

// Added showTextMenu function
function showTextMenu(textObject) {
    textMenu.style.display = 'block';

    // Set initial values based on selected text object
    textColor.value = textObject.fill;
    fontFamily.value = textObject.fontFamily;
    fontSize.value = textObject.fontSize;

    // Set outline values
    outlineToggle.checked = textObject.stroke ? true : false;
    outlineWidth.value = textObject.strokeWidth || 1;
    outlineColor.value = textObject.stroke || '#000000';

    // Color handler
    textColor.onchange = function() {
        textObject.set('fill', this.value);
        canvas.requestRenderAll();
    };

    // Font family handler
    fontFamily.onchange = function() {
        textObject.set('fontFamily', this.value);
        canvas.requestRenderAll();
    };

    // Font size handler
    fontSize.onchange = function() {
        textObject.set('fontSize', parseInt(this.value));
        canvas.requestRenderAll();
    };

    // Outline toggle handler
    outlineToggle.onchange = function() {
        if (this.checked) {
            textObject.set({
                stroke: outlineColor.value,
                strokeWidth: parseInt(outlineWidth.value),
                strokeUniform: true,
                paintFirst: 'stroke'
            });
        } else {
            textObject.set({
                stroke: null,
                strokeWidth: 0
            });
        }
        canvas.requestRenderAll();
    };

    // Outline width handler
    outlineWidth.onchange = function() {
        if (outlineToggle.checked) {
            textObject.set({
                strokeWidth: parseInt(this.value),
                strokeUniform: true,
                paintFirst: 'stroke'
            });
            canvas.requestRenderAll();
        }
    };

    // Outline color handler
    outlineColor.onchange = function() {
        if (outlineToggle.checked) {
            textObject.set({
                stroke: this.value,
                strokeUniform: true,
                paintFirst: 'stroke'
            });
            canvas.requestRenderAll();
        }
    };
}

// Update the addDefaultText function
function deleteSelectedLayer() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
        updateLayersList();
        saveToHistory(); // Add this line
    }
}

// Updated centerSelectedLayer function
function centerSelectedLayer() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        // Center both horizontally and vertically
        activeObject.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center'
        });

        canvas.requestRenderAll();
        saveToHistory();
    }
}

// Make sure the button is connected to the function
const centerLayerBtn = document.getElementById('centerLayerBtn');
centerLayerBtn.addEventListener('click', centerSelectedLayer);

// Function for centering objects
function centerSelectedLayer() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        // Center both horizontally and vertically
        activeObject.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center'
        });

        canvas.requestRenderAll();
        saveToHistory();
    }
}

// Add event listeners for text selection
canvas.on('selection:cleared', function() {
    textMenu.style.display = 'none';
});

canvas.on('selection:created', function(e) {
    if (e.selected[0] instanceof fabric.IText) {
        showTextMenu(e.selected[0]);
    } else {
        textMenu.style.display = 'none';
    }
});

canvas.on('selection:updated', function(e) {
    if (e.selected[0] instanceof fabric.IText) {
        showTextMenu(e.selected[0]);
    } else {
        textMenu.style.display = 'none';
    }
});

// Add event listeners for tool buttons
Object.keys(toolButtons).forEach(tool => {
    toolButtons[tool].addEventListener('click', () => setActiveTool(tool));
});

// New layer button functionality
const newLayerBtn = document.getElementById('newLayerBtn');
newLayerBtn.addEventListener('click', function() {
    const newLayer = new fabric.Rect({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        fill: 'transparent',
        stroke: '#2861b3',
        strokeWidth: 1,
        filename: `Nova Camada ${Date.now()}`
    });

    canvas.add(newLayer);
    canvas.setActiveObject(newLayer);
    canvas.renderAll();
    updateLayersList();
    saveToHistory(); // Add this line
});

const deleteLayerBtn = document.getElementById('deleteLayerBtn');
deleteLayerBtn.addEventListener('click', deleteSelectedLayer);

// Add keyboard event listener for Delete key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Delete') {
        deleteSelectedLayer();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        centerSelectedLayer();
    }
});

// Initial render
canvas.renderAll();

// Function for painting modal
function openPaintingModal(imageObject) {
    const modal = document.getElementById('paintingModal');
    modal.style.display = 'block';

    const paintingCanvas = document.getElementById('paintingCanvas');
    const ctx = paintingCanvas.getContext('2d');

    // Load the image data
    const tempImg = new Image();
    tempImg.onload = function() {
        // Set canvas size to match image while maintaining aspect ratio
        const maxHeight = 600;
        const maxWidth = modal.offsetWidth - 40; // Subtract padding and borders
        let width = tempImg.width;
        let height = tempImg.height;

        if (height > maxHeight) {
            const ratio = maxHeight / height;
            height = maxHeight;
            width = tempImg.width * ratio;
        }

        if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = tempImg.height * ratio;
        }

        paintingCanvas.width = width;
        paintingCanvas.height = height;

        // Clear canvas first
        ctx.clearRect(0, 0, paintingCanvas.width, paintingCanvas.height);

        // Draw image
        ctx.drawImage(tempImg, 0, 0, width, height);

        // Save original image for eraser functionality
        originalImage = tempImg;
    };
    tempImg.src = imageObject.toDataURL();

    // Set up painting
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const brushSizeInput = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');

    // Update brush size display
    brushSizeInput.addEventListener('input', function() {
        brushSizeValue.textContent = this.value + 'px';
    });

    // Drawing functions
    paintingCanvas.addEventListener('mousedown', startDrawing);
    paintingCanvas.addEventListener('mousemove', draw);
    paintingCanvas.addEventListener('mouseup', stopDrawing);
    paintingCanvas.addEventListener('mouseout', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;

        if (currentTool === 'brush') {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = brushSizeInput.value;
            ctx.lineCap = 'round';
            ctx.stroke();
        } else if (currentTool === 'eraser') {
            // For eraser, use clearRect to create transparency
            const brushSize = parseInt(brushSizeInput.value);
            ctx.save();
            ctx.beginPath();
            ctx.arc(e.offsetX, e.offsetY, brushSize/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.clearRect(e.offsetX - brushSize/2, e.offsetY - brushSize/2, brushSize, brushSize);
            ctx.restore();
        }

        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Save painting
    document.getElementById('savePaintingBtn').onclick = function() {
        // Convert the painting canvas to a PNG data URL with transparency
        const dataURL = paintingCanvas.toDataURL('image/png');

        // Update the fabric image object
        fabric.Image.fromURL(dataURL, function(img) {
            img.set({
                left: imageObject.left,
                top: imageObject.top,
                scaleX: imageObject.scaleX,
                scaleY: imageObject.scaleY,
                angle: imageObject.angle,
                filename: imageObject.filename
            });

            canvas.remove(imageObject);
            canvas.add(img);
            canvas.renderAll();
            updateLayersList();

            // Close the modal
            modal.style.display = 'none';

            // Save to history
            saveToHistory();
        });
    };

    // Close modal
    document.getElementById('closePaintingModal').onclick = function() {
        modal.style.display = 'none';
    };
}

// Export functions
const exportModal = document.getElementById('exportModal');
const exportBtn = document.getElementById('exportBtn');
const dpiInput = document.getElementById('dpiInput');

// Show modal
exportBtn.onclick = () => exportModal.style.display = 'flex';

// Close modal when clicking outside
exportModal.onclick = (e) => {
    if (e.target === exportModal) {
        exportModal.style.display = 'none';
    }
};

document.getElementById('pngBtn').onclick = () => {
    downloadCanvas('png', true);
};

document.getElementById('jpgBtn').onclick = () => {
    downloadCanvas('jpeg', false);
};

document.getElementById('pdfBtn').onclick = async () => {
    const { jsPDF } = window.jspdf;

    // Get canvas dimensions in centimeters
    const widthInCm = canvas.width / 37.8;  // Convert pixels to cm
    const heightInCm = canvas.height / 37.8; // Convert pixels to cm

    const pdf = new jsPDF({
        orientation: widthInCm > heightInCm ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [widthInCm * 10, heightInCm * 10] // Convert cm to mm for jsPDF
    });

    const imgData = getCanvasDataURL('jpeg', false);

    // Add image maintaining size in millimeters
    pdf.addImage(imgData, 'JPEG', 0, 0, widthInCm * 10, heightInCm * 10); // Convert cm to mm
    pdf.save('export.pdf');
};

function getCanvasDataURL(format, transparent) {
    const dpi = 600; // Fixed at 600 DPI
    const scale = dpi / 96; // Standard screen DPI is 96

    // Create a temporary canvas at the scaled size
    const tempCanvas = document.createElement('canvas');
    const scaledWidth = Math.ceil(canvas.width * scale);
    const scaledHeight = Math.ceil(canvas.height * scale);
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;
    const ctx = tempCanvas.getContext('2d');

    // If not transparent or if JPEG, fill white background
    if (!transparent || format === 'jpeg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // Apply the scale transform
    ctx.scale(scale, scale);

    // Render each object manually
    canvas.getObjects().forEach(obj => {
        const objLeft = obj.left || 0;
        const objTop = obj.top || 0;

        ctx.save();

        // Handle rotation around object center
        const centerX = objLeft + (obj.width * obj.scaleX) / 2;
        const centerY = objTop + (obj.height * obj.scaleY) / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate((obj.angle || 0) * Math.PI / 180);
        ctx.translate(-centerX, -centerY);

        // Draw the object
        if (obj.type === 'image') {
            ctx.drawImage(
                obj._element,
                objLeft,
                objTop,
                obj.width * obj.scaleX,
                obj.height * obj.scaleY
            );
        } else {
            obj.render(ctx);
        }

        ctx.restore();
    });

    return tempCanvas.toDataURL(`image/${format}`, 1.0);
}

function downloadCanvas(format, transparent) {
    const link = document.createElement('a');
    link.href = getCanvasDataURL(format, transparent);
    link.download = `export.${format}`;
    link.click();
}

// Add jsPDF library for PDF export
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
document.head.appendChild(script);

// Show/hide image menu based on selection
canvas.on('selection:created', function(e) {
    if (e.selected[0] instanceof fabric.Image) {
        imageMenu.style.display = 'block';
    } else {
        imageMenu.style.display = 'none';
    }
});

canvas.on('selection:cleared', function() {
    imageMenu.style.display = 'none';
});

canvas.on('selection:updated', function(e) {
    if (e.selected[0] instanceof fabric.Image) {
        imageMenu.style.display = 'block';
    } else {
        imageMenu.style.display = 'none';
    }
});

// Duplicate image button
document.getElementById('duplicateImageBtn').onclick = function() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.Image)) return;

    activeObject.clone(function(cloned) {
        cloned.set({
            left: activeObject.left + 20,
            top: activeObject.top + 20,
            filename: `${activeObject.filename || 'Imagem'} (cópia)`
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        updateLayersList();
        saveToHistory();
    });
};

// Export image button
document.getElementById('exportImageBtn').onclick = function() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.Image)) return;

    // Create temporary canvas with only the selected object
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');

    // Set canvas size to match object dimensions
    const dpi = 600;
    const scale = dpi / 96;
    tempCanvas.width = activeObject.width * activeObject.scaleX * scale;
    tempCanvas.height = activeObject.height * activeObject.scaleY * scale;

    // Scale context for high DPI
    ctx.scale(scale, scale);

    // Draw the image
    ctx.drawImage(
        activeObject._element,
        0,
        0,
        activeObject.width * activeObject.scaleX,
        activeObject.height * activeObject.scaleY
    );

    // Download the image
    const link = document.createElement('a');
    link.href = tempCanvas.toDataURL('image/png');
    link.download = `${activeObject.filename || 'imagem'}.png`;
    link.click();
};

document.addEventListener('paste', function(e) {
    e.preventDefault();

    // Handle clipboard items
    if (e.clipboardData.items) {
        const items = e.clipboardData.items;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Handle images
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();

                reader.onload = function(event) {
                    fabric.Image.fromURL(event.target.result, function(img) {
                        const scale = Math.min(
                            (canvas.width) / img.width,
                            (canvas.height) / img.height
                        ) * 0.8;

                        img.scale(scale);
                        img.set({
                            left: (canvas.width - img.width * scale) / 2,
                            top: (canvas.height - img.height * scale) / 2,
                            filename: `Imagem colada ${Date.now()}`
                        });

                        canvas.add(img);
                        canvas.setActiveObject(img);
                        canvas.requestRenderAll();
                        updateLayersList();
                        saveToHistory();
                    });
                };

                reader.readAsDataURL(blob);
                return; // Exit after handling image
            }
        }

        // If no image was found, try to get text
        const text = e.clipboardData.getData('text');
        if (text) {
            const textObject = new fabric.IText(text, {
                left: canvas.width / 2,
                top: canvas.height / 2,
                fontFamily: 'Arial',
                fontSize: 20,
                fill: '#000000',
                originX: 'center',
                originY: 'center',
                filename: `Texto colado ${Date.now()}`
            });

            canvas.add(textObject);
            canvas.setActiveObject(textObject);
            canvas.requestRenderAll();
            updateLayersList();
            saveToHistory();
        }
    }
});

// Function to handle ruler updates
function updateRulers() {
    const horizontalRuler = document.getElementById('horizontalRuler');
    const verticalRuler = document.getElementById('verticalRuler');

    // Clear existing marks
    horizontalRuler.innerHTML = '';
    verticalRuler.innerHTML = '';

    // Calculate visible area in centimeters
    const cmPerPixel = 1 / 37.8; // Convert pixels to cm
    const ruler = document.getElementById('horizontalRuler');
    const rulerWidth = ruler.offsetWidth;
    const rulerHeight = document.getElementById('verticalRuler').offsetHeight;

    // Calculate step size based on zoom
    const stepSize = currentZoom < 1 ? 1 : 0.5;

    // Calculate number of marks needed
    const horizontalMarks = Math.ceil(rulerWidth * cmPerPixel / stepSize);
    const verticalMarks = Math.ceil(rulerHeight * cmPerPixel / stepSize);

    // Create marks for horizontal ruler
    for (let i = 0; i <= horizontalMarks; i++) {
        const cm = i * stepSize;
        const pixelPosition = cm / cmPerPixel;

        if (pixelPosition <= rulerWidth) {
            const mark = document.createElement('div');
            mark.className = 'ruler-mark';
            mark.style.left = `${pixelPosition}px`;

            if (i % (currentZoom < 1 ? 1 : 2) === 0) {
                mark.style.height = '10px';
            }

            horizontalRuler.appendChild(mark);
        }
    }

    // Create marks for vertical ruler
    for (let i = 0; i <= verticalMarks; i++) {
        const cm = i * stepSize;
        const pixelPosition = cm / cmPerPixel;

        if (pixelPosition <= rulerHeight) {
            const mark = document.createElement('div');
            mark.className = 'ruler-mark';
            mark.style.top = `${pixelPosition}px`;

            if (i % (currentZoom < 1 ? 1 : 2) === 0) {
                mark.style.width = '10px';
            }

            verticalRuler.appendChild(mark);
        }
    }
}

paintBucketTool.addEventListener('click', () => {
                const activeObject = canvas.getActiveObject();
                if (!activeObject) {
                    alert('Selecione um objeto para editar');
                    return;
                }

                // Set fixed dimensions for the canvas
                paintBucketCanvas.width = 500;
                paintBucketCanvas.height = 500;

                // Calculate scaling to fit the image within 500x500
                const scale = Math.min(
                    500 / activeObject.width,
                    500 / activeObject.height
                );

                // Clear the canvas
                paintBucketCtx.clearRect(0, 0, 500, 500);

                // Center the image
                const scaledWidth = activeObject.width * scale;
                const scaledHeight = activeObject.height * scale;
                const offsetX = (500 - scaledWidth) / 2;
                const offsetY = (500 - scaledHeight) / 2;

                if (activeObject.type === 'image') {
                    paintBucketCtx.drawImage(
                        activeObject.getElement(),
                        offsetX,
                        offsetY,
                        scaledWidth,
                        scaledHeight
                    );
                } else {
                    paintBucketCtx.fillStyle = 'white';
                    paintBucketCtx.fillRect(0, 0, 500, 500);
                }

                document.getElementById('imageMenu').style.display = 'none';
                paintBucketModal.style.display = 'block';
            });

            toleranceInput.addEventListener('input', () => {
                toleranceValue.textContent = toleranceInput.value;
            });

            function getPixel(imageData, x, y) {
                const index = (y * imageData.width + x) * 4;
                return {
                    r: imageData.data[index],
                    g: imageData.data[index + 1],
                    b: imageData.data[index + 2],
                    a: imageData.data[index + 3]
                };
            }

            function setPixel(imageData, x, y, color) {
                const index = (y * imageData.width + x) * 4;
                imageData.data[index] = color.r;
                imageData.data[index + 1] = color.g;
                imageData.data[index + 2] = color.b;
                imageData.data[index + 3] = color.a;
            }

            function colorMatch(c1, c2, tolerance) {
                return Math.abs(c1.r - c2.r) <= tolerance &&
                       Math.abs(c1.g - c2.g) <= tolerance &&
                       Math.abs(c1.b - c2.b) <= tolerance;
            }

            function floodFill(imageData, startX, startY, fillColor, tolerance) {
                const width = imageData.width;
                const height = imageData.height;
                const visited = new Uint8Array(width * height);
                const queue = [];

                const targetColor = getPixel(imageData, startX, startY);
                const fillColorRGB = {
                    r: parseInt(fillColor.slice(1,3), 16),
                    g: parseInt(fillColor.slice(3,5), 16),
                    b: parseInt(fillColor.slice(5,7), 16),
                    a: 255
                };

                // If target color is the same as fill color, return
                if (colorMatch(targetColor, fillColorRGB, 0)) {
                    return;
                }

                queue.push([startX, startY]);
                visited[startY * width + startX] = 1;

                const processChunk = () => {
                    let processCount = 0;
                    const chunkSize = 1000; // Process 1000 pixels per chunk

                    while (queue.length > 0 && processCount < chunkSize) {
                        const [x, y] = queue.shift();
                        const currentPixel = getPixel(imageData, x, y);

                        if (colorMatch(currentPixel, targetColor, tolerance)) {
                            setPixel(imageData, x, y, fillColorRGB);

                            // Check neighboring pixels
                            const neighbors = [
                                [x - 1, y], [x + 1, y],
                                [x, y - 1], [x, y + 1]
                            ];

                            for (const [nx, ny] of neighbors) {
                                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                    const index = ny * width + nx;
                                    if (!visited[index]) {
                                        visited[index] = 1;
                                        queue.push([nx, ny]);
                                    }
                                }
                            }
                        }
                        processCount++;
                    }

                    // Update canvas with current progress
                    paintBucketCtx.putImageData(imageData, 0, 0);

                    // Continue processing if there are more pixels in queue
                    if (queue.length > 0) {
                        requestAnimationFrame(processChunk);
                    }
                };

                // Start processing
                requestAnimationFrame(processChunk);
            }

            paintBucketCanvas.addEventListener('click', (e) => {
                const rect = paintBucketCanvas.getBoundingClientRect();
                const x = Math.floor((e.clientX - rect.left) * (paintBucketCanvas.width / rect.width));
                const y = Math.floor((e.clientY - rect.top) * (paintBucketCanvas.height / rect.height));

                const imageData = paintBucketCtx.getImageData(0, 0, paintBucketCanvas.width, paintBucketCanvas.height);
                floodFill(imageData, x, y, fillColorInput.value, parseInt(toleranceInput.value));
            });

            closePaintBucketModal.addEventListener('click', () => {
                paintBucketModal.style.display = 'none';
                document.getElementById('imageMenu').style.display = 'flex';
            });

            savePaintBucketBtn.addEventListener('click', () => {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    // Get the original dimensions
                    const originalWidth = activeObject.width;
                    const originalHeight = activeObject.height;
                    
                    fabric.Image.fromURL(paintBucketCanvas.toDataURL(), (img) => {
                        // Scale the image back to its original dimensions
                        img.scaleToWidth(activeObject.getScaledWidth());
                        img.scaleToHeight(activeObject.getScaledHeight());
                        
                        img.set({
                            left: activeObject.left,
                            top: activeObject.top,
                            angle: activeObject.angle
                        });
                        
                        canvas.remove(activeObject);
                        canvas.add(img);
                        canvas.setActiveObject(img);
                        canvas.renderAll();
                        paintBucketModal.style.display = 'none';
                        document.getElementById('imageMenu').style.display = 'flex';
                    });
                }
            });
        })();

        (function() {
            const cropTool = document.getElementById('cropTool');
            const cropModal = document.getElementById('cropModal');
            const closeCropModal = document.getElementById('closeCropModal');
            const saveCropBtn = document.getElementById('saveCropBtn');
            const cropImage = document.getElementById('cropImage');

            let cropper = null;

            cropTool.addEventListener('click', () => {
                const activeObject = canvas.getActiveObject();
                if (!activeObject || activeObject.type !== 'image') {
                    alert('Selecione uma imagem para recortar');
                    return;
                }

                // Get the image source from the active object
                const imgElement = activeObject.getElement();
                cropImage.src = imgElement.src;

                document.getElementById('imageMenu').style.display = 'none';
                cropModal.style.display = 'block';

                // Initialize cropper after image is loaded
                cropImage.onload = () => {
                    if (cropper) {
                        cropper.destroy();
                    }
                    cropper = new Cropper(cropImage, {
                        viewMode: 1,
                        dragMode: 'move',
                        aspectRatio: NaN,
                        autoCropArea: 1,
                        restore: false,
                        guides: true,
                        center: true,
                        highlight: false,
                        cropBoxMovable: true,
                        cropBoxResizable: true,
                        toggleDragModeOnDblclick: false,
                        minContainerWidth: 500,
                        minContainerHeight: 500,
                        maxContainerWidth: 500,
                        maxContainerHeight: 500,
                    });
                };
            });

            closeCropModal.addEventListener('click', () => {
                if (cropper) {
                    cropper.destroy();
                    cropper = null;
                }
                cropModal.style.display = 'none';
                document.getElementById('imageMenu').style.display = 'flex';
            });

            saveCropBtn.addEventListener('click', () => {
                if (!cropper) return;

                const croppedCanvas = cropper.getCroppedCanvas();
                const activeObject = canvas.getActiveObject();

                if (activeObject && croppedCanvas) {
                    fabric.Image.fromURL(croppedCanvas.toDataURL(), (img) => {
                        // Calculate scaling to maintain relative size
                        const scale = activeObject.getScaledWidth() / activeObject.width;
                        img.scale(scale);
                        
                        img.set({
                            left: activeObject.left,
                            top: activeObject.top,
                            angle: activeObject.angle
                        });
                        
                        canvas.remove(activeObject);
                        canvas.add(img);
                        canvas.setActiveObject(img);
                        canvas.renderAll();
                        
                        cropper.destroy();
                        cropper = null;
                        cropModal.style.display = 'none';
                        document.getElementById('imageMenu').style.display = 'flex';
                    });
                }
            });
        })();

        // Function for painting modal
        function openPaintingModal(imageObject) {
            const modal = document.getElementById('paintingModal');
            document.getElementById('imageMenu').style.display = 'none';
            modal.style.display = 'block';

            const paintingCanvas = document.getElementById('paintingCanvas');
            const ctx = paintingCanvas.getContext('2d');

            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;

            // Load the image data
            const tempImg = new Image();
            tempImg.onload = function() {
                // Store original dimensions
                const originalWidth = tempImg.width;
                const originalHeight = tempImg.height;
                paintingCanvas.dataset.originalWidth = originalWidth;
                paintingCanvas.dataset.originalHeight = originalHeight;

                // Calculate display dimensions while maintaining aspect ratio
                const maxHeight = 500;
                const maxWidth = window.innerWidth * 0.8;
                let displayWidth = originalWidth;
                let displayHeight = originalHeight;

                // Calculate scale to fit within bounds
                const scale = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
                displayWidth = originalWidth * scale;
                displayHeight = originalHeight * scale;

                // Set the display size of the canvas using CSS
                paintingCanvas.style.width = `${displayWidth}px`;
                paintingCanvas.style.height = `${displayHeight}px`;

                // Set the internal canvas size to match original image dimensions
                paintingCanvas.width = originalWidth;
                paintingCanvas.height = originalHeight;

                // Clear canvas and draw image at original size
                ctx.clearRect(0, 0, originalWidth, originalHeight);

                // Enable transparency
                ctx.globalCompositeOperation = 'source-over';
                // Clear the canvas with transparent background
                ctx.clearRect(0, 0, originalWidth, originalHeight);
                // Draw the image
                ctx.drawImage(tempImg, 0, 0, originalWidth, originalHeight);
            };
            tempImg.src = imageObject.toDataURL();

            // Drawing functions
            function startDrawing(e) {
                isDrawing = true;
                const pos = getMousePos(paintingCanvas, e);
                [lastX, lastY] = [pos.x, pos.y];
            }

            function draw(e) {
                if (!isDrawing) return;
                
                const pos = getMousePos(paintingCanvas, e);
                const brushSize = parseInt(document.getElementById('brushSize').value);
                
                ctx.lineWidth = brushSize;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Set mode based on active tool
                if (document.getElementById('eraserTool').classList.contains('active')) {
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.strokeStyle = 'rgba(0,0,0,1)';
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = document.getElementById('brushColor').value;
                }

                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();

                [lastX, lastY] = [pos.x, pos.y];
            }

            function stopDrawing() {
                isDrawing = false;
            }

            function getMousePos(canvas, evt) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                return {
                    x: (evt.clientX - rect.left) * scaleX,
                    y: (evt.clientY - rect.top) * scaleY
                };
            }

            // Add event listeners
            paintingCanvas.addEventListener('mousedown', startDrawing);
            paintingCanvas.addEventListener('mousemove', draw);
            paintingCanvas.addEventListener('mouseup', stopDrawing);
            paintingCanvas.addEventListener('mouseout', stopDrawing);

            // Save button handler
            document.getElementById('savePaintingBtn').onclick = function() {
                // Ensure we save with transparency
                const dataURL = paintingCanvas.toDataURL('image/png');
                fabric.Image.fromURL(dataURL, function(img) {
                    // Maintain original dimensions and position
                    img.scaleToWidth(imageObject.getScaledWidth());
                    img.scaleToHeight(imageObject.getScaledHeight());
                    
                    img.set({
                        left: imageObject.left,
                        top: imageObject.top,
                        angle: imageObject.angle,
                        filename: imageObject.filename
                    });

                    canvas.remove(imageObject);
                    canvas.add(img);
                    canvas.renderAll();
                    modal.style.display = 'none';
                    document.getElementById('imageMenu').style.display = 'flex';
                });
            };

            // Close modal
            document.getElementById('closePaintingModal').onclick = function() {
                modal.style.display = 'none';
                document.getElementById('imageMenu').style.display = 'flex';
                // Remove event listeners
                paintingCanvas.removeEventListener('mousedown', startDrawing);
                paintingCanvas.removeEventListener('mousemove', draw);
                paintingCanvas.removeEventListener('mouseup', stopDrawing);
                paintingCanvas.removeEventListener('mouseout', stopDrawing);
            };
        }

// Initial ruler update
updateRulers();

// Add window resize handler for rulers
window.addEventListener('resize', updateRulers);
