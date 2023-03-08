import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';

export function i18n() {	
	return i18next;
}

export function useLang(lang : string) : Promise<any> {
	init();	
	return i18next.changeLanguage(lang);
}

function init() {
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
		i18next.use(resourcesToBackend((lng: string, ns: string) => import(`./lang/${lng}.json`))).init({
			fallbackLng: 'en',						
			// debug: true,
		});
	}	
}
