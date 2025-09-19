import { Carousel } from './utils/carousel.js';




const createParticipantsCarousel = () => {
    const carousel = Carousel.create({
        rootEl: document.body.querySelector('.participants__carousel'),
        controlsNestEl: document.body.querySelector('.participants__carousel-controls'),
        //autoPlay: true,
        autoPlayDelay: 4000,
        loop: true,
        breakpoints: [
            {
                minWidth: 0,
                slidesPerPage: 1,
            },
            {
                minWidth: 480,
                slidesPerPage: 2,
            },
            {
                minWidth: 920,
                slidesPerPage: 3,
            },
        ]
    });
};


const main = () => {
    createParticipantsCarousel();

    // ------------

    const wrapperlEl = document.body.querySelector('.stages-wrapper');
    const carouselEl = document.body.querySelector('.stages__carousel');
    const controlsNestEl = document.body.querySelector('.stages__carousel-controls');

    window.carousel = null;  // TODO: change to let!!!

    const resizeObserver = new ResizeObserver((entries) => {
        const rootWidth = entries[0].borderBoxSize[0].inlineSize;

        if (rootWidth < 716) {
            wrapperlEl.classList.remove('stages-wrapper_grid');

            carousel ||= Carousel.create({
                rootEl: carouselEl,
                controlsNestEl,
                dots: true,
            });
        } else {
            wrapperlEl.classList.add('stages-wrapper_grid');

            carousel = carousel?.destroy();
        }
    });

    resizeObserver.observe(carouselEl);
};

main();