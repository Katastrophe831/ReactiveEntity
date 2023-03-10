import { Exception } from './Exception';
import { ExceptionParams } from './Types';

export class AttributeRequiredException extends Exception {
	constructor(
		public params: ExceptionParams = null,
		public key: string = 'exceptions.entity.attributerequired',
		public defaultMessage: string = '{{0}} is required',
	) {
		super(...arguments);
	}
}
