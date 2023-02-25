import { entityMetaDataWrapper } from './entityMetaDataWrapper';

export const Required = (target: any, member: string) => {
	entityMetaDataWrapper(target, 'isRequired', (attributeMetaData) => {
		attributeMetaData[member] = true;
	});
};
