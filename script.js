document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("drawingCanvas");
  const ctx = canvas.getContext("2d");
  const clearBtn = document.getElementById("clearBtn");
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");
  const eraserBtn = document.getElementById("eraserBtn");
  const circleBtn = document.getElementById("circleBtn");
  const rectangleBtn = document.getElementById("rectangleBtn");
  const lineBtn = document.getElementById("lineBtn");
  const textBtn = document.getElementById("textBtn");
  const newBtn = document.getElementById("newBtn");
  const openBtn = document.getElementById("openBtn");
  const saveBtnHeader = document.getElementById("saveBtnHeader");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const closeBtn = document.getElementsByClassName("closeBtn")[0];
  const brushSizeSetting = document.getElementById("brushSizeSetting");
  const colorPickerSetting = document.getElementById("colorPickerSetting");
  const brushTypeSetting = document.getElementById("brushTypeSetting");
  const applySettingsBtn = document.getElementById("applySettingsBtn");

  let painting = false;
  let drawMode = "brush";
  let history = [];
  let step = -1;
  let startX, startY;
  let isDrawingShape = false;
  let shape = null;
  let brushSize = brushSizeSetting.value;
  let brushColor = colorPickerSetting.value;
  let brushType = brushTypeSetting.value;

  function resizeCanvas() {
    const toolbarHeight = document.querySelector(".toolbar").offsetHeight;
    const availableHeight = window.innerHeight - toolbarHeight - 80;
    const availableWidth = window.innerWidth * 0.9;

    canvas.width = Math.min(availableWidth, 800);
    canvas.height = Math.min(availableHeight, 600);
  }

  function startPosition(e) {
    if (drawMode === "text") return;
    painting = true;
    [startX, startY] = [
      e.clientX - canvas.offsetLeft,
      e.clientY - canvas.offsetTop,
    ];
    if (
      drawMode === "circle" ||
      drawMode === "rectangle" ||
      drawMode === "line"
    ) {
      isDrawingShape = true;
      shape = { type: drawMode, startX, startY, endX: startX, endY: startY };
    } else {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
    }
  }

  function endPosition() {
    if (drawMode === "text") return;
    painting = false;
    if (isDrawingShape) {
      drawShape(shape);
      saveCanvas();
      isDrawingShape = false;
    } else {
      ctx.beginPath();
      saveCanvas();
    }
  }

  function draw(e) {
    if (!painting || drawMode === "text") return;
    ctx.lineWidth = brushSize;
    ctx.lineCap = brushType === "round" ? "round" : "butt";
    ctx.strokeStyle = drawMode === "eraser" ? "#ffffff" : brushColor;

    const alphaValues = {
      calligraphyBrush: 0.5,
      calligraphyPen: 0.7,
      airbrush: 0.3,
      oilBrush: 0.8,
      crayon: 1.0,
      marker: 1.0,
      naturalPencil: 0.9,
      watercolorBrush: 0.6,
    };

    ctx.globalAlpha = alphaValues[brushType] || 1.0;

    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  }

  function drawShape(shape) {
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    if (shape.type === "circle") {
      const radius = Math.sqrt(
        Math.pow(shape.endX - shape.startX, 2) +
          Math.pow(shape.endY - shape.startY, 2)
      );
      ctx.arc(shape.startX, shape.startY, radius, 0, Math.PI * 2);
    } else if (shape.type === "rectangle") {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      ctx.rect(shape.startX, shape.startY, width, height);
    } else if (shape.type === "line") {
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
    }
    ctx.stroke();
  }

  function updateShape(e) {
    if (!isDrawingShape) return;
    shape.endX = e.clientX - canvas.offsetLeft;
    shape.endY = e.clientY - canvas.offsetTop;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (history.length > 0) {
      const canvasPic = new Image();
      canvasPic.src = history[step];
      canvasPic.onload = () => ctx.drawImage(canvasPic, 0, 0);
    }
    drawShape(shape);
  }

  function insertText(e) {
    const text = prompt("Enter text:");
    if (text) {
      ctx.font = `${brushSize}px Arial`;
      ctx.fillStyle = brushColor;
      ctx.fillText(
        text,
        e.clientX - canvas.offsetLeft,
        e.clientY - canvas.offsetTop
      );
      saveCanvas();
    }
  }

  function saveCanvas() {
    step++;
    if (step < history.length) {
      history = history.slice(0, step);
    }
    history.push(canvas.toDataURL());
  }

  function undo() {
    if (step > 0) {
      step--;
      const canvasPic = new Image();
      canvasPic.src = history[step];
      canvasPic.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvasPic, 0, 0);
      };
    }
  }

  function redo() {
    if (step < history.length - 1) {
      step++;
      const canvasPic = new Image();
      canvasPic.src = history[step];
      canvasPic.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvasPic, 0, 0);
      };
    }
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history = [];
    step = -1;
  }

  function setDrawMode(mode) {
    drawMode = mode;
  }

  function saveDrawing() {
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
  }

  function loadDrawing(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveCanvas();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }

  function newDrawing() {
    if (
      confirm(
        "Are you sure you want to start a new drawing? This will clear the current canvas."
      )
    ) {
      clearCanvas();
    }
  }

  function openDrawing() {
    const loadBtn = document.createElement("input");
    loadBtn.type = "file";
    loadBtn.accept = "image/*";
    loadBtn.style.display = "none";
    loadBtn.addEventListener("change", loadDrawing);
    document.body.appendChild(loadBtn);
    loadBtn.click();
  }

  function openSettingsModal() {
    settingsModal.style.display = "block";
  }

  function closeSettingsModal() {
    settingsModal.style.display = "none";
  }

  function applySettings() {
    brushSize = brushSizeSetting.value;
    brushColor = colorPickerSetting.value;
    brushType = brushTypeSetting.value;
    closeSettingsModal();
  }

  canvas.addEventListener("mousedown", (e) => {
    const mousePos = getMousePos(canvas, e);
    startX = mousePos.x;
    startY = mousePos.y;
    startPosition(e);
  });

  canvas.addEventListener("mouseup", endPosition);

  canvas.addEventListener("mousemove", (e) => {
    const mousePos = getMousePos(canvas, e);
    if (isDrawingShape) {
      shape.endX = mousePos.x;
      shape.endY = mousePos.y;
      updateShape(e);
    } else {
      draw(e);
    }
  });

  canvas.addEventListener("click", (e) => {
    if (drawMode === "text") {
      insertText(e);
    }
  });

  clearBtn.addEventListener("click", clearCanvas);
  undoBtn.addEventListener("click", undo);
  redoBtn.addEventListener("click", redo);
  eraserBtn.addEventListener("click", () => setDrawMode("eraser"));
  circleBtn.addEventListener("click", () => setDrawMode("circle"));
  rectangleBtn.addEventListener("click", () => setDrawMode("rectangle"));
  lineBtn.addEventListener("click", () => setDrawMode("line"));
  textBtn.addEventListener("click", () => setDrawMode("text"));
  newBtn.addEventListener("click", newDrawing);
  openBtn.addEventListener("click", openDrawing);
  saveBtnHeader.addEventListener("click", saveDrawing);
  settingsBtn.addEventListener("click", openSettingsModal);
  closeBtn.addEventListener("click", closeSettingsModal);
  applySettingsBtn.addEventListener("click", applySettings);

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
});
