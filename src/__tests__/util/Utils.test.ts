import { Utils } from '../../utils/Utils';

describe('Utils Tests', () => {
	test('should replace all in a string', () => {
		expect(Utils.replaceAll('Attribute {0} is readonly', '{0}', 'NAME')).toBe('Attribute NAME is readonly');
		expect(Utils.replaceAll('Attribute {{0}} is readonly', '{{0}}', 'NAME')).toBe('Attribute NAME is readonly');
	});

	test('should check if a value is null or undefined or empty string', () => {
		// False statements
		expect(Utils.isNullOrEmpty('null')).toBe(false);
		expect(Utils.isNullOrEmpty('1')).toBe(false);
		expect(Utils.isNullOrEmpty('0')).toBe(false);
		expect(Utils.isNullOrEmpty(1)).toBe(false);
		expect(Utils.isNullOrEmpty(0)).toBe(false);
		expect(Utils.isNullOrEmpty(true)).toBe(false);
		expect(Utils.isNullOrEmpty(false)).toBe(false);

		// True statements
		expect(Utils.isNullOrEmpty('')).toBe(true);
		expect(Utils.isNullOrEmpty(null)).toBe(true);
		expect(Utils.isNullOrEmpty(undefined)).toBe(true);
	});

	test('should convert a string to a Date', () => {
		const date = new Date();
		expect(Utils.stringToDate('' + date.getTime())).toMatchObject(date);
		expect(Utils.stringToDate(date.toISOString())).toMatchObject(date);
	});

	test('should parse a "en-US" string to a number', () => {
		expect(Utils.parseNumber('1.2')).toBe(1.2);
		expect(Utils.parseNumber('1,200')).toBe(1200);
		expect(Utils.parseNumber('1,200.2')).toBe(1200.2);
	});

	test('should parse a "fr-FR" string to a number ', () => {
		expect(Utils.parseNumber('1,2', 'fr-FR')).toBe(1.2);
		expect(Utils.parseNumber('1 200', 'fr-FR')).toBe(1200);
		expect(Utils.parseNumber('1 200,2', 'fr-FR')).toBe(1200.2);
	});

	test('should check if a string is a "en-US" number', () => {
		const date = new Date();
		expect(Utils.isNumber('1.2')).toBe(true);
		expect(Utils.isNumber('1.2b')).toBe(false);
		expect(Utils.isNumber('b1.2')).toBe(false);
	});

	test('should check if a string is a "fr-FR" number', () => {
		const date = new Date();
		expect(Utils.isNumber('1,2', 'fr-FR')).toBe(true);
		expect(Utils.isNumber('1 200,2', 'fr-FR')).toBe(true);
		expect(Utils.isNumber('1 200,2b', 'fr-FR')).toBe(false);
		expect(Utils.isNumber('b1 200,2', 'fr-FR')).toBe(false);
	});

	test('should get all keys from an object and convert them to null', () => {
		const thisObject = {
			KEY1: true,
			KEY2: true,
		};
		const thatObject = {
			KEY1: null,
			KEY2: null,
		};
		expect(Utils.getObjectFromKeys(thisObject)).toMatchObject(thatObject);
	});

	test('should take two objects and return an object with only keys that dont exist', () => {
		const existingObject = {
			EXISTS1: true,
			EXISTS2: true,
			DOESNOTEXIST: true,
		};
		const remove = {
			EXISTS1: '1',
			EXISTS2: '1',
			EXISTS3: '1',
		};
		const keysThatDontExist = {
			DOESNOTEXIST: true,
		};
		expect(Utils.getKeysThatDontExist(existingObject, remove)).toMatchObject(keysThatDontExist);
	});
});
