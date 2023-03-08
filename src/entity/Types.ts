import { Entity } from '.';

export type EntityType = new (args?: EntityArgs) => Entity;

export type EntityAttributes<T> = {
	[P in keyof T]?: () => any;
};

export type FieldMessage = { [key: string]: EntityMessage };

export type AttributeBooleanType = { [key: string]: boolean };

export type AttributeValidatorType = { [key: string]: ValidatorDecoratorConfig };

export type AttributeMetaData = AttributeMetaDataBooleanProperties & {
	/**
	 * Hold all field messages
	 */
	messages: FieldMessage;

	/**
	 * Validator
	 */
	validator: AttributeValidatorType;
};

export type AttributeMetaDataBooleanProperties = {
	/**
	 * Complete list of attributes
	 */
	attributeList: AttributeBooleanType;

	/**
	 * Holds all fields that are modified
	 */
	isModified: AttributeBooleanType;

	/**
	 * Holds all fields that are readonly
	 */
	isReadonly: AttributeBooleanType;

	/**
	 * Holds all fields that are required
	 */
	isRequired: AttributeBooleanType;

	/**
	 * Hold all fields that are hidden
	 */
	isHidden: AttributeBooleanType;

	/**
	 * Hold all fields that are non-persistent
	 */
	isNonPersistent: AttributeBooleanType;

	/**
	 * Primary key
	 */
	primaryKey: AttributeBooleanType;
};

export type ValidatorDecoratorConfig = {
	/**
	 * Validator decorator
	 * @param target
	 * @param value
	 * @returns
	 */
	onValidate?: OnValidateType;
};

export type OnValidateType = (target: object, attribute: string, value: any) => void;

export type ValidatorCallbackParams = {
	args: any;
	entityData: object;
	attribute: string;
	newValue: any;
	lang: string;
	translations: {};
};

export type ValidatorCallbackType = (params: ValidatorCallbackParams) => void;

export type ValidatorArgType = { property: string; args: any };

export type ValidatorType = { [key: string]: (ValidatorCallbackType | ValidatorArgType)[] };

export type EntitySetArgs = {
	/**
	 * Populate data set
	 */
	data?: any[];

	/**
	 * Owner Entity
	 */
	owner?: Entity | null;

	/**
	 * App name
	 */
	appName?: string | null;

	/**
	 * Initialize as readonly
	 */
	isReadonly?: boolean;
};

export type EntityArgs = {
	/**
	 * Populate entity values
	 */
	data?: {};
} & EntitySetArgs;

export type BaseEntityMetaData = {
	ownerEntity: Entity | null;

	appName: string | null;

	toBeSaved: boolean;

	isReadonly: boolean;
};

export type EntityMessage = {
	type: 'error' | 'warn' | 'info';

	message: string;
};

export const entityArgsTypeGuard = (args: EntityArgs): args is EntityArgs => {
	if (!Array.isArray((args as EntityArgs).data) && typeof args.data === 'object') {
		return true;
	}
	return false;
};

export const entitySetArgsTypeGuard = (args: EntityArgs): args is EntityArgs => {
	if (Array.isArray((args as EntityArgs).data) && typeof args.data === 'object') {
		return true;
	}
	return false;
};

export enum FieldAccess {
	NOCHANGE,
}
