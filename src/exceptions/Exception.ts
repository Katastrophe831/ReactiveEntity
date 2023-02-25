import { MessageFormatter } from '../utils';
import { ExceptionKey, ExceptionParams } from '.';

export class Exception extends Error {
	constructor(public params?: ExceptionParams, public key?: ExceptionKey, public defaultMessage?: string) {
		super();
		Object.setPrototypeOf(this, Exception.prototype);
	}

	public get message(): string {
		return MessageFormatter.formatString(this.defaultMessage, this.params) ?? '';
	}
}
