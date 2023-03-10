import { TranslationService } from '../i18n';
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
	ValidatorCallbackParams,
	Keys,
} from '.';
import {
	AttributeNotFoundException,
	AttributeReadonlyException,
	AttributeRequiredException,
	EntityReadonlyException,
	PrimaryKeyNotFoundException,
	PrimaryKeyExistsException,
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

		this.useLang('en');

		return new Proxy(this, this.proxyHandler);
	}

	/**
	 * Entity name
	 */
	public get name(): string {
		return this.constructor.name;
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
		this.translateEntityKeys();
	}

	/**
	 * Get primary key name
	 */
	public get primaryKeyName(): string {
		const value = this.metaData.primaryKeyName;
		if (value === null) {
			throw new PrimaryKeyNotFoundException(this.name);
		}
		return value;
	}

	/**
	 * Get primary key value
	 */
	public get primaryKeyValue(): any {
		return this[this.primaryKeyName as Keys<this>];
	}

	/**
	 * Has primary key attribute defined
	 * @returns
	 */
	public get hasPrimaryKey(): boolean {
		return this.metaData.primaryKeyName !== null;
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
	 * Unmarks the entity to be deleted.
	 */
	public deleteToggle(): void {
		this.metaData.toBeDeleted = !this.metaData.toBeDeleted;
	}

	/**
	 * Is attribute modified
	 * @param attribute
	 * @returns
	 */
	public isFieldModified<K extends Keys<this>>(attribute: K): boolean {
		return this.modifiedFields[attribute] ?? false;
	}

	/**
	 * Is attribute readonly
	 * @param attribute
	 * @returns
	 */
	public isFieldReadonly<K extends Keys<this>>(attribute: K): boolean {
		if (this.isReadonly) {
			return true;
		}
		return this.onFieldReadonly(attribute, this.readonlyFields[attribute] ?? false);
	}

	/**
	 * Is attribute required
	 * @param attribute
	 * @returns
	 */
	public isFieldRequired<K extends Keys<this>>(attribute: K): boolean {
		return this.onFieldRequired(attribute, this.requiredFields[attribute] ?? false);
	}

	/**
	 * Is attribute hidden
	 * @param attribute
	 * @returns
	 */
	public isFieldHidden<K extends Keys<this>>(attribute: K): boolean {
		return this.onFieldHidden(attribute, this.hiddenFields[attribute] ?? false);
	}

	/**
	 * Is attribute null
	 * @param attribute
	 * @returns boolean
	 */
	public isNull<K extends Keys<this>>(attribute: K): boolean {
		return Utils.isNullOrEmpty(this.getValue(attribute));
	}

	/**
	 * Is attribute not null
	 * @param attribute
	 * @returns boolean
	 */
	public isNotNull<K extends Keys<this>>(attribute: K): boolean {
		return this.isNull(attribute) === false;
	}

	/**
	 * Is attribute value a number
	 * @param attribute
	 * @returns
	 */
	public isNumber<K extends Keys<this>>(attribute: K): boolean {
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
	public setFieldReadonly<K extends Keys<this>>(attribute: K | K[], value: boolean): void {
		this.metaData.setReadonlyFields(attribute, value);
	}

	/**
	 * Set attribute to required
	 * @param attribute
	 * @param required
	 */
	public setFieldRequired<K extends Keys<this>>(attribute: K | K[], value: boolean): void {
		this.metaData.setRequiredFields(attribute, value);
	}

	/**
	 * Set attribute to hidden
	 * @param attribute
	 * @param readonly
	 */
	public setFieldHidden<K extends Keys<this>>(attribute: K | K[], value: boolean): void {
		this.metaData.setHiddenFields(attribute, value);
	}

	/**
	 * Set attribute to non persistent
	 * @param attribute
	 * @param hidden
	 */
	public setFieldNonPersistent<K extends Keys<this>>(attribute: K | K[]): void {
		this.metaData.setNonPersistentFields(attribute);
	}

	/**
	 * Register an attribute name
	 * @param attribute
	 */
	public registerAttributeName(attribute: string): void {
		this.metaData.registerAttributeName(attribute);
	}

	/**
	 * Set primary key name
	 * @param attribute
	 */
	public setPrimaryKeyName<K extends Keys<this>>(attribute: K): void {
		const value = this.metaData.primaryKeyName;
		if (value !== null) {
			throw new PrimaryKeyExistsException(this.primaryKeyName);
		}
		this.metaData.setPrimaryKeyName(attribute);
		this.setFieldRequired(attribute, true);
	}

	/**
	 * Get attribute label per language
	 * @param attribute
	 * @returns
	 */
	public getLabel<K extends Keys<this>>(attribute: K, lang?: string): string {
		const label = TranslationService.getInstance().translate(this, attribute, lang);
		return label;
	}

	/**
	 * Change language
	 * @param lang
	 */
	public async useLang(lang: string): Promise<void> {
		await TranslationService.getInstance().useLang(lang);
		this.translateEntityKeys();
	}

	/**
	 * Get raw value
	 * @param attribute
	 * @returns any
	 */
	public getValue<K extends Keys<this>>(attribute: K): any | null {
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
	public getString<K extends Keys<this>>(attribute: K): string | null {
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
	public getNumber<K extends Keys<this>>(attribute: K): number | null {
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
	public getBoolean<K extends Keys<this>>(attribute: K): boolean {
		const val = this.getValue(attribute);
		return val === '1' || val === true || val === 'Y' || val === 'y';
	}

	/**
	 * Get date
	 * @param attribute
	 * @returns Date | null
	 */
	public getDate<K extends Keys<this>>(attribute: K): Date | null {
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
	public setValue<K extends Keys<this>>(attribute: K, value: any, flag?: FieldAccess): void {
		if (flag === FieldAccess.NOCHANGE) {
			this.accessModifiers.addNoChange(attribute);
		}
		// let proxy handle
		this[attribute] = value;
	}

	/**
	 * Set field warning
	 * @param attribute
	 * @param message String
	 */
	public setFieldWarning<K extends Keys<this>>(attribute: K, message: string): void {
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
	public setFieldError<K extends Keys<this>>(attribute: K, message: string): void {
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
	public setFieldInfo<K extends Keys<this>>(attribute: K, message: string): void {
		this.setFieldMessage(attribute, {
			type: 'info',
			message,
		});
	}

	/**
	 * Has field message
	 * @param attribute
	 */
	public hasFieldMessage<K extends Keys<this>>(attribute: K): boolean {
		return !Utils.isNullOrEmpty(this.metaData.fieldMessages[attribute]);
	}

	/**
	 * Get field message
	 * @param attribute
	 */
	public getFieldMessage<K extends Keys<this>>(attribute: K): EntityMessage | null {
		if (this.hasFieldMessage(attribute)) {
			return this.metaData.fieldMessages[attribute] ?? null;
		}
		return null;
	}

	/**
	 * Clear field message
	 * @param attribute
	 */
	public clearFieldMessage<K extends Keys<this>>(attribute: K): void {
		delete this.metaData.fieldMessages[attribute];
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
		const data = JSON.parse(
			JSON.stringify({ ...this }, (key, value) => {
				if (key.startsWith('__')) {
					return undefined;
				}
				return value;
			}),
		);
		return Object.assign({}, data);
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
	 * Validate entity data including non-persistent data.  Throws an exception if fails
	 */
	public validate(): void {
		Object.keys(this).map((key: any) => {
			if (key.startsWith('__')) {
				return;
			}
			if (this.validateField(key, this[key as Keys<this>]) === false) {
				const message = this.getFieldMessage(key);
				throw new Error(message?.message);
			}
		});
	}

	/**
	 * DTO object
	 * @returns
	 */
	public toData(): {} {
		this.validate();

		return JSON.stringify({ ...this }, (key, value) => {
			// remove non-persistent data
			if (key.startsWith('__') || this.metaData.nonPersistentFields[key] === true) {
				return undefined;
			}
			return value;
		});
	}

	/**
	 * Get entity translations
	 */
	public get entityTranslations(): any {
		return TranslationService.getInstance().getEntityTranslations(this);
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
		// Register attribute
		this.registerAttributeName(property);

		// This will register a unique validator name with a callback function, then store each property/args in the array
		if (!this.attributeValidators[name]) {
			this.attributeValidators[name] = [validator.callback, { property, args: validator.args }];
		} else {
			this.attributeValidators[name].push({ property, args: validator.args });
		}
	}

	/**
	 * Get meta data
	 */
	protected get metaData(): EntityMetaData {
		if (!this.__METADATA) {
			this.__METADATA = new EntityMetaData();
		}
		return this.__METADATA;
	}

	/**
	 * Get attribute validators
	 */
	protected get attributeValidators(): ValidatorType {
		if (!this.__ATTRIBUTE_VALIDATORS) {
			this.__ATTRIBUTE_VALIDATORS = {};
		}
		return this.__ATTRIBUTE_VALIDATORS;
	}

	/**
	 * Getter for all required attributes
	 */
	protected get requiredFields(): AttributeBooleanType {
		return this.metaData.requiredFields;
	}

	/**
	 * Getter for all modified attributes
	 */
	protected get modifiedFields(): AttributeBooleanType {
		return this.metaData.modifiedFields;
	}

	/**
	 * Getter for all readonly attributes
	 */
	protected get readonlyFields(): AttributeBooleanType {
		return this.metaData.readonlyFields;
	}

	/**
	 * Getter for all hidden attributes
	 */
	protected get hiddenFields(): AttributeBooleanType {
		return this.metaData.hiddenFields;
	}

	/**
	 * Set field message
	 * @param attribute
	 * @param message Message
	 */
	protected setFieldMessage<K extends Keys<this>>(attribute: K, message: EntityMessage) {
		this.metaData.fieldMessages[attribute] = message;
	}

	/**
	 * Throws an exception if entity cannot be updated
	 * @param attribute
	 */
	protected canModify(attribute?: Keys<this>): void | never {
		if (this.isReadonly) {
			throw new EntityReadonlyException(this.name);
		} else if (attribute) {
			if (this.isFieldReadonly(attribute) === true) {
				throw new AttributeReadonlyException(this.getLabel(attribute));
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
	protected onAfterChange(attribute: string): void {
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
	 * Translate entity keys
	 * @returns
	 */
	protected translateEntityKeys() {
		const obj: any = {};
		Object.keys(this).map((k: any) => {
			obj[k] = this.getLabel(k) ?? k;
		});
		return obj;
	}

	/**
	 * Access modifiers
	 */
	private get accessModifiers() {
		return this.metaData.accessModifiers;
	}

	/**
	 * Getter for all field messages
	 */
	private get fieldMessages(): FieldMessage {
		return this.metaData.fieldMessages;
	}

	/**
	 * Set field modified meta data and mark entity as to be saved if true
	 * @param attribute
	 * @param modified
	 */
	private setFieldModified(attribute: string, modified: boolean): void {
		this.metaData.modifiedFields[attribute] = modified;
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
	private afterChange(attribute: string): void {
		return this.onAfterChange(attribute);
	}

	/**
	 * Encapulsate set logic value
	 * @param attribute
	 * @param value
	 */
	private _setValue(attribute: Keys<this>, value: any): void {
		let newValue = this[attribute];
		try {
			// throws exception if any
			this.canModify(attribute);

			newValue = this.beforeChange(attribute, value);

			this.validateField(attribute, newValue);

			this[attribute] = newValue;

			this.validateAllModifiedFields(attribute);

			this.setFieldModified(attribute, true);

			this.afterChange(attribute);
		} catch (e) {
			this.setFieldError(attribute, (e as Error).message);
			this[attribute] = newValue;
			throw e;
		}
	}

	/**
	 * Validate field
	 * @param attribute
	 * @param value
	 * @returns {boolean} true if success, false if fails
	 */
	private validateField(attribute: Keys<this>, value: any): boolean {
		try {
			Object.keys(this.attributeValidators).map((k) => {
				const [validator, ...args] = this.attributeValidators[k];
				if (typeof validator === 'function') {
					const param: ValidatorArgType[] = (args as ValidatorArgType[]).filter((a) => a.property === attribute);
					if (param.length > 0) {
						// Clone data and set value in order for validator to test
						const clonedEntity = Object.assign(this.clone(), { [attribute]: value });
						const params: ValidatorCallbackParams = {
							entityData: clonedEntity,
							attribute,
							newValue: value,
							args: param[0].args,
							translations: this.entityTranslations,
							lang: TranslationService.getInstance().lang,
						};
						(validator as ValidatorCallbackType)(params);
					}
				}
			});

			if (this.isFieldRequired(attribute) && Utils.isNullOrEmpty(value)) {
				throw new AttributeRequiredException(this.getLabel(attribute));
			}
		} catch (e) {
			this.setFieldError(attribute, (e as Error).message);
			return false;
		}

		this.clearFieldMessage(attribute);

		return true;
	}

	/**
	 * Validate all modified fields
	 */
	private validateAllModifiedFields<K extends Keys<this>>(exclude?: K | K[]): void {
		const excludeValues: string[] = [];
		if (Array.isArray(exclude)) {
			excludeValues.push(...exclude);
		} else if (typeof exclude === 'string') {
			excludeValues.push(exclude);
		}

		Object.keys(this.modifiedFields).map((k) => {
			const key = k as Keys<this>;
			if (excludeValues.indexOf(key) === -1) {
				this.validateField(key, this[key]);
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
					if (target.accessModifiers.canDoChange(property) === true || property in target === false) {
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
				console.log('define', target, property, descriptor);
				return true;
			}*/
		};
	}
}
