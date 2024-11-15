import "./style.css";

// ===========================
// Global Constants and Variables
// ===========================
const APP_NAME = "D2";
const stickers: string[] = ["🌟", "❤️", "🔥"];
let currentSticker: string | null = null;
let cursorPosition: { x: number; y: number } | null = null;
let stickerPreview: StickerCommand | null = null;
let isDrawing = false;
let currentLine: MarkerLine | null = null;
let currentThickness = 1;
const commands: Array<{ display(context: CanvasRenderingContext2D): void }> = [];
const redoStack: Array<{ display(context: CanvasRenderingContext2D): void }> = [];
let currentColor = "hsl(0, 100%, 50%)";

// ===========================
// Initialize Application Interface
// ===========================

// title
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;
const header = document.createElement("h1");
header.innerHTML = "Sticker Sketchpad";
app.appendChild(header);

// canvas
const canvas = document.createElement("canvas") as HTMLCanvasElement;
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("canvasApp");
app.appendChild(canvas);
const context = canvas.getContext("2d");
if (!context) {
  throw new Error("Failed to get 2D context from canvas");
}

// ===========================
// Toolbar Setup
// ===========================

const toolContainer = document.createElement("div");
toolContainer.classList.add("toolContainer");
app.appendChild(toolContainer);

// Create color slider
const colorSlider = document.createElement("input");
colorSlider.type = "range";
colorSlider.min = "0";
colorSlider.max = "360";
colorSlider.value = "0";

colorSlider.classList.add("toolSlider");
const colorLabel = document.createElement("label");
colorLabel.innerText = "Color";
toolContainer.appendChild(colorLabel);
toolContainer.appendChild(colorSlider);

colorSlider.addEventListener("input", () => {
  const hue = parseInt(colorSlider.value, 10);
  currentColor = `hsl(${hue}, 100%, 50%)`;
});

toolContainer.appendChild(document.createElement("br"));

// ===========================
// Drawing Features Implementation
// ===========================

// Line drawing
class MarkerLine {
  private points: Array<{ x: number; y: number }> = [];
  private thickness: number;
  private color: string;

  constructor(x: number, y: number, thickness: number, color: string) {
    this.points.push({ x, y });
    this.thickness = thickness;
    this.color = color;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(context: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;
    context.strokeStyle = this.color;
    context.lineWidth = this.thickness;
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      context.lineTo(this.points[i].x, this.points[i].y);
    }
    context.stroke();
  }
}

// Cursor
function drawCursor(context: CanvasRenderingContext2D) {
  if (!cursorPosition) return;

  context.beginPath();
  context.strokeStyle = "black"; 
  context.lineWidth = 5; 
  context.arc(cursorPosition.x, cursorPosition.y, context.lineWidth, 0, Math.PI * 2); // 光标形状
  context.stroke();
  context.closePath();
}

// Sticker
class StickerCommand {
  public position: { x: number; y: number };
  public sticker: string;

  constructor(position: { x: number; y: number }, sticker: string) {
    this.position = position;
    this.sticker = sticker;
  }

  display(context: CanvasRenderingContext2D) {
    context.font = "20px monospace";
    context.fillText(this.sticker, this.position.x, this.position.y);
  }

  drag(x: number, y: number) {
    this.position = { x, y }; 
  }
}

// ===========================
// Button Functionality
// ===========================

function updateSelectedTool(selectedButton: HTMLButtonElement) {
  const buttons = toolContainer.querySelectorAll(".toolButton");
  buttons.forEach((button) => button.classList.remove("selectedTool"));
  selectedButton.classList.add("selectedTool");
}

// brush button
const brushButton = document.createElement("button");
brushButton.innerText = "Brush";
brushButton.classList.add("toolButton");
brushButton.addEventListener("click", () => {
  currentSticker = null;
  stickerPreview = null;
  updateSelectedTool(brushButton);
});
toolContainer.appendChild(brushButton);

// Thin button
const thinButton = document.createElement("button");
thinButton.innerText = "Thin";
thinButton.classList.add("toolButton");
thinButton.addEventListener("click", () => {
  currentThickness = 1;
  updateSelectedTool(thinButton);
});
toolContainer.appendChild(thinButton);

// Thick button
const thickButton = document.createElement("button");
thickButton.innerText = "Thick";
thickButton.classList.add("toolButton");
thickButton.addEventListener("click", () => {
  currentThickness = 5;
  updateSelectedTool(thickButton);
});
toolContainer.appendChild(thickButton);

// sticker Button and add new Sticker Button
function renderStickers() {
  stickerContainer.innerHTML = "";

  const newStickerButton = document.createElement("button");
  newStickerButton.textContent = "+";
  newStickerButton.classList.add("toolButton");
  newStickerButton.addEventListener("click", () => {

    const sticker = prompt("Enter a new sticker character：", "Emoji");
    if (sticker) {
      stickers.push(sticker); 
      renderStickers(); 
    }
  });
  
  stickers.forEach((sticker) => {
    const stickerButton = document.createElement("button");
    stickerButton.textContent = sticker;
    stickerButton.classList.add("toolButton");
    stickerButton.addEventListener("click", () => {
      currentSticker = sticker;
      stickerPreview = new StickerCommand({ x: 0, y: 0 }, sticker);
      updateSelectedTool(stickerButton);
    });
    stickerContainer.appendChild(stickerButton);
  });

  stickerContainer.appendChild(newStickerButton);
}


// Initialize Sticker Container
const stickerContainer = document.createElement("div");
stickerContainer.classList.add("stickerContainer");
app.appendChild(stickerContainer);
renderStickers();
updateSelectedTool(brushButton);

// Add Export Button Functionality
const exportButton = document.createElement("button");
exportButton.innerText = "export";
exportButton.classList.add("exportButton");
exportButton.addEventListener("click", exportDrawing);

function exportDrawing() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024; 
  exportCanvas.height = 1024;

  const exportContext = exportCanvas.getContext("2d");
  if (!exportContext) {
    console.error("Failed to get export canvas context");
    return;
  }

  exportContext.scale(
    exportCanvas.width / canvas.width,
    exportCanvas.height / canvas.height
  );

  commands.forEach((command) => command.display(exportContext));

  const imageData = exportCanvas.toDataURL("image/png");
  const downloadLink = document.createElement("a");
  downloadLink.href = imageData;
  downloadLink.download = "drawing.png";
  downloadLink.click(); 
}

// ===========================
// Canvas Event Binding
// ===========================

canvas.addEventListener("mousedown", (e: MouseEvent) => {
  if (currentSticker && stickerPreview) {
    const stickerCommand = new StickerCommand(
      { x: e.offsetX, y: e.offsetY },
      currentSticker
    );
    commands.push(stickerCommand);
    redoStack.length = 0;
    drawingChangedEvent();
  } else {
    currentLine = new MarkerLine(e.offsetX, e.offsetY, currentThickness, currentColor); // 使用当前颜色
    commands.push(currentLine);
    redoStack.length = 0;
    isDrawing = true;
  }
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  cursorPosition = { x: e.offsetX, y: e.offsetY };

  if (currentSticker && stickerPreview) {
    stickerPreview.drag(e.offsetX, e.offsetY);
    drawingChangedEvent();
  } else if (isDrawing && currentLine) {
    currentLine.drag(e.offsetX, e.offsetY);
    drawingChangedEvent();
  } else {
    reDraw(context!);
  }
});

canvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    currentLine = null;
    isDrawing = false;
    drawingChangedEvent();
  }
});

canvas.addEventListener("mouseleave", () => {
  cursorPosition = null; 
  reDraw(context!);
});

// ===========================
// Action Buttons: Clear, Undo, Redo
// ===========================

const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
clearButton.classList.add("clearButton");
clearButton.addEventListener("click", () => {
  commands.length = 0;
  redoStack.length = 0;
  drawingChangedEvent();
});
app.appendChild(clearButton);

const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.classList.add("undoButton");
undoButton.addEventListener("click", () => {
  if (commands.length > 0) {
    redoStack.push(commands.pop()!);
    drawingChangedEvent();
  }
});
app.appendChild(undoButton);

const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.classList.add("redoButton");
redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    commands.push(redoStack.pop()!);
    drawingChangedEvent();
  }
});
app.appendChild(redoButton);
app.appendChild(exportButton);

// ===========================
// Drawing and Redrawing Logic
// ===========================

function clearCanvas(context: CanvasRenderingContext2D) {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function reDraw(context: CanvasRenderingContext2D) {
  clearCanvas(context);
  commands.forEach((command) => command.display(context));
  if (stickerPreview) stickerPreview.display(context);
  drawCursor(context);
}

function drawingChangedEvent() {
  reDraw(context!);
}

// ===========================
// Launch Application
// ===========================
reDraw(context!);
