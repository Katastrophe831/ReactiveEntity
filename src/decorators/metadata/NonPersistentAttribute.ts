import { entityMetaDataWrapper } from './entityMetaDataWrapper';

export const NonPersistentAttribute = (target: any, member: string) => {
	entityMetaDataWrapper(target, 'isNonPersistent', (attributeMetaData) => {
		attributeMetaData[member] = true;
	});
};
