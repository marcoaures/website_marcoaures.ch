window.dataLayer = window.dataLayer || [];

function handle40x() {
	dataLayer.push({
		event: 'error',
		pagePath: location.pathname
	});
}

handle40x();