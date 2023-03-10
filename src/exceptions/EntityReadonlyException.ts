import { Exception } from './Exception';
import { ExceptionParams } from './Types';

export class EntityReadonlyException extends Exception {
	constructor(
		public params: ExceptionParams = null,
		public key: string = 'exceptions.entity.readonly',
		public defaultMessage: string = 'Entity {{0}} is readonly',
	) {
		super(...arguments);
	}
}
