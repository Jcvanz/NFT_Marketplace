import image1 from './2986a7cb16d09de8970824d2dd58bf0bb021702c.png';
import image2 from './8459204731e6eba9d474cbc8ebc37071360d3ba5 (1).png';
import image3 from './9df2ff42dd27ba657621c304557d1a855a4be6a5.png';

export const ASSET_IMAGES = [image1, image2, image3] as const;

export { image1, image2, image3 };

export const getAssetImage = (index: number): string => {
  return ASSET_IMAGES[Math.abs(index) % ASSET_IMAGES.length];
};

