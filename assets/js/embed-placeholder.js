document.querySelectorAll('.embed-placeholder').forEach(function(btn) {
	btn.addEventListener('click', function() {
		var src = btn.dataset.embedSrc;
		if (!src) return;
		var f = document.createElement('iframe');
		f.src = src;
		f.width = '100%';
		f.style.cssText = 'aspect-ratio:' + (btn.dataset.embedRatio || '4/3') + ';border:0';
		f.frameBorder = '0';
		f.allowFullscreen = true;
		f.setAttribute('tabindex', '-1');
		if (btn.dataset.embedSandbox) {
			f.setAttribute('sandbox', btn.dataset.embedSandbox);
		}
		btn.replaceWith(f);
	});
});
