/**
 * Interface defining classes that can apply filters to image data
 */
export interface IImageDataFilter {
    applyFilter(imageData: ImageData): void;
}
