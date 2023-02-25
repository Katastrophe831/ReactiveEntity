import { Exception } from './Exception';
import { ExceptionParams } from './Types';

export class EntityException extends Exception {
	constructor(public params: ExceptionParams, public key: string, public defaultMessage: string) {
		super(...arguments);
	}
}
