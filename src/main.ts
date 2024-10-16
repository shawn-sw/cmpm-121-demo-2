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
let x = 0;
let y = 0;
const context = canvas.getContext("2d");
if (!context) {
    throw new Error("Failed to get 2D context from canvas");
  }

canvas.addEventListener("mousedown", (e: MouseEvent) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  if (isDrawing) {
    drawLine(context, x, y, e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
});

app.addEventListener("mouseup", (e: MouseEvent) => {
  if (isDrawing) {
    drawLine(context, x, y, e.offsetX, e.offsetY);
    x = 0;
    y = 0;
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
    clearCanvas(context);
});

function clearCanvas(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}