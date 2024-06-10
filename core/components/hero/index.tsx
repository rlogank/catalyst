import Image from 'next/image';

import { Button } from '~/components/ui/button';
import {
  Slideshow,
  SlideshowAutoplayControl,
  SlideshowContent,
  SlideshowControls,
  SlideshowNextIndicator,
  SlideshowPagination,
  SlideshowPreviousIndicator,
  SlideshowSlide,
} from '~/components/ui/slideshow';

type Slide = {
  image: string;
  blurDataURL: string;
  style?: string;
  title: string;
  description: string;
  link: string;
};

export const Hero = ({
  slides,
}:{
  slides: Slide[];
}) => (
  <Slideshow>
    <SlideshowContent>
      {slides.map(slide => (
        <SlideshowSlide>
          <div className="relative">
            {slide.image && <Image
              alt="an assortment of brandless products against a blank background"
              className="absolute -z-10 object-cover"
              fill
              priority
              sizes="(max-width: 1536px) 100vw, 1536px"
              src={slide.image}
              blurDataURL={slide.blurDataURL}
            />}
            <div className={`flex flex-col gap-4 px-12 pb-48 pt-36 ${slide.style}`}>
              <h2 className="text-5xl font-black  lg:text-6xl">25% Off Sale</h2>
              <p className="max-w-xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
              <Button asChild className="w-fit">
                <a href="/#">Shop now</a>
              </Button>
            </div>
          </div>
        </SlideshowSlide>
      ))}
    </SlideshowContent>
    <SlideshowControls>
      <SlideshowAutoplayControl />
      <SlideshowPreviousIndicator />
      <SlideshowPagination />
      <SlideshowNextIndicator />
    </SlideshowControls>
  </Slideshow>
);
