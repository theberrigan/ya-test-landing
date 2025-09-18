import { Timer } from './timer.js';
import { ListenerStore } from './listener-store.js';



export class Carousel {
    #rootEl         = null;
    #slidesEl       = null;
    #slideEls       = null;  // slides in initial order
    #controlsNestEl = null;
    #controlsEl     = null;
    #buttonPrevEl   = null;
    #buttonNextEl   = null;
    #countCurrentEl = null;
    #countTotalEl   = null;

    #totalSlideCount   = null;
    #currentSlideIndex = null;
    #slidesPerPage     = null;
    #rootWidth         = null;
    #resizeObserver    = null;
    #autoPlayTimer     = null;

    #autoPlay      = null;
    #autoPlayDelay = null;
    #breakpoints   = null;

    #isChangingSlide     = false;
    #transitionDirection = 0;
    #listeners           = new ListenerStore();

    static create (options) {
        return new Carousel().#setup(options);
    }

    destroy = () => {
        this.#stopTimer();
        this.#resizeObserver.disconnect();
        this.#rootEl.classList.remove('carousel_mounted');
        this.#slidesEl.removeAttribute('style');
        this.#listeners.destroy();
        this.#controlsEl?.remove();
        this.#restoreSlidesOrder();

        this.#rootEl              = null;
        this.#slidesEl            = null;
        this.#slideEls            = null;
        this.#controlsNestEl      = null;
        this.#controlsEl          = null;
        this.#buttonPrevEl        = null;
        this.#buttonNextEl        = null;
        this.#countCurrentEl      = null;
        this.#countTotalEl        = null;
        this.#totalSlideCount     = null;
        this.#currentSlideIndex   = null;
        this.#slidesPerPage       = null;
        this.#rootWidth           = null;
        this.#resizeObserver      = null;
        this.#autoPlayTimer       = null;
        this.#autoPlay            = null;
        this.#autoPlayDelay       = null;
        this.#breakpoints         = null;
        this.#isChangingSlide     = null;
        this.#transitionDirection = null;
        this.#listeners           = null;

        return null;
    };

    #setup = (options) => {
        this.#setupOptions(options);  // first!
        this.#setupElements();
        this.#setupStyles();
        this.#setupListeners();
        this.#setupCounters();
        this.#setupRootWidth();
        this.#setupResizeObserver();  // last!

        this.#reflow();
        this.#redrawTotalSlides();
        this.#redrawCurrentSlide();

        this.#setupTimer();
        this.#restartTimer();

        return this;
    };

    #restoreSlidesOrder = () => {
        this.#slidesEl.append(...this.#slideEls);
    };

    #redrawTotalSlides = () => {
        if (this.#countTotalEl) {
            this.#countTotalEl.textContent = String(this.#totalSlideCount);            
        }
    };

    #setupOptions = (options) => {
        options ||= {};

        if (!options.rootEl) {
            throw new Error('Root element for carousel is not specified');
        }

        this.#rootEl         = options.rootEl;
        this.#controlsNestEl = options.controlsNestEl ?? null;
        this.#autoPlay       = options.autoPlay ?? false;
        this.#autoPlayDelay  = options.autoPlayDelay ?? 5000;
        this.#breakpoints    = [ ...(options.breakpoints ?? []) ];

        this.#breakpoints.sort((a, b) => {
            return a.minWidth - b.minWidth;
        });
    };

    #setupElements = () => {
        this.#slidesEl = this.#rootEl.querySelector('.carousel__slides');
        this.#slideEls = [ ...this.#rootEl.querySelectorAll('.carousel__slide') ];

        if (this.#controlsNestEl) {
            const templateEl = document.getElementById('tpl-carousel-controls');

            if (templateEl) {
                const controlsEl = this.#controlsEl = templateEl.content.firstElementChild.cloneNode(true);

                this.#buttonPrevEl   = controlsEl.querySelector('.carousel-controls__button_prev');
                this.#buttonNextEl   = controlsEl.querySelector('.carousel-controls__button_next');
                this.#countCurrentEl = controlsEl.querySelector('.carousel-controls__counter-current');
                this.#countTotalEl   = controlsEl.querySelector('.carousel-controls__counter-total');

                this.#controlsNestEl.append(controlsEl);
            }
        }
    };

    #setupStyles = () => {
        this.#rootEl.classList.add('carousel_mounted');
    };

    #setupListeners = () => {
        this.#listeners.add(this.#slidesEl, 'transitioncancel', this.#endTransition);
        this.#listeners.add(this.#slidesEl, 'transitionend', this.#endTransition);
        this.#listeners.add(this.#buttonPrevEl, 'click', () => this.#onChangeSlide(-1));
        this.#listeners.add(this.#buttonNextEl, 'click', () => this.#onChangeSlide(1));
    };

    #setupCounters = () => {
        this.#totalSlideCount   = this.#slideEls.length;
        this.#currentSlideIndex = 0;
    };

    #setupRootWidth = () => {
        this.#rootWidth = this.#rootEl.getBoundingClientRect().width;
    };

    #setupResizeObserver = () => {
        const resizeObserver = this.#resizeObserver = new ResizeObserver((entries) => {
            this.#rootWidth = entries[0].borderBoxSize[0].inlineSize;

            this.#reflow();
        });

        resizeObserver.observe(this.#rootEl);
    };

    #setupTimer = () => {
        if (this.#autoPlay) {
            this.#autoPlayTimer = new Timer(this.#autoPlayDelay, () => this.#onChangeSlide(1));
        }
    };

    #restartTimer = () => {
        this.#autoPlayTimer?.restart();
    };

    #stopTimer = () => {
        this.#autoPlayTimer?.stop();
    };

    #reflow = () => {
        const rootWidth     = this.#rootWidth;
        const breakpoint    = this.#breakpoints.findLast(bp => bp.minWidth <= rootWidth);
        const slidesPerPage = breakpoint?.slidesPerPage ?? 1;

        if (slidesPerPage !== this.#slidesPerPage) {
            this.#slidesPerPage = slidesPerPage;
            this.#slidesEl.style.setProperty('--slide-flex-basis', `${ 100 / slidesPerPage }%`);
        }
    };

    #onChangeSlide = (direction) => {
        if (this.#isChangingSlide) {
            return;
        }

        this.#isChangingSlide = true;

        this.#stopTimer();
        this.#changeCounter(direction);
        this.#redrawCurrentSlide();
        this.#startTransition(direction)
    };

    #changeCounter = (direction) => {        
        this.#currentSlideIndex += direction;

        if (this.#currentSlideIndex < 0) {
            this.#currentSlideIndex = this.#totalSlideCount - 1;
        } else if (this.#currentSlideIndex >= this.#totalSlideCount) {
            this.#currentSlideIndex = 0;
        }
    };

    #redrawCurrentSlide = () => {
        if (this.#countCurrentEl) {
            this.#countCurrentEl.textContent = String(this.#currentSlideIndex + 1);
        }
    };

    #startTransition = (direction) => {
        this.#transitionDirection = direction;

        this.#slidesEl.style.transform = `translateX(${ -100 / this.#slidesPerPage }%)`;

        if (direction > 0) {
            this.#slidesEl.style.transitionDuration = '0.15s';
        } else {
            this.#slidesEl.prepend(this.#slidesEl.lastElementChild);

            requestAnimationFrame(() => {
                this.#slidesEl.style.transitionDuration = '0.15s';
                this.#slidesEl.style.transform = 'translateX(0)';
            });
        }
    };

    #endTransition = () => {
        this.#slidesEl.style.transitionDuration = '0s';

        if (this.#transitionDirection > 0) {
            requestAnimationFrame(() => {
                this.#slidesEl.append(this.#slidesEl.firstElementChild);
                this.#slidesEl.style.transform = 'translateX(0)';
                this.#onAfterTransition();
            });
        } else {
            this.#onAfterTransition();
        }
    };

    #onAfterTransition = () => {
        this.#transitionDirection = 0;
        this.#isChangingSlide = false;

        this.#restartTimer();
    };
}