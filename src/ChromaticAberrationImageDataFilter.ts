import { IImageDataFilter } from "./IImageDataFilter";
import { I2dPoint } from "./I2dPoint";

/**
 * The Chromatic Aberration Filter offsets the R, G, and B channels by some amount
 */
export class ChromaticAberrationImageDataFilter implements IImageDataFilter {
    //#region Fields/Properties
    /** Function that determines the offset of aberration that is applied */
    private aberrationOffset:  () => number;

    /** Function that determines the offset applied in x/y direction to the red channel */
    private redOffsetCoefficient:   () => I2dPoint;

    /** Function that determines the offset applied in x/y direction to the green channel */
    private greenOffsetCoefficient: () => I2dPoint;

    /** Function that determines the offset applied in x/y direction to the blue channel */
    private blueOffsetCoefficient:  () => I2dPoint;

    /** Offset of red pixel data in image data arrays */
    private readonly RED: number = 0;

    /** Offset of green pixel data in image data arrays */
    private readonly GREEN: number = 1;

    /** Offset of blue pixel data in image data arrays */
    private readonly BLUE: number = 2;

    /** Offset of alpha pixel data in image data arrays */
    private readonly ALPHA: number = 3;
    //#endregion

    /**
     * Creates a new Chromatic Aberration Image Data Filter
     * @param aberrationOffset       A function that returns the magnitude of the aberration effect
     * @param redOffsetCoefficient   A function that returns the offset factor for the red channel
     * @param greenOffsetCoefficient A function that returns the offset factor for the green channel
     * @param blueOffsetCoefficient  A function that returns the offset factor for the blue channel
     */
    constructor(
        aberrationOffset: () => number,
        redOffsetCoefficient: () => I2dPoint,
        greenOffsetCoefficient: () => I2dPoint,
        blueOffsetCoefficient: () => I2dPoint
    ) {
        this.aberrationOffset       = aberrationOffset;
        this.redOffsetCoefficient   = redOffsetCoefficient;
        this.greenOffsetCoefficient = greenOffsetCoefficient;
        this.blueOffsetCoefficient  = blueOffsetCoefficient;
    }

    //#region Private Methods
    /**
     * Determines the index of an ImageData array for a given (x,y) pixel
     * @param width The width of the image bounds
     * @param x     The x coordinate of the target pixel
     * @param y     The y coordinate of the target pixel
     */
    private imageDataPixelIndex(width: number, x: number, y: number): number {
        return (y * width * 4) + (x * 4);
    }
    //#endregion

    //#region Public Methods
    /**
     * Applies the Chromatic Aberration filter to the given ImageData
     * @param imageData The image data to apply the filter to
     */
    public applyFilter(imageData: ImageData): void {
        // Get all of our data together
        let aberrationOffset       = this.aberrationOffset();
        let redOffsetCoefficient   = this.redOffsetCoefficient();
        let greenOffsetCoefficient = this.greenOffsetCoefficient();
        let blueOffsetCoefficient  = this.blueOffsetCoefficient();

        // Pull out image data bits
        let imageDataArray = imageData.data;
        let imageDataStagingArray = new Uint8ClampedArray(imageDataArray.length);
        let height = imageData.height;
        let width = imageData.width;

        // Traverse each pixel and translate color values
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Locate pixel index in image data array
                let pixelIndex = this.imageDataPixelIndex(width, x, y);

                // Determine translation target pixel for each channel
                let targetPixels: I2dPoint[] = [];
                targetPixels[this.RED] = {
                    x: x + (redOffsetCoefficient.x * aberrationOffset),
                    y: y + (redOffsetCoefficient.y * aberrationOffset)
                };
                targetPixels[this.GREEN] = {
                    x: x + (greenOffsetCoefficient.x * aberrationOffset),
                    y: y + (greenOffsetCoefficient.y * aberrationOffset)
                };
                targetPixels[this.BLUE] = {
                    x: x + (blueOffsetCoefficient.x * aberrationOffset),
                    y: y + (blueOffsetCoefficient.y * aberrationOffset)
                };

                // Translate each channel
                let initialPixelAlphaValue = imageDataArray[pixelIndex + this.ALPHA];
                for (let color = this.RED; color < this.ALPHA; ++color) {
                    // Get current value (alpha and color)
                    let alphaValue = initialPixelAlphaValue * (1 / 3);
                    let colorValue = imageDataArray[pixelIndex + color];

                    // Add to target location
                    let targetPixel = targetPixels[color];
                    let targetPixelIndex
                        = this.imageDataPixelIndex(width, targetPixel.x, targetPixel.y);
                    imageDataStagingArray[targetPixelIndex + this.ALPHA] += alphaValue;
                    imageDataStagingArray[targetPixelIndex + color] += colorValue;
                }
            }
        }

        // Copy to existing buffer
        for (let i = 0; i < imageDataArray.length; ++i)
        {
            imageDataArray[i] = imageDataStagingArray[i];
        }
    }
    //#endregion
}
