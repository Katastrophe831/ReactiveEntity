import { Entity, AttributeMetaDataBooleanProperties, AttributeBooleanType } from '../../entity';

export const entityMetaDataWrapper = (
	target: Entity,
	key: keyof AttributeMetaDataBooleanProperties,
	member: string,
	value: boolean = true,
	callback?: (attributeMetaData: AttributeBooleanType) => void,
) => {
	target.metaData.attributes[key][member] = value;

	if (typeof callback === 'function') {
		callback(target.metaData.attributes[key]);
	}
};
