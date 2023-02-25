import { Utils } from '../utils';
import {
	EntityArgs,
	EntityMetaData,
	EntityMessage,
	EntitySet,
	FieldMessage,
	AttributeBooleanType,
	entityArgsTypeGuard,
	ValidatorType,
	ValidatorCallbackType,
	ValidatorArgType,
	FieldAccess,
	AccessModifiers,
} from '.';
import {
	AttributeNotFoundException,
	AttributeReadonlyException,
	AttributeRequiredException,
	EntityReadonlyException,
} from '../exceptions';

export class Entity {
	/**
	 * Holds all entity relationship objects
	 */
	private __RELATIONS!: { [key: string]: EntitySet };

	/**
	 * Holds all validators through decorators
	 */
	private __ATTRIBUTE_VALIDATORS!: ValidatorType;

	private __METADATA!: EntityMetaData;

	private __ACCESS_MODIFIERS!: AccessModifiers;

	/**
	 * Constructor
	 * @param args
	 */
	constructor(args?: {} | EntityArgs) {
		let data: any;

		if (args !== undefined) {
			if (entityArgsTypeGuard(args)) {
				this.metaData.ownerEntity = args.owner || null;
				this.metaData.appName = args.appName ?? null;
				this.metaData.isReadonly = args.isReadonly ?? false;
				data = args.data;
			} else {
				data = args;
			}
		}

		Object.assign(this, data, this.metaData.getUndeclaredProperties(data));

		return new Proxy(this, this.proxyHandler);
	}

	/**
	 * App name
	 */
	public get appName(): string | null {
		return this.metaData.appName;
	}

	/**
	 * Set app name
	 */
	public set appName(app: string | null) {
		this.metaData.appName = app;
	}

	/**
	 * Get meta data
	 */
	public get metaData(): EntityMetaData {
		if (!this.__METADATA) {
			this.__METADATA = new EntityMetaData();
		}
		return this.__METADATA;
	}

	/**
	 * Get meta data
	 */
	protected get attributeValidators(): ValidatorType {
		if (!this.__ATTRIBUTE_VALIDATORS) {
			this.__ATTRIBUTE_VALIDATORS = {};
		}
		return this.__ATTRIBUTE_VALIDATORS;
	}

	/**
	 * Is readonly
	 */
	public get isReadonly(): boolean {
		return this.metaData.isReadonly;
	}

	/**
	 * Is selected
	 */
	public get isSelected(): boolean {
		return this.metaData.isSelected;
	}

	/**
	 * Is Entity to be saved
	 * @returns boolean
	 */
	public get toBeSaved(): boolean {
		return this.metaData.toBeSaved;
	}

	/**
	 * Is Entity to be saved
	 * @returns boolean
	 */
	public get toBeDeleted(): boolean {
		return this.metaData.toBeDeleted;
	}

	/**
	 * Getter for all field messages
	 */
	public get fieldMessages(): FieldMessage {
		return this.metaData.attributes.messages;
	}

	/**
	 * DTO object
	 * @returns
	 */
	public get asData(): {} {
		return JSON.stringify({ ...this }, (key, value) => {
			// remove non-persistent data
			if (key.startsWith('__') || this.metaData.attributes.isNonPersistent[key] === true) {
				return undefined;
			}

			if (this.fieldRequired[key] && this.isNull(key as any)) {
				throw new AttributeRequiredException(key);
			}
			return value;
		});
	}

	/**
	 * Marks the entity to be deleted.  This doesn't persist to the back end until .save() is called
	 */
	public delete(): void {
		this.metaData.toBeDeleted = true;
	}

	/**
	 * Unmarks the entity to be deleted.
	 */
	public undelete(): void {
		this.metaData.toBeDeleted = false;
	}

	/**
	 * Is attribute modified
	 * @param attribute
	 * @returns
	 */
	public isFieldModified<K extends keyof this>(attribute: K): boolean {
		return this.fieldModified[attribute] ?? false;
	}

	/**
	 * Is attribute readonly
	 * @param attribute
	 * @returns
	 */
	public isFieldReadonly<K extends keyof this>(attribute: K): boolean {
		return this.onFieldReadonly(attribute as string, this.fieldReadonly[attribute]);
	}

	/**
	 * Is attribute required
	 * @param attribute
	 * @returns
	 */
	public isFieldRequired<K extends keyof this>(attribute: K): boolean {
		return this.onFieldRequired(attribute as string, this.fieldRequired[attribute]);
	}

	/**
	 * Is attribute hidden
	 * @param attribute
	 * @returns
	 */
	public isFieldHidden<K extends keyof this>(attribute: K): boolean {
		return this.onFieldHidden(attribute as string, this.fieldHidden[attribute]);
	}

	/**
	 * Is attribute null
	 * @param attribute
	 * @returns boolean
	 */
	public isNull<K extends keyof this>(attribute: K): boolean {
		return Utils.isNullOrEmpty(this.getValue(attribute));
	}

	/**
	 * Is attribute not null
	 * @param attribute
	 * @returns boolean
	 */
	public isNotNull<K extends keyof this>(attribute: K): boolean {
		return this.isNull(attribute) === false;
	}

	/**
	 * Is attribute value a number
	 * @param attribute
	 * @returns
	 */
	public isNumber<K extends keyof this>(attribute: K): boolean {
		if (this.isNull(attribute)) {
			return true;
		}

		// TODO : Support locale
		return Utils.isNumber('' + this.getValue(attribute));
	}

	/**
	 * Set entity to readonly
	 * @param isReadonly
	 */
	public setReadonly(isReadonly: boolean): void {
		this.metaData.isReadonly = isReadonly ?? false;
	}

	/**
	 * Set attribute to readonly
	 * @param attribute
	 * @param readonly
	 */
	public setFieldReadonly(attribute: string | string[], readonly: boolean): void {
		if (Array.isArray(attribute)) {
			for (const attr of attribute) {
				this.metaData.attributes.isReadonly[attr] = readonly;
			}
		} else {
			this.metaData.attributes.isReadonly[attribute as string] = readonly;
		}
	}

	/**
	 * Set attribute to required
	 * @param attribute
	 * @param required
	 */
	public setFieldRequired(attribute: string | string[], required: boolean): void {
		if (Array.isArray(attribute)) {
			for (const attr of attribute) {
				this.metaData.attributes.isRequired[attr] = required;
			}
		} else {
			this.metaData.attributes.isRequired[attribute as string] = required;
		}
	}

	/**
	 * Get raw value
	 * @param attribute
	 * @returns any
	 */
	public getValue<K extends keyof this>(attribute: K): any | null {
		if (attribute in this) {
			const value = this[attribute];
			if (value === undefined || typeof value === 'undefined') {
				throw new AttributeNotFoundException(attribute);
			}
			return value;
		} else {
			throw new AttributeNotFoundException(attribute);
		}
	}

	/**
	 * Get string value
	 * @param attribute
	 * @returns string
	 */
	public getString<K extends keyof this>(attribute: K): string | null {
		if (this.isNotNull(attribute)) {
			const returnValue = this.getValue(attribute);
			return '' + returnValue;
		}
		return null;
	}

	/**
	 * Get number
	 * @param attribute
	 * @returns number
	 */
	public getNumber<K extends keyof this>(attribute: K): number | null {
		if (this.isNotNull(attribute)) {
			const returnValue = this.getValue(attribute);
			return Utils.converStringToNumber('' + returnValue);
		}
		return null;
	}

	/**
	 * Get boolean
	 * @param attribute
	 * @returns boolean
	 */
	public getBoolean<K extends keyof this>(attribute: K): boolean {
		const val = this.getValue(attribute);
		return val === '1' || val === true || val === 'Y' || val === 'y';
	}

	/**
	 * Get date
	 * @param attribute
	 * @returns Date | null
	 */
	public getDate<K extends keyof this>(attribute: K): Date | null {
		const value = this.getString(attribute);
		if (typeof value === 'string') {
			return Utils.stringToDate(value);
		}
		return null;
	}

	/**
	 * Set value
	 * @param attribute
	 * @param value
	 * @param flag
	 */
	public setValue<K extends keyof this>(attribute: K, value: any, flag?: FieldAccess): void {
		if (flag === FieldAccess.NOCHANGE) {
			this.accessModifiers.addNoChange(attribute as string);
		}
		// let proxy handle
		(this as any)[attribute] = value;
	}

	/**
	 * Set field warning
	 * @param attribute
	 * @param message String
	 */
	public setFieldWarning<K extends keyof this>(attribute: K, message: string) {
		this.setFieldMessage(attribute, {
			type: 'warn',
			message,
		});
	}

	/**
	 * Set field error
	 * @param attribute
	 * @param message String
	 */
	public setFieldError<K extends keyof this>(attribute: K, message: string) {
		this.setFieldMessage(attribute, {
			type: 'error',
			message,
		});
	}

	/**
	 * Set field info
	 * @param attribute
	 * @param message String
	 */
	public setFieldInfo<K extends keyof this>(attribute: K, message: string) {
		this.setFieldMessage(attribute, {
			type: 'info',
			message,
		});
	}

	/**
	 * Clear field message
	 * @param attribute
	 */
	public clearFieldMessage<K extends keyof this>(attribute: K) {
		delete this.metaData.attributes.messages[attribute as any];
	}

	/**
	 * Marks the entity as selected
	 */
	public select(): void {
		this.metaData.isSelected = true;
	}

	/**
	 * Unselects entity
	 */
	public unselect(): void {
		this.metaData.isSelected = false;
	}
	/**
	 * Toggles entity selection
	 */
	public selectToggle(): void {
		this.metaData.isSelected = !this.metaData.isSelected;
	}

	/**
	 * Clones object data
	 * @returns
	 */
	public clone(): object {
		return Object.assign({}, this);
	}

	/**
	 * Create a copy of the Entity
	 * @returns
	 */
	public copy(): Entity {
		return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
	}

	/**
	 * Copy to entity
	 * @param destination
	 */
	public copyTo(destination: Entity): void {
		if (destination) {
			Object.assign(destination, this);
		}
	}

	/**
	 * Resets and clears any unsaved changes
	 */
	public reset(): void {
		this.metaData.reset();
	}

	/**
	 * Register attribute validators
	 * @param name Register a unique name for a validator function
	 * @param property Attribute name to register
	 * @param validator args : any - arguments to be passed back to the callback function
	 * 					callback : ValidatorCallbackType
	 */
	public registerAttributeValidator(
		name: string,
		property: string,
		validator: { args?: any; callback: ValidatorCallbackType },
	) {
		// This will register a unique validator name with a callback function, then store each property/args in the array
		if (!this.attributeValidators[name]) {
			this.attributeValidators[name] = [validator.callback, { property, args: validator.args }];
		} else {
			this.attributeValidators[name].push({ property, args: validator.args });
		}
	}

	/**
	 * Getter for all required attributes
	 */
	protected get fieldRequired(): AttributeBooleanType {
		return this.metaData.attributes.isRequired;
	}

	/**
	 * Getter for all modified attributes
	 */
	protected get fieldModified(): AttributeBooleanType {
		return this.metaData.attributes.isModified;
	}

	/**
	 * Getter for all readonly attributes
	 */
	protected get fieldReadonly(): AttributeBooleanType {
		return this.metaData.attributes.isReadonly;
	}

	/**
	 * Getter for all hidden attributes
	 */
	protected get fieldHidden(): AttributeBooleanType {
		return this.metaData.attributes.isHidden;
	}

	/**
	 * Set field message
	 * @param attribute
	 * @param message Message
	 */
	protected setFieldMessage<K extends keyof this>(attribute: K, message: EntityMessage) {
		this.metaData.attributes.messages[attribute as any] = message;
	}

	/**
	 * Throws an exception if entity cannot be updated
	 * @param attribute
	 */
	protected canModify(attribute?: string): void {
		if (this.isReadonly) {
			throw new EntityReadonlyException(this.constructor.name);
		} else if (attribute) {
			if (this.isFieldReadonly(attribute as any) === true) {
				throw new AttributeReadonlyException(attribute);
			}
		}
	}

	/**
	 * On before field change event interceptor
	 * @param attribute
	 * @param value
	 * @returns
	 */
	protected onBeforeChange(attribute: string, value: any): any {
		return value;
	}

	/**
	 * On after field change event interceptor
	 * @param attribute
	 * @param value
	 */
	protected onAfterChange(attribute: string, value: any): void {
		return;
	}

	/**
	 * On field readonly event interceptor
	 * @param attribute
	 * @param value
	 * @returns
	 */
	protected onFieldReadonly(attribute: string, value: boolean): boolean {
		return typeof value === 'boolean' ? value : false;
	}

	/**
	 * On field required event interceptor
	 * @param attribute
	 * @param value
	 * @returns
	 */
	protected onFieldRequired(attribute: string, value: boolean): boolean {
		return typeof value === 'boolean' ? value : false;
	}

	/**
	 * On field hidden event interceptor
	 * @param attribute
	 * @param value
	 * @returns
	 */
	protected onFieldHidden(attribute: string, value: boolean): boolean {
		return typeof value === 'boolean' ? value : false;
	}

	/**
	 * Access modifiers
	 */
	private get accessModifiers() {
		if (!this.__ACCESS_MODIFIERS) {
			this.__ACCESS_MODIFIERS = new AccessModifiers();
		}
		return this.__ACCESS_MODIFIERS;
	}

	/**
	 * Set field modified meta data and mark entity as to be saved if true
	 * @param attribute
	 * @param modified
	 */
	private setFieldModified(attribute: string, modified: boolean): void {
		this.metaData.attributes.isModified[attribute] = modified;
		if (modified === true) {
			this.metaData.toBeSaved = true;
		}
	}

	/**
	 * Run beforeChange methods for a given attribute
	 * @param attribute
	 * @param value
	 */
	private beforeChange(attribute: string, value: any): any {
		return this.onBeforeChange(attribute, value);
	}

	/**
	 * Run afterChange methods for a given property
	 * @param attribute
	 * @param value
	 */
	private afterChange(attribute: string, value: any): void {
		return this.onAfterChange(attribute, value);
	}

	/**
	 * Encapulsate set logic value
	 * @param attribute
	 * @param value
	 */
	private _setValue(attribute: string, value: any) {
		// throws exception if any
		this.canModify(attribute);

		const newValue = this.beforeChange(attribute, value);

		this.validateField(attribute, newValue);

		(this as any)[attribute] = newValue;

		this.setFieldModified(attribute, true);

		this.afterChange(attribute, (this as any)[attribute]);
	}

	/**
	 * Validate field
	 * @param attribute
	 * @param value
	 */
	private validateField(attribute: string, value: any) {
		Object.keys(this.attributeValidators).forEach((k) => {
			const [validator, ...args] = this.attributeValidators[k];
			if (typeof validator === 'function') {
				const param: ValidatorArgType[] = (args as ValidatorArgType[]).filter((a) => a.property === attribute);
				if (param.length > 0) {
					try {
						(validator as ValidatorCallbackType)(this.clone(), attribute, value, param[0].args);
					} catch (e) {
						this.setFieldError(attribute as any, (e as Error).message);
						throw e;
					}
				}
			}
		});
	}

	/**
	 * Proxy handler
	 * @returns
	 */
	private get proxyHandler() {
		return {
			set(target: Entity, property: any, descriptor: any) {
				if (('' + property).startsWith('__')) {
					// ignore
				} else {
					if (target.accessModifiers.canDoChange(property) === true) {
						(target as any)[property] = descriptor;
					} else {
						target._setValue(property, descriptor);
					}
				}
				return true;
			},
			/*get(target: Entity, property: any, receiver: any) {
				if (property in target) {
					return (target as any)[property];
				} else {
					return undefined;
				}
			},
			ownKeys(target : Entity) {
				return Object.keys(target).filter(key => !key.startsWith('__'));
			}
			deleteProperty(target: Entity, property: any) {
				return true;
			},
			defineProperty(target: Entity, property: any, descriptor: any) {
				return true;
			}, */
		};
	}
}
