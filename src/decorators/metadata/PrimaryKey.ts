import { Entity } from '../../entity';
import { entityMetaDataWrapper } from './entityMetaDataWrapper';

export const PrimaryKey = (target: Entity, member: string) => {
	entityMetaDataWrapper(target, 'primaryKey', member, true);
};
