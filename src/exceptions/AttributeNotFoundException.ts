import { Exception } from './Exception';
import { ExceptionParams } from './Types';

export class AttributeNotFoundException extends Exception {
	constructor(
		public params: ExceptionParams = null,
		public key: string = 'entity#attributenotfound',
		public defaultMessage: string = '{{0}} does not exists',
	) {
		super(...arguments);
	}
}
