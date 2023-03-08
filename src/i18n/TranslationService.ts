import { i18n, useLang } from '.';
import { Entity } from '../entity';

export type TranslationKeys = { [key: string]: string };
export type TranslationObject = { [key: string]: TranslationKeys };
export type TranslationCacheType = { [key: string]: TranslationObject };

export class TranslationService {
	public lang = 'en';

	private static instance: TranslationService;

	private constructor() {}

	public static getInstance(): TranslationService {
		if (!TranslationService.instance) {
			TranslationService.instance = new TranslationService();
		}

		return TranslationService.instance;
	}

	public useLang(lang: string): Promise<any> {
		this.lang = lang;
		return useLang(lang);
	}

	public translate(entity: Entity, attribute: string, lang: string = this.lang): string | '' {
		const entityName: string = entity.name;

		let label = i18n().t(entityName + '.' + attribute, { context: entity.appName });
		if (!label || label.startsWith(entityName + '.')) {
			label = attribute;
		}
		return label ?? attribute;
	}
}
