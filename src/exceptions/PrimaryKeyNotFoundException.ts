import { Exception } from './Exception';
import { ExceptionParams } from './Types';

export class PrimaryKeyNotFoundException extends Exception {
	constructor(
		public params: ExceptionParams = null,
		public key: string = 'exceptions.entity.primarykeynotfound',
		public defaultMessage: string = 'Primary key not defined for object {{0}}',
	) {
		super(...arguments);
	}
}
