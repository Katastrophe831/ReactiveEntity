import { Exception } from './Exception';
import { ExceptionParams } from './Types';

export class EntitySetReadonlyException extends Exception {
	constructor(
		public params: ExceptionParams = null,
		public key: string = 'entityset#readonly',
		public defaultMessage: string = 'Entity Set {{0}} is readonly',
	) {
		super(...arguments);
	}
}
