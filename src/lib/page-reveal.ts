/*
 * Page-entrance gate for the wipe transition (see components/PageTransition.astro).
 *
 * On a client-side navigation the panel COVERS the screen, the page swaps, then
 * the panel UNCOVERS. The new page's entrance animations should play only once
 * the panel has cleared — otherwise they run hidden behind it and you miss them.
 *
 * Entrance scripts await whenRevealable() before playing. It resolves:
 *   - immediately, on a normal load / refresh (no transition in flight), or
 *   - when PageTransition dispatches `page:revealed` as the panel uncovers.
 * A timeout fallback guarantees the page is never left hidden if that event
 * never arrives (e.g. an aborted transition).
 */
declare global {
	interface Window {
		__pageTransitionActive?: boolean;
	}
}

export function whenRevealable(timeout = 2500): Promise<void> {
	if (!window.__pageTransitionActive) return Promise.resolve();
	return new Promise((resolve) => {
		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			window.removeEventListener("page:revealed", finish);
			resolve();
		};
		window.addEventListener("page:revealed", finish, { once: true });
		setTimeout(finish, timeout);
	});
}

export {};
