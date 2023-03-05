export class Utils {
	/**
	 * Replace all
	 * @param value
	 * @param target
	 * @param replacement
	 * @returns
	 */
	static replaceAll(value: string, target: string | RegExp, replacement: string) {
		return value.split(target).join(replacement);
	}

	/**
	 * Checks if a value is null or empty
	 * @param value
	 * @returns boolean
	 */
	static isNullOrEmpty(value: any): boolean {
		return !value && value !== 0 && value !== false;
	}

	/**
	 * Parse number
	 * @param value
	 * @param locale default 'en-US'
	 * @returns number
	 */
	static parseNumber(value: string, locale: string = 'en-US'): number {
		const example = Intl.NumberFormat(locale).format(1.1);
		const cleanPattern = new RegExp(`[^-+0-9${example.charAt(1)}]`, 'g');
		const cleaned = value?.replace(cleanPattern, '');
		const normalized = cleaned.replace(example.charAt(1), '.');
		return parseFloat(normalized);
	}

	/**
	 * Convert string to a number
	 * @param value
	 * @param originLocale
	 * @returns
	 */
	static converStringToNumber(value: string, originLocale: string = 'en-US'): number {
		if (originLocale) {
			originLocale = originLocale.replace('_', '-');
		}
		if (Number.isNaN(Number(value))) {
			return this.parseNumber(value, originLocale);
		}

		return Number(value);
	}

	/**
	 * Convert string to date
	 * @param value
	 * @returns Date
	 */
	static stringToDate(value: string): Date | null {
		const d: Date = new Date();
		d.setHours(0, 0, 0, 0);
		d.setTime(value as any);

		const parsedDate = new Date(Date.parse(value));
		const plainDate = new Date(value);

		if (d.toString() === 'Invalid Date' && parsedDate.toString() === 'Invalid Date') {
			return null;
		}

		if (d.toString() !== 'Invalid Date') {
			return d;
		} else if (parsedDate !== null) {
			return parsedDate;
		} else if (plainDate.toString() !== 'Invalid Date') {
			return plainDate;
		}
		return null;
	}

	/**
	 * Checks if a string is a number in the specified locale
	 * @param value
	 * @param locale Default en-US
	 * @returns boolean
	 */
	static isNumber(value: string, locale: string = 'en-US'): boolean {
		// Allow values for locale number formats such as whitespace "," and "."
		if (
			(value
				.match(/\D/g)
				?.join('')
				.replace(/[\s,.-]/g, '').length as number) > 0
		) {
			return false;
		}
		return Number.isNaN(this.converStringToNumber(value, locale)) === false;
	}

	/**
	 * Get object from keys
	 * @param obj
	 * @returns
	 */
	static getObjectFromKeys(obj: { [key: string]: boolean }): any {
		const props: any = {};
		Object.keys(obj).map((k) => (props[k] = null));
		return props;
	}

	/**
	 * Return an object with only the keys that don't exist
	 * @param object
	 * @param remove
	 * @returns
	 */
	static getKeysThatDontExist(object: { [key: string]: any }, remove: { [key: string]: any }): {} {
		const copyObject = { ...object };
		Object.keys(copyObject)
			.filter((k) => remove.hasOwnProperty(k))
			.map((k) => delete copyObject[k]);
		return copyObject;
	}
}
