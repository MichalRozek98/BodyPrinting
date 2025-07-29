const canvas = document.getElementById('Signature');
const context = canvas.getContext("2d");
canvas.width = 313;
canvas.height = 552;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const lineWidthRange = document.querySelector('.js-line-range');
const lineWidthLabel = document.querySelector('.js-range-value');

context.lineCap = "round";
context.lineJoin = "round";
context.strokeStyle = 'rgba(255, 0, 0, 0.08)';
context.fillStyle = 'rgba(255, 0, 0, 0.08)';
context.lineWidth = 10;
context.globalCompositeOperation = 'source-over';

function updateLineWidth(event) {
    const width = event ? event.target.value : 10;
    lineWidthLabel.innerHTML = width;
    context.lineWidth = width;
    context.strokeStyle = 'rgba(255, 0, 0, 0.08)';
    context.fillStyle = 'rgba(255, 0, 0, 0.08)';
}
lineWidthRange.addEventListener('input', updateLineWidth);
lineWidthRange.addEventListener('change', updateLineWidth);

if (lineWidthRange) {
    lineWidthRange.value = 10;
    updateLineWidth();
}

let drawing = false;
let lastDrawTime = 0;
const drawThrottle = 30;

function preventScroll(e) {
    if (isMobile) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function startDrawing(e) {
        if (e.target === canvas) {
            drawing = true;
            context.beginPath();
            context.strokeStyle = 'rgba(255, 0, 0, 0.08)';
            context.fillStyle = 'rgba(255, 0, 0, 0.08)';
            draw(e);
            if (isMobile && e.type === 'touchstart') {
                e.preventDefault();
                e.stopPropagation();
                document.body.style.overflow = 'hidden';
                document.getElementById('SignatureBox').style.overflow = 'hidden';
                document.getElementById('SignatureBox').style.touchAction = 'none';
            }
        }
    }

function endDrawing(e) {
        if (e.target === canvas) {
            drawing = false;
            saveSignature();
            if (isMobile && e.type === 'touchend') {
                e.preventDefault();
                e.stopPropagation();
                document.body.style.overflow = '';
                document.getElementById('SignatureBox').style.overflow = '';
                document.getElementById('SignatureBox').style.touchAction = '';
            }
        }
    }

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = evt.clientX || (evt.touches && evt.touches[0]?.clientX);
    const clientY = evt.clientY || (evt.touches && evt.touches[0]?.clientY);
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function draw(e) {
    if (!drawing) return;
    const currentTime = Date.now();
    if (currentTime - lastDrawTime < drawThrottle) return;
    context.strokeStyle = 'rgba(255, 0, 0, 0.08)';
    let { x, y } = getMousePos(canvas, e);
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
    lastDrawTime = currentTime;
    if (isMobile && e.type === 'touchmove') {
        e.preventDefault();
        e.stopPropagation();
    }
    // Save canvas content after each draw
    canvasContent = context.getImageData(0, 0, canvas.width, canvas.height);
}

function saveSignature() {
    var dataURL = canvas.toDataURL();
    document.getElementById('SignatureData').value = dataURL;
    console.log(dataURL);
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("mouseup", endDrawing);
canvas.addEventListener("touchend", endDrawing, { passive: false });
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("touchmove", draw, { passive: false });

document.getElementById("ClearSignature").addEventListener("click", function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("SignatureData").value = "";
    context.strokeStyle = 'rgba(255, 0, 0, 0.08)';
    context.fillStyle = 'rgba(255, 0, 0, 0.08)';
    context.lineWidth = lineWidthRange.value ? parseInt(lineWidthRange.value) : 10;
});
document.getElementById("ClearSignature").addEventListener("touchend", function(e) {
    e.preventDefault();
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("SignatureData").value = "";
    context.strokeStyle = 'rgba(255, 0, 0, 0.08)';
    context.fillStyle = 'rgba(255, 0, 0, 0.08)';
    context.lineWidth = lineWidthRange.value ? parseInt(lineWidthRange.value) : 10;
});

window.addEventListener('scroll', function() {
    if (canvasContent) {
        requestAnimationFrame(() => {
            context.putImageData(canvasContent, 0, 0);
        });
    }
});