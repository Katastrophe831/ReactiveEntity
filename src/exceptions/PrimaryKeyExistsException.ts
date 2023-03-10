import { Exception } from './Exception';
import { ExceptionParams } from './Types';

export class PrimaryKeyExistsException extends Exception {
	constructor(
		public params: ExceptionParams = null,
		public key: string = 'exceptions.entity.primarykeyexists',
		public defaultMessage: string = 'Primary Key {{0}} already exists on this entity',
	) {
		super(...arguments);
	}
}
