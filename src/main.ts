import "./style.css";

const APP_NAME = "D2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

// Add an app title to the webpage (perhaps in an h1 element) using TypeScript code.
const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.appendChild(header);

//Add a canvas to the webpage of size 256x256 pixels.
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("canvasApp");
app.appendChild(canvas);