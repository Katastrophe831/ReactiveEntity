import { MessageFormatter } from '../utils';
import { ExceptionKey, ExceptionParams } from '.';
import { TranslationService } from '../i18n';

export class Exception extends Error {
	constructor(public params?: ExceptionParams, public key?: ExceptionKey, public defaultMessage?: string) {
		super();
		Object.setPrototypeOf(this, Exception.prototype);
	}

	public get message(): string {
		let msg: string = TranslationService.getInstance().translateNamespace(this.key ?? '');
		if (msg === this.key) {
			msg = this.defaultMessage ?? msg;
		}
		msg = MessageFormatter.formatString(msg, this.params) ?? '';
		return msg;
	}
}
