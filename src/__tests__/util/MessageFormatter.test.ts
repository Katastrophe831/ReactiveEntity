import { MessageFormatter } from '../../utils/MessageFormatter';

describe('MessageFormatter', () => {
	test('should format string with index placeholder', () => {
		expect(MessageFormatter.formatString('Attribute {{0}} is readonly', 'NAME')).toBe('Attribute NAME is readonly');
		expect(MessageFormatter.formatString('Attribute {{0}} is readonly', ['NAME'])).toBe('Attribute NAME is readonly');
		expect(MessageFormatter.formatString('Attribute {{0}} is {{1}}', ['NAME', 'readonly'])).toBe(
			'Attribute NAME is readonly',
		);
	});

	test('should partially format index and replace missing keys with #<any>#', () => {
		expect(MessageFormatter.formatString('Attribute {{0}} is {{1}} - Test {{2}}', ['NAME', 'readonly'])).toBe(
			'Attribute NAME is readonly - Test #2#',
		);
	});

	test('should format string with JSON attribute name placeholder', () => {
		expect(
			MessageFormatter.formatString('Attribute {{attribute}} is {{message}}', { attribute: 'NAME', message: 'readonly' }),
		).toBe('Attribute NAME is readonly');
	});

	test('should partially format JSON attribute and replace missing keys with #<any>#', () => {
		expect(
			MessageFormatter.formatString('Attribute {{attribute}} is {{message}}', {
				attribute: 'NAME',
				message_2: 'readonly',
			}),
		).toBe('Attribute NAME is #message#');
	});
});
