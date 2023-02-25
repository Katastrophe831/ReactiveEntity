import { Utils } from './Utils';

export class MessageFormatter {
	/**
	 * Formats a string with an array or an object.  Format values such as {{0}} if 'keys' is an array
	 * or {{prop1}} if 'keys' is an object with 'prop1' as the key of the object.  If a key is not found, it will be {{key}} will be replaced with #key#
	 * @param value String value
	 * @param keys string[] | object
	 * @returns string
	 */
	static formatString(value: string | undefined, keys: string | string[] | object | undefined | null): string | null {
		if (value === undefined || value === null) {
			return null;
		}
		if (typeof keys === 'string') {
			keys = [keys];
		}
		let val: string = value.toString();
		if (Array.isArray(keys) === true) {
			const replacementKeys: string[] = keys as string[];
			for (let i = 0; i < replacementKeys.length; i++) {
				val = Utils.replaceAll(val, '{{' + i + '}}', replacementKeys[i]);
			}
		}
		if (typeof keys === 'undefined' || keys === null) {
			keys = {};
		}
		if (keys) {
			const re = /\{\{(.*?)\}\}/;
			let match: RegExpExecArray | null = re.exec(val);
			while (match) {
				const replacementValue = (keys as any)[match[1]];
				if (replacementValue) {
					val = Utils.replaceAll(val, match[0], replacementValue);
				} else {
					val = Utils.replaceAll(val, match[0], `#${match[1]}#`);
				}
				match = re.exec(val);
			}
		}
		return val;
	}
}
