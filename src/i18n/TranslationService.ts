import { i18n, useLang } from '.';
import { Entity } from '../entity';

export type TranslationKeys = { [key: string]: string };
export type TranslationObject = { [key: string]: TranslationKeys };
export type TranslationCacheType = { [key: string]: TranslationObject };

export class TranslationService {
	public lang = 'en';

	private static instance: TranslationService;

	private entityCache: any = {};

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

		const entityTranslation = this.getEntityTranslations(entity, lang);

		//if (!entityTranslation[attribute]) {
		let label = i18n().t(entityName + '.' + attribute, { context: entity.appName });
		if (!label || label.startsWith(entityName + '.')) {
			label = attribute;
		}
		entityTranslation[attribute] = label ?? attribute;
		//}

		return entityTranslation[attribute];
	}

	public translateNamespace(key: string, namespace: string = 'common', lang: string = this.lang): string | '' {
		const label = i18n().t(key, { ns: namespace });
		return label ?? key;
	}

	public getEntityTranslations(entity: Entity, lang: string = this.lang) {
		return this.getEntityCache(this.getPath(entity));
	}

	protected getPath(entity: Entity, lang: string = this.lang): string {
		const path = [lang];
		if (entity.appName) {
			path.push(entity.name + '_' + entity.appName);
		} else {
			path.push(entity.name);
		}
		return path.join('.');
	}

	protected setCacheValue(path: string, value: string): void {
		let container: any = this.entityCache;
		const val = value ?? null;
		path.split('.').map((key: string, idx: number, values: string[]) => {
			if (!container[key]) {
				if (idx === values.length - 1) {
					container[key] = val;
				} else {
					container = container[key] = {};
				}
			} else {
				container = container[key];
			}
		});
	}

	protected getEntityCache(path: string): any {
		let container: any = this.entityCache;
		path.split('.').map((key: string, idx: number, values: string[]) => {
			if (!container[key]) {
				container = container[key] = {};
			} else {
				container = container[key];
			}
		});
		return container;
	}
}
