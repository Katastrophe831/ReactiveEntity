import { MessageFormatter } from '../../utils/MessageFormatter';

describe('MessageFormatter Tests', () => {
	test('formatString', () => {
		expect(MessageFormatter.formatString('Attribute {{0}} is readonly', 'NAME')).toBe('Attribute NAME is readonly');
		expect(MessageFormatter.formatString('Attribute {{0}} is readonly', ['NAME'])).toBe('Attribute NAME is readonly');
		expect(MessageFormatter.formatString('Attribute {{0}} is {{1}}', ['NAME', 'readonly'])).toBe(
			'Attribute NAME is readonly',
		);
		expect(MessageFormatter.formatString('Attribute {{0}} is {{1}} - Test {{2}}', ['NAME', 'readonly'])).toBe(
			'Attribute NAME is readonly - Test #2#',
		);
		expect(
			MessageFormatter.formatString('Attribute {{attribute}} is {{message}}', { attribute: 'NAME', message: 'readonly' }),
		).toBe('Attribute NAME is readonly');
		expect(
			MessageFormatter.formatString('Attribute {{attribute}} is {{message}}', {
				attribute: 'NAME',
				message_2: 'readonly',
			}),
		).toBe('Attribute NAME is #message#');
	});
});
