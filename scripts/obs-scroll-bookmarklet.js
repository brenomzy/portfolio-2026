/*
 * Smooth auto-scroll bookmarklet for OBS recordings.
 *
 * Drag the one-liner at the bottom into your bookmarks bar (or create a new
 * bookmark and paste it as the URL). Then, on the site you want to film:
 *   1. Start the OBS recording.
 *   2. Click the bookmark — it hides cookie banners, jumps to the top, waits
 *      START_DELAY (so you can move the cursor out of frame), then scrolls to
 *      the bottom at a constant SPEED.
 *   3. Stop the recording when it reaches the bottom.
 *
 * Tune SPEED (px/sec — lower is calmer) and START_DELAY below, then re-minify
 * (any JS minifier, or just collapse to one line) and update the bookmark.
 *
 * Readable source:
 */
(() => {
	const SPEED = 160; // px/sec — lower is slower / calmer
	const START_DELAY = 1200; // ms before scrolling starts (move cursor away)

	const KW = /by continuing|i understand|manage cookies|cookie settings|cookie policy|consent/i;
	const hide = () => {
		document
			.querySelectorAll('[id*="onetrust" i],[class*="ot-sdk" i],[id*="cookie-banner" i],[class*="cookie-banner" i],[aria-label*="cookie" i]')
			.forEach((e) => e.style.setProperty("display", "none", "important"));
		document.querySelectorAll("*").forEach((e) => {
			if (e.shadowRoot && KW.test(e.shadowRoot.textContent || "")) {
				e.style.setProperty("display", "none", "important");
			}
		});
	};
	const maxY = () =>
		Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;

	hide();
	const iv = setInterval(hide, 250);
	window.scrollTo(0, 0);

	setTimeout(() => {
		let prev = performance.now();
		const step = (now) => {
			const dt = (now - prev) / 1000;
			prev = now;
			const next = Math.min(window.scrollY + SPEED * dt, maxY());
			window.scrollTo(0, next);
			if (next < maxY() - 1) requestAnimationFrame(step);
			else setTimeout(() => clearInterval(iv), 1000);
		};
		requestAnimationFrame(step);
	}, START_DELAY);
})();

/*
 * Bookmarklet one-liner (copy this whole line as the bookmark URL):
 *
javascript:(()=>{const S=160,D=1200,K=/by continuing|i understand|manage cookies|cookie settings|cookie policy|consent/i,h=()=>{document.querySelectorAll('[id*="onetrust" i],[class*="ot-sdk" i],[id*="cookie-banner" i],[class*="cookie-banner" i],[aria-label*="cookie" i]').forEach(e=>e.style.setProperty('display','none','important'));document.querySelectorAll('*').forEach(e=>{if(e.shadowRoot&&K.test(e.shadowRoot.textContent||''))e.style.setProperty('display','none','important')})},m=()=>Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)-innerHeight;h();const i=setInterval(h,250);scrollTo(0,0);setTimeout(()=>{let p=performance.now();const s=n=>{const d=(n-p)/1000;p=n;const y=Math.min(scrollY+S*d,m());scrollTo(0,y);y<m()-1?requestAnimationFrame(s):setTimeout(()=>clearInterval(i),1000)};requestAnimationFrame(s)},D)})();
 */
