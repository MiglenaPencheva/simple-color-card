const imagePreview = document.getElementById('imagePreview');
const resultSection = document.getElementById('resultSection');
const canvas = document.getElementById('pixelatedImageCanvas');
const context = canvas.getContext('2d');
const rangeSection = document.getElementById('pixelRangeSection');
const range = document.getElementById('pixelRangeSlider');
const pixelColorPreview = document.getElementById('pixelColor');
const cardSection = document.getElementById('cardSection');
const colors = document.getElementById('colors');
let pixelRgb = '#ffefe6';

function onFileUpload(event) {
    // clear canvas
    resultSection.style.display = 'none';
    while (colors.firstChild) colors.removeChild(colors.firstChild);

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

function addColors() {
    // color
    let colorLi = document.createElement('li');
    colorLi.style['background-color'] = pixelRgb;
    colorLi.classList.add('colorLi');

    // hover and delete
    let closeBtn = document.createElement('button');
    closeBtn.className = 'close-button';
    closeBtn.textContent = 'x';

    colorLi.addEventListener('mouseover', () => {
        closeBtn.style.display = 'inline-block';
    });
    colorLi.addEventListener('mouseleave', () => {
        closeBtn.style.display = 'none';
    });
    closeBtn.addEventListener('click', (element) => {
        colors.removeChild(element.target.parentElement.nextSibling);
        colors.removeChild(element.target.parentElement);
    });

    // values
    let textLi = document.createElement('li');
    textLi.textContent = pixelRgb + ' #123456' + ' hsl(12, 34, 56)' + ' #123456';
    textLi.classList.add('textLi');

    colorLi.appendChild(closeBtn);
    colors.appendChild(colorLi);
    colors.appendChild(textLi);
}

function exportColorCard() {
    if (!colors.firstChild) return;

    const cnv = document.createElement('canvas');
    const exportCtx = cnv.getContext('2d');
    cnv.width = 600;
    cnv.height = colors.offsetHeight + 20;

    exportCtx.fillStyle = '#608d9e';
    exportCtx.fillText('COLOR SWATCHES', 0, 10);
    exportCtx.fillText('Card of color samples with values', 0, 20);

    const items = colors.getElementsByTagName('li');
    let y = 30;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const computedStyles = window.getComputedStyle(item);

        const itemHeight = parseFloat(computedStyles.height);

        exportCtx.fillStyle = computedStyles.backgroundColor;
        exportCtx.fillRect(0, y, cnv.width, itemHeight);

        if (item.textContent !== 'x') {
            exportCtx.fillStyle = computedStyles.color;
            exportCtx.fillText(item.textContent, 0, y + 15); // Adjust the position as needed
        }

        y += itemHeight - 5;
    }

    const dataURL = cnv.toDataURL('image/png', 1.0);
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'card_' + (Math.random() * 9999 | 0);
    downloadLink.click();
}

