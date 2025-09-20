export const addDelegatedListener = (rootEl, eventName, selectors, fn, options) => {
    return rootEl.addEventListener(eventName, (e) => {
        let currentEl = e.target;

        while (currentEl) {
            if (currentEl === rootEl) {
                return;
            }

            if (currentEl.matches(selectors)) {
                break;
            }

            currentEl = currentEl.parentElement;
        }

        if (currentEl) {
            Object.defineProperty(e, 'target', {
                value: currentEl,
                configurable: true
            });

            return fn(e);
        }
    }, options);
};