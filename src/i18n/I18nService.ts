import * as en from './lang/en.json';

const path = './lang/';

export const useLang = async (lang: string) => {
	// import `${path}${lang}.json`
	// console.log(en.ENTITY.ATTRIBUTENAME);

	try {
		const s = await import(`${path}${lang}.json`);
	} catch (e) {
		// tslint:disable-next-line:no-console
		console.warn((e as Error).message);
	}
	// console.log(s.ENTITY.ATTRIBUTENAME)
};
