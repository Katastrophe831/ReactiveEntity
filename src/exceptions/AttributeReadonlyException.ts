import { Exception } from './Exception';
import { ExceptionParams } from './Types';

export class AttributeReadonlyException extends Exception {
	constructor(
		public params: ExceptionParams = null,
		public key: string = 'entity#attributereadonly',
		public defaultMessage: string = '{{0}} is readonly',
	) {
		super(...arguments);
	}
}
