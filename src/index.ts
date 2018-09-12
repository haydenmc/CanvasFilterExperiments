import { I2dPoint } from "./I2dPoint";
import { IImageDataFilter } from "./IImageDataFilter";
import { ChromaticAberrationImageDataFilter } from "./ChromaticAberrationImageDataFilter";

/**
 * Main Class
 */
class Index {
    //#region Members
    /** The source canvas that image data is pulled from */
    private sourceCanvas: HTMLCanvasElement;

    /** The target canvas that image data is painted to after being filtered */
    private targetCanvas: HTMLCanvasElement;

    /** The 2D context of the source canvas */
    private sourceContext2d: CanvasRenderingContext2D;

    /** The 2D context of the target canvas */
    private targetContext2d: CanvasRenderingContext2D;

    /** List of image data filters to apply */
    private imageDataFilters: IImageDataFilter[];
    //#endregion Members

    //#region Private Methods
    private setUpCanvasScaling(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        // // Get the device pixel ratio, falling back to 1.
        // var dpr = window.devicePixelRatio || 1;
        // // Get the size of the canvas in CSS pixels.
        // var rect = canvas.getBoundingClientRect();
        // // Give the canvas pixel dimensions of their CSS
        // // size * the device pixel ratio.
        // canvas.width = rect.width * dpr;
        // canvas.height = rect.height * dpr;
        var ctx = canvas.getContext('2d');
        // // Scale all drawing operations by the dpr, so you
        // // don't have to worry about the difference.
        // ctx.scale(dpr, dpr);
        return ctx;
    }
    //#endregion

    //#region Public Methods
    public draw(): void {
        // Get references to canvases / contexts
        let sourceCanvas  = this.sourceCanvas;
        let targetCanvas  = this.targetCanvas
        let sourceContext = this.sourceContext2d;
        let targetContext = this.targetContext2d;

        // Paint whatever we want on the source canvas
        sourceContext.save();
        sourceContext.globalCompositeOperation = "copy";
        sourceContext.fillStyle = "#ffffff";
        sourceContext.font = "700 64px 'Segoe UI'";
        sourceContext.textBaseline = "ideographic";
        sourceContext.fillText("TEST", 32, 64);
        sourceContext.restore();

        // Grab the image data, apply filters
        let filteredImageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        for(let i = 0; i < this.imageDataFilters.length; i++) {
            this.imageDataFilters[i].applyFilter(filteredImageData);
        }
        
        // Paint result onto target canvas
        targetContext.putImageData(filteredImageData, 0, 0);

        // Rinse, repeat
        requestAnimationFrame(() => this.draw());
    }

    public init(): void {
        this.sourceCanvas = document.querySelector("canvas#source");
        this.targetCanvas = document.querySelector("canvas#target");
        this.sourceContext2d = this.setUpCanvasScaling(this.sourceCanvas);
        this.targetContext2d = this.setUpCanvasScaling(this.targetCanvas);

        this.imageDataFilters = [
            new ChromaticAberrationImageDataFilter(
                () => 6, // Magnitude
                () => <I2dPoint>{ x: -1, y: 0 },  // R offset
                () => <I2dPoint>{ x:  0, y: 0 },  // G offset
                () => <I2dPoint>{ x:  1, y: 0 }  // B offset
            )
        ];
    }
    //#endregion
}

// Run it
window.addEventListener("load", () => {
    var filters = new Index();
    filters.init();
    filters.draw();
});
