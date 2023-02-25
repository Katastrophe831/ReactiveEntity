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
		messages: {},
		validator: {},
	};

	public getUndeclaredProperties(data: any): any {
		const metaDataProperties = ['isReadonly', 'isRequired', 'isNonPersistent'];

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

	public reset() {
		this.toBeSaved = false;
		this.isNew = false;
		this.attributes.isModified = {};
		this.attributes.messages = {};
	}
}
