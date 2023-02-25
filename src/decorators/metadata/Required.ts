import { entityMetaDataWrapper } from './entityMetaDataWrapper';

export const Required = (target: any, member: string) => {
	entityMetaDataWrapper(target, 'isRequired', member, true);
};
