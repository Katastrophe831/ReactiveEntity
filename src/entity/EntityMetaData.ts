import { EntityException } from '@ReactiveEntity/exceptions';
import { EntitySet, Entity, AttributeMetaData, BaseEntityMetaData } from '.';
import { Utils } from '../utils';

export class EntityMetaData implements BaseEntityMetaData {
	public thisSet: EntitySet | null = null;

	public ownerEntity: Entity | null = null;

	public appName: string | null = null;

	public toBeSaved: boolean = false;

	public toBeDeleted: boolean = false;

	public isReadonly: boolean = false;

	public isSelected: boolean = false;

	public isNew: boolean = false;

	public attributes: AttributeMetaData = {
		isModified: {},
		isReadonly: {},
		isRequired: {},
		isHidden: {},
		isNonPersistent: {},
		primaryKey: {},
		messages: {},
		validator: {},
	};

	/**
	 * Get an object of undeclared properties
	 * @param data
	 * @returns
	 */
	public getUndeclaredProperties(data: any): any {
		const metaDataProperties = ['isReadonly', 'isRequired', 'isNonPersistent', 'primaryKey'];

		// Get all attributes declared by decorators
		let props: any = {};
		metaDataProperties.forEach((k) => {
			Object.assign(props, Utils.getObjectFromKeys((this.attributes as any)[k]));
		});

		if (data) {
			// Get attributes that don't exist
			props = Utils.getKeysThatDontExist(props, data);
		}

		return props;
	}

	/**
	 * Set primary key name
	 * @param attribute
	 * @returns true if successful
	 */
	public setPrimaryKeyName(attribute: string): boolean {
		const pk = this.attributes.primaryKey;
		const keys = Object.keys(pk);
		if (!!keys.length) {
			return false;
		}
		pk[attribute as string] = true;
		return true;
	}

	/**
	 * Get primary key name
	 */
	public get primaryKeyName(): string | null {
		const keys = Object.keys(this.attributes.primaryKey);
		if (!!keys.length === false) {
			return null;
		}
		return keys[0];
	}

	/**
	 * Set non persistent fields
	 * @param attribute
	 */
	public setNonPersistentFields(attribute: string | string[]): void {
		this.setMetaDataAttributes('isNonPersistent', attribute, true);
	}

	/**
	 * Set required fields
	 * @param attribute
	 * @param value
	 */
	public setRequiredFields(attribute: string | string[], value: boolean): void {
		this.setMetaDataAttributes('isRequired', attribute, value);
	}

	/**
	 * Set readonly fields
	 * @param attribute
	 * @param value
	 */
	public setReadonlyFields(attribute: string | string[], value: boolean): void {
		this.setMetaDataAttributes('isReadonly', attribute, value);
	}

	/**
	 * Set hidden fields
	 * @param attribute
	 * @param value
	 */
	public setHiddenFields(attribute: string | string[], value: boolean): void {
		this.setMetaDataAttributes('isHidden', attribute, value);
	}

	/**
	 * Reset metadata
	 */
	public reset() {
		this.toBeSaved = false;
		this.isNew = false;
		this.isSelected = false;
		this.attributes.isModified = {};
		this.attributes.messages = {};
	}

	/**
	 * Helper function
	 * @param property
	 * @param attribute
	 * @param param2
	 * @param value
	 */
	private setMetaDataAttributes(property: keyof AttributeMetaData, attribute: string | string[], value: boolean): void {
		const metaDataProp = this.attributes[property];

		if (Array.isArray(attribute)) {
			for (const attr of attribute) {
				metaDataProp[attr as string] = value;
			}
		} else {
			metaDataProp[attribute as string] = value;
		}
	}
}
