const imagePreview = document.getElementById('imagePreview');
const resultSection = document.getElementById('resultSection');
const canvas = document.getElementById('pixelatedImageCanvas');
const context = canvas.getContext('2d');
const rangeSection = document.getElementById('pixelRangeSection');
const range = document.getElementById('pixelRangeSlider');
const pixelColorPreview = document.getElementById('pixelColor');
const colors = document.getElementById('colors');
let pixelRgb = '#ffefe6';

function onFileUpload(event) {
    // clear canvas
    resultSection.style.display = 'none';
    while(colors.firstChild) colors.removeChild(colors.firstChild);

    // show uploaded image
    const file = event.target.files[0];
    const src = URL.createObjectURL(file);
    imagePreview.src = src;
    imagePreview.style.display = 'block';
    rangeSection.style.display = 'flex';
};

function onImageLoad() {
    const ratio = imagePreview.naturalWidth / imagePreview.naturalHeight;

    // calculate dimensions of the canvas
    if (ratio > 1) {
        canvas.width = 600;
        canvas.height = canvas.width / ratio;
    } else {
        canvas.height = 400;
        canvas.width = canvas.height * ratio;
    }
}

function pixelateImage() {

    // draw image in canvas and get image data
    context.drawImage(imagePreview, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const blockSize = Number(range.value);

    // calculate average color for every square
    if (blockSize > 0) {
        for (let y = 0; y < canvas.height; y += blockSize) {
            for (let x = 0; x < canvas.width; x += blockSize) {
                const baseIndex = (y * canvas.width + x) * 4;
                const pixel = getAverageColor(data, baseIndex, canvas.width, blockSize);
                fillBlock(data, pixel, baseIndex, canvas.width, blockSize);
            }
        }
        resultSection.style.display = 'flex';
    }

    function getAverageColor(data, baseIndex, width, blockSize) {
        let totalR = 0;
        let totalG = 0;
        let totalB = 0;

        for (let y = 0; y < blockSize; y++) {
            for (let x = 0; x < blockSize; x++) {
                const index = baseIndex + (y * width + x) * 4;
                totalR += data[index];
                totalG += data[index + 1];
                totalB += data[index + 2];
            }
        }

        const pixelCount = blockSize * blockSize;
        return [
            Math.floor(totalR / pixelCount),
            Math.floor(totalG / pixelCount),
            Math.floor(totalB / pixelCount),
        ];
    }

    function fillBlock(data, pixel, baseIndex, width, blockSize) {
        for (let y = 0; y < blockSize; y++) {
            for (let x = 0; x < blockSize; x++) {
                const index = baseIndex + (y * width + x) * 4;
                data[index] = pixel[0];
                data[index + 1] = pixel[1];
                data[index + 2] = pixel[2];
            }
        }
    }

    // draw pixelated image in canvas
    context.putImageData(imageData, 0, 0);
}

const getPixel = (event) => {
    const bounding = canvas.getBoundingClientRect();
    const x = event.clientX - bounding.left;
    const y = event.clientY - bounding.top;
    const pixelData = context.getImageData(x, y, 1, 1).data;
    const arr = Array.from(pixelData);
    pixelRgb = `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;

    if (arr[0] === 0 && arr[1] === 0 && arr[2] === 0) {
        pixelColorPreview.style['background-color'] = '#ffefe6';
    } else {
        pixelColorPreview.style['background-color'] = pixelRgb;
    }
};

// show picked colors in colors section
function drawColors() {
    let colorLi = document.createElement('li');
    colorLi.style['background-color'] = pixelRgb;
    colorLi.classList.add('colorLi');
    colors.appendChild(colorLi);
}

// show color info from pixels
