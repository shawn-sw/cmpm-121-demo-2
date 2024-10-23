import "./style.css";

const APP_NAME = "D2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
//app.innerHTML = APP_NAME;

// Add an app title to the webpage (perhaps in an h1 element) using TypeScript code.
const header = document.createElement("h1");
header.innerHTML = "Sticker Sketchpad";
app.appendChild(header);

// Add a canvas to the webpage of size 256x256 pixels.
const canvas = document.createElement("canvas") as HTMLCanvasElement;
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("canvasApp");
app.appendChild(canvas);

// Allow the user to draw on the canvas using their mouse.
let isDrawing = false;
let currentLine: Array<{ x: number; y: number }> = [];
const lines: Array<Array<{ x: number; y: number }>> = [];
const redoStack: Array<Array<{ x: number; y: number }>> = [];

const context = canvas.getContext("2d");
if (!context) {
    throw new Error("Failed to get 2D context from canvas");
}

canvas.addEventListener("mousedown", (e: MouseEvent) => {
  currentLine = [{ x: e.offsetX, y: e.offsetY }];
  isDrawing = true;
  redoStack.length = 0;
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  if (isDrawing) {
    currentLine.push({ x: e.offsetX, y: e.offsetY });
    drawingChangedEvent();
  }
});

canvas.addEventListener("mouseup", (_e: MouseEvent) => {
  if (isDrawing) {
    lines.push(currentLine);
    currentLine = [];
    drawingChangedEvent();
    isDrawing = false;
  }
});

function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}

// Add a "clear" button and make it clear the canvas.
const clearButton = document.createElement("button");
clearButton.innerText = "Clear Canvas";
clearButton.classList.add("clearButton");
app.appendChild(clearButton);

clearButton.addEventListener("click", () => {
  lines.length = 0;
  redoStack.length = 0;
  drawingChangedEvent();
});

function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Step 3: Display list and observer
canvas.addEventListener("drawing-changed", () => {
  clearCanvas(context);
  reDraw(context);
});

function drawingChangedEvent() {
  const event = new Event("drawing-changed");
  canvas.dispatchEvent(event);
}

function reDraw(ctx: CanvasRenderingContext2D) {
  lines.forEach((line) => {
    for (let i = 1; i < line.length; i++) {
      drawLine(ctx, line[i - 1].x, line[i - 1].y, line[i].x, line[i].y);
    }
  });
}

//Step 4: Undo/redo system
const undoButton = document.createElement("button");
undoButton.innerText = "undo";
undoButton.classList.add("undoButton");
app.appendChild(undoButton);

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
      const lastLine = lines.pop();
      if (lastLine) {
          redoStack.push(lastLine);
          drawingChangedEvent();
      }
  }
});

const redoButton = document.createElement("button");
redoButton.innerText = "redo";
redoButton.classList.add("redoButton");
app.appendChild(redoButton);

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
      const lastRedo = redoStack.pop();
      if (lastRedo) {
          lines.push(lastRedo);
          drawingChangedEvent();
      }
  }
});