import { entityMetaDataWrapper } from './entityMetaDataWrapper';

export const Readonly = (target: any, member: string) => {
	entityMetaDataWrapper(target, 'isReadonly', (attributeMetaData) => {
		attributeMetaData[member] = true;
	});
};
