import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';

export function i18n() {
	return i18next;
}

export async function useLang(lang: string): Promise<any> {
	await init();
	return i18next.changeLanguage(lang);
}

async function init() {
	/* if (!i18next.isInitialized) {
		i18next.use(ChainedBackend).init({
			fallbackLng: 'en',			
			// initImmediate: true,
			// debug: true,
			backend: {	
				backends: [
					// HttpBackend, 
					resourcesToBackend((lng: string, ns: string) => import(`./lang/${lng}.json`))
				],
				backendOptions: [
					{
						loadPath: './lang/{{lng}}.json',
					},
				],
			},
		});
	} */

	if (!i18next.isInitialized) {
		await i18next.use(resourcesToBackend((lng: string, ns: string) => import(`./lang/${ns}/${lng}.json`))).init({
			fallbackLng: 'en',
			ns: ['common', 'translation'],
			// debug: true,
		});
	}
}

i18next.off('failedLoading');
i18next.on('failedLoading', (lng, ns, msg) => {
	import(`./lang/${ns}/${lng}.json`)
		.then((d) => {
			i18next.addResourceBundle(lng, ns, d.default, true);
		})
		.catch((e) => {
			// ignore
		});
});

i18next.off('languageChanged');
i18next.on('languageChanged', (lng: string) => {
	const ns = 'common';
	import(`./lang/${ns}/${lng}.json`)
		.then((d) => {
			i18next.addResourceBundle(lng, ns, d.default, true);
		})
		.catch((e) => {
			// ignore
		});
});
