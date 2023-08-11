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
let r = 0;
let g = 0;
let b = 0;

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
    [r, g, b] = Array.from(pixelData);
    pixelRgb = `rgb(${r}, ${g}, ${b})`;
    pixelColorPreview.style['background-color'] = pixelRgb;
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
    let hex = rgbToHex(r, g, b);
    let hsl = rgbToHsl(r, g, b).hslString;
    let cmyk = rgbToCmyk(r, g, b).cmykString;
    textLi.textContent = `${hex} ${pixelRgb} ${hsl} ${cmyk}`;
    textLi.classList.add('textLi');

    colorLi.appendChild(closeBtn);
    colors.appendChild(colorLi);
    colors.appendChild(textLi);

    function rgbToHex(r, g, b) {
        let hexR = r.toString(16);
        while (hexR.length < 2) { hexR = '0' + hexR; }
        let hexG = g.toString(16);
        while (hexG.length < 2) { hexG = '0' + hexG; }
        let hexB = b.toString(16);
        while (hexB.length < 2) { hexB = '0' + hexB; }
        return `#${hexR}${hexG}${hexB}`;
    };
    function rgbToHsl(r, g, b) {
            let h, l, s;
            let rgb = [];
            rgb[0] = r / 255;
            rgb[1] = g / 255;
            rgb[2] = b / 255;
            let min = rgb[0];
            let max = rgb[0];
            let maxColor = 0;
        
            for (let i = 0; i < rgb.length - 1; i++) {
                if (rgb[i + 1] <= min) { min = rgb[i + 1]; }
                if (rgb[i + 1] >= max) { max = rgb[i + 1]; maxColor = i + 1; }
            }
            if (maxColor === 0) {
                h = (rgb[1] - rgb[2]) / (max - min);
            }
            if (maxColor === 1) {
                h = 2 + (rgb[2] - rgb[0]) / (max - min);
            }
            if (maxColor === 2) {
                h = 4 + (rgb[0] - rgb[1]) / (max - min);
            }
            if (isNaN(h)) { h = 0; }
            h = h * 60;
            if (h < 0) { h = h + 360; }
            l = (min + max) / 2;
            if (min === max) {
                s = 0;
            } else {
                if (l < 0.5) {
                    s = (max - min) / (max + min);
                } else {
                    s = (max - min) / (2 - max - min);
                }
            }
            h = Math.round(h);
            s = Math.round(s * 100);
            l = Math.round(l * 100);
            return {
                hue: h,
                saturation: s,
                lightness: l,
                hslString: `hsl(${h}, ${s}%, ${l}%)`,
            };
        };
    function rgbToCmyk(r, g, b) {
        let c, m, y, k;
        r = r / 255;
        g = g / 255;
        b = b / 255;
        let max = Math.max(r, g, b);
        k = 1 - max;
        if (k === 1) {
            c = 0;
            m = 0;
            y = 0;
        } else {
            c = (1 - r - k) / (1 - k);
            m = (1 - g - k) / (1 - k);
            y = (1 - b - k) / (1 - k);
        }
        c = Number((c * 100).toFixed(0));
        m = Number((m * 100).toFixed(0));
        y = Number((y * 100).toFixed(0));
        k = Number((k * 100).toFixed(0));
    
        return {
            cyan: c,
            magenta: m,
            yellow: y,
            black: k,
            cmykString: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`,
        };
    };
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

        y += itemHeight;
    }

    const dataURL = cnv.toDataURL('image/png', 1.0);
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'card_' + (Math.random() * 9999 | 0);
    downloadLink.click();
}

