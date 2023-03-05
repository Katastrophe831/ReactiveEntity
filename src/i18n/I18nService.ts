import i18next from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import resourcesToBackend from 'i18next-resources-to-backend';

export default function i18n() {
	return i18next;
}

function init() {
	if (!i18next.isInitialized) {
		i18next.use(ChainedBackend).init({
			fallbackLng: 'en',
			initImmediate: false,
			// debug: true,
			backend: {
				backends: [HttpBackend, resourcesToBackend((lng: string, ns: string) => import(`./lang/${lng}.json`))],
				backendOptions: [
					{
						loadPath: './lang/{{lng}}.json',
					},
				],
			},
		});
	}
}

// init();
