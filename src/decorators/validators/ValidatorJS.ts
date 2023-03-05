// https://github.com/mikeerickson/validatorjs
import Validator from 'validatorjs';
import { Entity, ValidatorDecoratorConfig, ValidatorCallbackType, ValidatorCallbackParams } from '../../entity';

export interface ValidatorJSConfig extends ValidatorDecoratorConfig {
	rules: string | (string | Validator.TypeCheckingRule)[] | Validator.Rules;
}

export const ValidatorJS = (config: ValidatorJSConfig) => (target: Entity, member: string) => {
	const decoratorName = 'ValidatorJS';

	const rules = {
		[member]: config.rules,
	};

	target.registerAttributeValidator(decoratorName, member, {
		args: rules, // This will be passed back to the callback function 'params' argument
		callback: validator,
	});
};

const validator: ValidatorCallbackType = (params: ValidatorCallbackParams) => {
	const { entityData, attribute, newValue, translations, args } = params;

	const validator = new Validator(entityData, args);
	validator.setAttributeNames(translations);
	if (validator.fails()) {
		let error = validator.errors.first(attribute) as string;
		throw new Error(error);
	}
};
