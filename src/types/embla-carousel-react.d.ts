declare module 'embla-carousel-react' {
  import { EmblaCarouselType } from 'embla-carousel';

  export type UseEmblaCarouselType = [
    (instance: EmblaCarouselType) => void,
    EmblaCarouselType | undefined
  ];

  export default function useEmblaCarousel(
    options?: any,
    plugins?: any[]
  ): UseEmblaCarouselType;
}