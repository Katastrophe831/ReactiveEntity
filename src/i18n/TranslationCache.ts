import i18n from '.';
import { Utils } from '../utils';
import { Entity } from '../entity';

export type TranslationKeys = { [key: string]: string };
export type TranslationObject = { [key: string]: TranslationKeys };
export type TranslationCacheType = { [key: string]: TranslationObject };

export class TranslationCache {
	private static instance: TranslationCache;

	private cache: TranslationCacheType = {};

	private constructor() {}

	public static getInstance(): TranslationCache {
		if (!TranslationCache.instance) {
			TranslationCache.instance = new TranslationCache();
		}

		return TranslationCache.instance;
	}

	public getEntityTranslation(entityName: string, lang: string = 'en') {
		return this.getFromCache(entityName, lang);
	}

	public getEntityAttributeTranslation(entityName: string, attribute: string, lang: string = 'en'): string | null {
		const translationKeyObject = this.getFromCache(entityName, lang);
		return translationKeyObject[attribute] ?? null;
	}

	public addEntityAttributeTranslation(entity: Entity, attribute: string, lang: string = 'en'): string | '' {
		const entityName: string = entity.name;

		if (!this.cache[lang]) {
			this.cache[lang] = {};
		}
		if (!this.cache[lang][entityName]) {
			this.cache[lang][entityName] = {};
		}

		const translationKeyObject = this.getFromCache(entityName, lang);

		let label = translationKeyObject[attribute];

		if (!label) {
			label = i18n().t(entityName + '.' + attribute, { context: entity.appName });
			if (!label || label.startsWith(entityName + '.')) {
				label = attribute;
			}
			translationKeyObject[attribute] = label;
		}
		return label ?? '';
	}

	public hascache(entityName: string): boolean {
		return this.cache.hasOwnProperty(entityName);
	}

	public cacheEntityKeys(entity: Entity): void {
		if (this.hascache(entity.name) === false) {
			Object.keys(entity).map((k: string) => this.addEntityAttributeTranslation(entity, k, 'en'));
		} else {
			const keys = this.getFromCache(entity.name, 'en');
			const newKeys = Utils.getKeysThatDontExist(entity, keys);
			Object.keys(newKeys).map((k: string) => this.addEntityAttributeTranslation(entity, k, 'en'));
		}
	}

	private getFromCache(entityName: string, lang: string) {
		return this.cache[lang][entityName];
	}
}
