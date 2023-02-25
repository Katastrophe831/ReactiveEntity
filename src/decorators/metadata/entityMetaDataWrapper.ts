import { Entity, AttributeMetaDataBooleanProperties, AttributeBooleanType } from '../../entity';

export const entityMetaDataWrapper = (
	target: Entity,
	key: keyof AttributeMetaDataBooleanProperties,
	callback: (attributeMetaData: AttributeBooleanType) => void,
) => {
	callback(target.metaData.attributes[key]);
};
