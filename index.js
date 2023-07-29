let imagePreview = document.getElementById('imagePreview');
const canvas = document.getElementById('pixelatedImageCanvas');
const context = canvas.getContext('2d');

function onFileUpload(event) {
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // show uploaded image
    const file = event.target.files[0];
    const src = URL.createObjectURL(file);
    imagePreview.src = src;
};

// resize image
// calculate canvas dimensions  


function pixelateImage() {
    // draw image in canvas and get image data
    context.drawImage(imagePreview, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    
    const blockSize = Number(document.getElementById('range').value);

    // calculate average color for every square
    if (blockSize > 0) {
        for (let y = 0; y < canvas.height; y += blockSize) {
            for (let x = 0; x < canvas.width; x += blockSize) {
                const baseIndex = (y * canvas.width + x) * 4;
                const pixel = getAverageColor(data, baseIndex, canvas.width, blockSize);
                fillBlock(data, pixel, baseIndex, canvas.width, blockSize);
            }
        }
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
    
    // show color info from pixels
    // pick color from squares
    // show picked colors in colors section
