import { Exception } from './Exception';
import { ExceptionParams } from './Types';

export class AttributeRequiredException extends Exception {
	constructor(
		public params: ExceptionParams = null,
		public key: string = 'entity#attributerequired',
		public defaultMessage: string = 'Attribute {{0}} is required',
	) {
		super(...arguments);
	}
}
