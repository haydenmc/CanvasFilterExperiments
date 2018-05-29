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

    /** Getter for the 2D context of the source canvas */
    private get sourceContext2d(): CanvasRenderingContext2D {
        if (this._sourceContext2d == null) {
            this._sourceContext2d = this.sourceCanvas.getContext("2d");
        }
        return this._sourceContext2d;
    }

    /** Backing field for sourceContext2d getter */
    private _sourceContext2d: CanvasRenderingContext2D;

    /** Getter for the 2D context of the target canvas */
    private get targetContext2d(): CanvasRenderingContext2D {
        if (this._targetContext2d == null) {
            this._targetContext2d = this.targetCanvas.getContext("2d");
        }
        return this._targetContext2d;
    }

    /** Backing field for targetContext2d getter */
    private _targetContext2d: CanvasRenderingContext2D;

    /** List of image data filters to apply */
    private imageDataFilters: IImageDataFilter[];
    //#endregion Members


    //#region Private Methods
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
    //#endregion

    //#region Public Methods
    public init(): void {
        this.sourceCanvas = document.querySelector("canvas#source");
        this.targetCanvas = document.querySelector("canvas#target");
        this.imageDataFilters = [
            new ChromaticAberrationImageDataFilter(
                () => 8, // Magnitude
                () => <I2dPoint>{ x:  -1, y: 0 }, // R offset
                () => <I2dPoint>{ x:  0, y: -1 }, // G offset
                () => <I2dPoint>{ x:  0, y: 0 }  // B offset
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
