import { Carousel } from './utils/carousel.js';
import { addDelegatedListener } from './utils/events.js';
import { ListenerStore } from './utils/listener-store.js';




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

const throttle = (fn, timeLimit) => {
    let lastTime = null;
    let timeout  = null;

    return (...args) => {
        if (timeout === null) {
            fn(...args);
            lastTime = Date.now();
        } else {
            const delay = Math.max(timeLimit - (Date.now() - lastTime), 0);

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                if ((Date.now() - lastTime) >= timeLimit) {
                    fn(...args);
                    lastTime = Date.now();
                }
            }, delay);
        }
    };
};

class SectionAnimator {
    #elements  = null;
    #listeners = new ListenerStore();
    #overlapPoints = null;

    static create (els) {
        return new SectionAnimator().#setup(els);
    }

    #destroy = () => {
        this.#listeners.destroy();

        this.#elements = null;
    };

    #setup = (els) => {
        this.#setupElements(els);
        this.#setupListeners();
        this.#checkVisibility(true);

        return this;
    };

    #setupElements = (els) => {
        this.#elements = els.filter(el => el).map((item) => {
            return {
                ...item,
                isDone: false
            };
        });
    };

    #setupListeners = () => {
        this.#listeners.add(window, 'scroll', throttle(() => this.#checkVisibility(false), 250));
        this.#listeners.add(window, 'resize', throttle(() => this.#checkVisibility(true), 250));
    };

    #checkOverlap = (el) => {
        const points = this.#overlapPoints;
        const rect = el.getBoundingClientRect();

        return (
            rect.top    >= points.top && rect.top    <= points.bottom ||  // rect.top between points
            rect.bottom >= points.top && rect.bottom <= points.bottom ||  // rect.bottom between points
            rect.top    <= points.top && rect.bottom >= points.bottom     // points are inside rect
        );
    };

    #updatePoints = () => {
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
        const heightFraction = 0.5;

        const top = (viewportHeight * (1 - heightFraction)) / 2;
        const bottom = viewportHeight - top;

        this.#overlapPoints = { top, bottom };
    }

    #checkVisibility = (updatePoints = false) => {
        if (updatePoints || !this.#overlapPoints) {
            this.#updatePoints();
        }

        let isComplete = true;

        for (let item of this.#elements) {
            if (!item.isDone && this.#checkOverlap(item.el)) {
                item.el.classList.add(item.animClass);

                item.isDone = true;
            }

            isComplete &&= item.isDone;
        }

        if (isComplete) {
            this.#destroy();
        }
    };
}


const main = () => {
    createParticipantsCarousel();

    // ------------

    const wrapperEl = document.body.querySelector('.stages-wrapper');
    const carouselEl = document.body.querySelector('.stages__carousel');
    const controlsNestEl = document.body.querySelector('.stages__carousel-controls');

    let carousel = null;

    const resizeObserver = new ResizeObserver((entries) => {
        const rootWidth = entries[0].borderBoxSize[0].inlineSize;

        if (rootWidth < 716) {
            wrapperEl.classList.remove('stages-wrapper_grid');

            carousel ||= Carousel.create({
                rootEl: carouselEl,
                controlsNestEl,
                dots: true,
            });
        } else {
            wrapperEl.classList.add('stages-wrapper_grid');

            carousel = carousel?.destroy();
        }
    });

    resizeObserver.observe(carouselEl);

    // ------------

    addDelegatedListener(document.documentElement, 'click', `a[href^='#']`, (e) => {
        e.preventDefault();

        const hash = e.target.getAttribute('href');

        if (hash === '#') {
            return;
        }

        const el = document.body.querySelector(hash);

        if (el) {
            el.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });

    // ------------

    // document.querySelector('.intro').classList.add('intro_animated');
    // const introEl = document.querySelector('.intro');

    const animator = SectionAnimator.create([
        {
            el: document.getElementById('intro'),
            animClass: 'intro_animated'
        },
        {
            el: document.getElementById('support'),
            animClass: 'support_animated'
        },
        {
            el: document.getElementById('details'),
            animClass: 'details_animated'
        },
        {
            el: document.getElementById('stages'),
            animClass: 'stages_animated'
        },
        {
            el: document.getElementById('participants'),
            animClass: 'participants_animated'
        },
    ]);
};

main();
