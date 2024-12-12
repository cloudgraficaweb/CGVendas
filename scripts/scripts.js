<html><head><base href="." />
    <meta charset="UTF-8">
    <title>Editor Canvas</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
            font-family: Arial, sans-serif;
        }

        .menu-top {
            height: 60px;
            background-color: #0f3460;
            padding: 0 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .content-wrapper {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        .menu-left {
            width: 150px;
            background-color: #0f3460;
            height: 100%;
            padding: 20px;
            color: white;
            box-shadow: 2px 0 5px rgba(0,0,0,0.2);
        }

        .menu-right {
            width: 250px;
            background-color: #0f3460;
            height: 100%;
            padding: 20px;
            color: white;
            box-shadow: -2px 0 5px rgba(0,0,0,0.2);
        }

        .container {
            flex: 1;
            background-color: #16213e;
            position: relative;
            overflow: hidden;
            padding-left: 15px; /* Add space for vertical ruler */
            padding-top: 15px; /* Add space for horizontal ruler */
        }

        .canvas-wrapper {
            position: absolute;
            transform-origin: center center;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }

        #outer-canvas {
            background-color: #16213e;
        }

        #fileInput {
            display: none;
        }

        .upload-btn {
            background-color: #1a4b8c;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            height: 36px;
        }

        .upload-btn:hover {
            background-color: #2861b3;
        }

        .dimensions-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .dimension-label {
            font-size: 18px;
            color: white;
        }

        .dimension-input {
            width: 70px;
            height: 30px;
            padding: 4px 8px;
            border: 1px solid #2861b3;
            border-radius: 4px;
            background: #1a4b8c;
            color: white;
            font-size: 14px;
            -moz-appearance: textfield;
        }

        .dimension-input::-webkit-inner-spin-button {
            opacity: 1;
        }

        .dimension-swap {
            background-color: #1a4b8c;
            color: white;
            border: 1px solid #2861b3;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            height: 30px;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .dimension-swap:hover,
        .dimension-input:hover,
        .upload-btn:hover {
            background-color: #2861b3;
        }

        .menu-divider {
            width: 1px;
            height: 36px;
            background-color: #2861b3;
            margin: 0 10px;
        }

        .rotate-btn {
            background-color: #1a4b8c;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            height: 36px;
            margin-left: 10px;
        }

        .rotate-btn:hover {
            background-color: #2861b3;
        }

        .rotate-btn:disabled {
            background-color: #1a4b8c;
            opacity: 0.5;
            cursor: not-allowed;
        }

        .layers-container {
            display: flex;
            flex-direction: column;
            height: calc(100% - 30px); /* Reduce height to make room for margin */
            margin-bottom: 30px; /* Add margin at the bottom */
        }

        .layers-list-wrapper {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 10px; /* Add margin before the buttons */
        }

        .layers-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .layers-list li {
            padding: 10px;
            border-bottom: 1px solid #2861b3;
            cursor: pointer;
            user-select: none;
        }

        .layers-list li:hover {
            background-color: #1a4b8c;
        }

        .layers-list li.selected {
            color: yellow;
        }

        .layers-list li.over {
            border-top: 2px solid yellow;
        }

        .layers-list li.dragging {
            opacity: 0.5;
            background-color: #1a4b8c;
        }

        .layers-buttons {
            display: flex;
            gap: 10px;
            margin-top: auto; /* Push to bottom */
            padding-bottom: 5px; /* Add some padding between buttons and container edge */
        }

        .layer-btn {
            flex: 1;
            background-color: #1a4b8c;
            color: white;
            padding: 8px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 13px;
        }

        .layer-btn:hover {
            background-color: #2861b3;
        }

        .tool-btn {
            width: 100%;
            background-color: #1a4b8c;
            color: white;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 10px;
            text-align: left;
            font-size: 14px;
        }

        .tool-btn:hover {
            background-color: #2861b3;
        }

        .tool-btn.active {
            color: yellow;
        }

        .menu-left-divider {
            width: 100%;
            height: 1px;
            background-color: #2861b3;
            margin: 10px 0;
        }

        .text-controls-row {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 10px;
        }

        .outline-controls {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #2861b3;
        }

        .outline-toggle {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .outline-toggle input[type="checkbox"] {
            width: 16px;
            height: 16px;
        }
        
        #textInput {
            display: none; /* Hide the text input */
        }

        .export-btn {
            background-color: #1a4b8c;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            height: 36px;
            margin-left: auto; /* Push to right */
        }

        .export-btn:hover {
            background-color: #2861b3;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }

        .modal-content {
            background: #0f3460;
            padding: 20px;
            border-radius: 10px;
            width: 300px;
        }

        .modal-title {
            color: white;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
        }

        .dpi-input {
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            border: 1px solid #2861b3;
            border-radius: 4px;
            background: #1a4b8c;
            color: white;
        }

        .export-option {
            width: 100%;
            padding: 10px;
            margin-bottom: 8px;
            background: #1a4b8c;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            text-align: left;
        }

        .export-option:hover {
            background: #2861b3;
        }

        .ruler {
            position: absolute;
            background: #1a4b8c;
            z-index: 1;
        }

        .ruler-horizontal {
            top: 0;
            left: 15px; /* Make space for vertical ruler */
            height: 15px;
            right: 0;
        }

        .ruler-vertical {
            left: 0;
            top: 15px; /* Make space for horizontal ruler */
            width: 15px;
            bottom: 0;
        }

        .ruler-mark {
            position: absolute;
            background: rgba(255, 255, 255, 0.5);
        }
    </style>
</head>
<body>
    <div class="menu-top">
        <input type="file" id="fileInput" accept="image/*" multiple>
        <button class="upload-btn" onclick="document.getElementById('fileInput').click()">
            Carregar Imagem
        </button>
        
        <div class="dimensions-controls">
            <span class="dimension-label">↔</span>
            <input type="number" id="canvasWidth" class="dimension-input" value="21" step="0.1">
            <button id="swapDimensions" class="dimension-swap">⇅</button>
            <span class="dimension-label">↕</span>
            <input type="number" id="canvasHeight" class="dimension-input" value="29.7" step="0.1">
        </div>

        <div class="menu-divider"></div>
        
        <span class="dimension-label">Imagem:</span>
        <button id="rotateBtn" class="rotate-btn" disabled>Girar 90º</button>
        <button id="mirrorBtn" class="rotate-btn" disabled>Espelhar</button>
        
        <div class="dimensions-controls">
            <span class="dimension-label">↔</span>
            <input type="number" id="imageWidth" class="dimension-input" step="0.1" disabled>
            <button id="swapImageDimensions" class="dimension-swap" disabled>⇅</button>
            <span class="dimension-label">↕</span>
            <input type="number" id="imageHeight" class="dimension-input" step="0.1" disabled>
        </div>
        
        <button id="exportBtn" class="export-btn">Exportar</button>
    </div>
    <div class="content-wrapper">
        <div class="menu-left">
            <div class="menu-left-divider"></div>
            <button id="selectTool" class="tool-btn active">Selecionar</button>
            <button id="brushTool" class="tool-btn">Pincel</button>
            <button id="eraserTool" class="tool-btn">Borracha</button>
            <button id="textTool" class="tool-btn">Texto</button>
        </div>

        <div class="container" id="container">
            <div class="ruler ruler-horizontal" id="horizontalRuler"></div>
            <div class="ruler ruler-vertical" id="verticalRuler"></div>
            <canvas id="outer-canvas"></canvas>
            <div class="canvas-wrapper">
                <canvas id="canvas"></canvas>
            </div>
        </div>

        <div class="menu-right">
            <div class="layers-container">
                <h3>Camadas</h3>
                <div class="layers-list-wrapper">
                    <ul class="layers-list" id="layersList">
                        <!-- Layers will be added here dynamically -->
                    </ul>
                </div>
                <div class="layers-buttons">
                    <button id="newLayerBtn" class="layer-btn">Novo</button>
                    <button id="deleteLayerBtn" class="layer-btn">Excluir</button>
                    <button id="centerLayerBtn" class="layer-btn">Centro</button>
                </div>
            </div>
        </div>
    </div>

    <div id="exportModal" class="modal">
        <div class="modal-content">
            <h3 class="modal-title">Exportar</h3>
            <button class="export-option" id="pngBtn">PNG</button>
            <button class="export-option" id="jpgBtn">JPG</button>
            <button class="export-option" id="pdfBtn">PDF</button>
        </div>
    </div>

    <div id="textMenu" style="display: none; position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: #0f3460; padding: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 1000;">
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div class="text-controls-row">
                <input type="color" id="textColor" value="#000000" style="width: 40px; height: 30px; padding: 0; border: none;">
                <select id="fontFamily" style="padding: 5px; border-radius: 3px; border: 1px solid #2861b3; background: #1a4b8c; color: white;">
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                </select>
                <input type="number" id="fontSize" value="20" min="1" max="200" style="width: 60px; padding: 5px; border-radius: 3px; border: 1px solid #2861b3; background: #1a4b8c; color: white;">
            </div>

            <div class="outline-controls">
                <div class="outline-toggle">
                    <input type="checkbox" id="outlineToggle">
                    <label for="outlineToggle" style="color: white;">Contorno</label>
                </div>
                <input type="number" id="outlineWidth" class="outline-width" value="1" min="1" max="20" style="padding: 5px; border-radius: 3px; border: 1px solid #2861b3; background: #1a4b8c; color: white;">
                <input type="color" id="outlineColor" value="#000000" style="width: 40px; height: 30px; padding: 0; border: none;">
            </div>
        </div>
    </div>

    <div id="paintingModal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #0f3460; padding: 20px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.5); z-index: 1000;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="color: white; margin: 0;">Editor de Imagem</h3>
            <button id="closePaintingModal" class="tool-btn" style="width: auto; margin: 0;">Fechar</button>
        </div>
        <canvas id="paintingCanvas" width="600" height="600" style="background: white; border: 1px solid #2861b3;"></canvas>
        <div style="margin-top: 10px; display: flex; gap: 10px; align-items: center;">
            <span style="color: white;">Tamanho: </span>
            <input type="range" id="brushSize" min="1" max="50" value="5" style="flex: 1;">
            <span id="brushSizeValue" style="color: white; min-width: 30px;">5px</span>
        </div>
        <div style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 10px;">
            <button id="savePaintingBtn" class="tool-btn" style="width: auto;">Salvar</button>
        </div>
    </div>

    <div id="imageMenu" style="display: none; position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: #0f3460; padding: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 1000;">
        <div style="display: flex; gap: 10px;">
            <button id="duplicateImageBtn" class="tool-btn" style="width: auto; margin: 0;">Duplicar</button>
            <button id="exportImageBtn" class="tool-btn" style="width: auto; margin: 0;">Exportar</button>
        </div>
    </div>

    <script src="https://cloudgraficaweb.github.io/CGVendas/scripts/fabric.min.js"></script>
    <script>
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
                // Set canvas size to match image
                paintingCanvas.width = tempImg.width;
                paintingCanvas.height = tempImg.height;
                
                // Clear canvas first
                ctx.clearRect(0, 0, paintingCanvas.width, paintingCanvas.height);
                
                // Draw image
                ctx.drawImage(tempImg, 0, 0);
                
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
        
        // Initial ruler update
        updateRulers();

        // Add window resize handler for rulers
        window.addEventListener('resize', updateRulers);
    </script>
</body>
</html>