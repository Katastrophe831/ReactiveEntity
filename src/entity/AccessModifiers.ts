import { AttributeBooleanType } from './Types';

export class AccessModifiers {
	private NOCHANGE: AttributeBooleanType = {};

	public canDoChange(attribute: string) {
		const result = this.NOCHANGE[attribute] ?? false;
		delete this.NOCHANGE[attribute];
		return result;
	}

	public addNoChange(attribute: string) {
		this.NOCHANGE[attribute] = true;
	}
}
