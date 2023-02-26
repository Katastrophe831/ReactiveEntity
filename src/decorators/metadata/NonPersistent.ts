import { entityMetaDataWrapper } from './entityMetaDataWrapper';

export const NonPersistent = (target: any, member: string) => {
	entityMetaDataWrapper(target, 'isNonPersistent', member, true);
};
