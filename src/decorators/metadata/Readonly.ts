import { entityMetaDataWrapper } from './entityMetaDataWrapper';

export const Readonly = (target: any, member: string) => {
	entityMetaDataWrapper(target, 'isReadonly', member, true);
};
