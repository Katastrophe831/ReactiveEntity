// https://github.com/mikeerickson/validatorjs

import { Entity, AttributeValidator, ValidatorCallbackType } from '../../entity';
import * as Validator from 'validatorjs';

export interface ValidatorJSConfig extends AttributeValidator {
	rules: string | (string | Validator.TypeCheckingRule)[] | Validator.Rules;
}

export const ValidatorJS = (config: ValidatorJSConfig) => (target: Entity, member: string) => {
	// This is required to register custom decorators
	target.registerAttributeName(member);
	
	const uniqueName = 'ValidatorJS';

	const args = {
		[member]: config.rules,
	};

	target.registerAttributeValidator(uniqueName, member, {
		args, // This will be passed back to the callback function
		callback,
	});
};

const callback: ValidatorCallbackType = (entityData: object, attribute: string, value: any, params: any) => {
	// Assign new value to cloned data in order to run validation
	const data = Object.assign(entityData, { [attribute]: value });
	const validator = new Validator(data, params);
	/* validator.setAttributeNames({
		[attribute]: 'TEST'
	}); */
	if (validator.fails()) {
		const error = validator.errors.first(attribute) as string;
		// TODO: Throw Entity Exception
		// TODO: Localize exception message
		throw new Error(error);
	}
};
