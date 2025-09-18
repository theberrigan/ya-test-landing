import { Carousel } from './utils/carousel.js';




/*const rootEl = document.body.querySelector('.participants__carousel');

const carousel = Carousel.create(rootEl, {
    controlsNestEl: document.body.querySelector('.participants__carousel-controls'),
    autoSlide: true,
    audoSlideDelay: 4000,
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
});*/

const createParticipantsCarousel = () => {
    const carousel = Carousel.create({
        rootEl: document.body.querySelector('.participants__carousel'),
        controlsNestEl: document.body.querySelector('.participants__carousel-controls'),
        autoPlay: false,
        autoPlayDelay: 4000,
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
    // createParticipantsCarousel();

    // ------------

    const rootEl = document.body.querySelector('.stages__carousel');
    const controlsNestEl = document.body.querySelector('.stages__carousel-controls');

    window.carousel = null;  // TODO: change to let!!!

    const resizeObserver = new ResizeObserver((entries) => {
        const rootWidth = entries[0].borderBoxSize[0].inlineSize;

        if (rootWidth < 716) {
            rootEl.classList.remove('stages-content_grid');

            carousel ||= Carousel.create({
                rootEl,
                controlsNestEl,
            });
        } else {
            rootEl.classList.add('stages-content_grid');

            carousel = carousel?.destroy();
        }
    });

    resizeObserver.observe(rootEl);
};

main();