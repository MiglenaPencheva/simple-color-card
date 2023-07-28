// upload image and show a preview
function onFileUpload(event) {
    const file = event.target.files[0];
    const src = URL.createObjectURL(file);
    let imagePreview = document.getElementById('imagePreview');
    imagePreview.src = src;
};

// calculate canvas dimensions  


// get pixelation 
function pixelateImage() {
    const canvas = document.getElementById('pixelatedImageCanvas');
    const image = document.getElementById('imagePreview');

    const blockSize = Number(document.getElementById('range').value);

    // draw image in canvas and get image data
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    // calculate average color for every square
    for (let y = 0; y < canvas.height; y += blockSize) {
        for (let x = 0; x < canvas.width; x += blockSize) {
            const baseIndex = (y * canvas.width + x) * 4;
            const pixel = getAverageColor(data, baseIndex, canvas.width, blockSize);
            fillBlock(data, pixel, baseIndex, canvas.width, blockSize);
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
