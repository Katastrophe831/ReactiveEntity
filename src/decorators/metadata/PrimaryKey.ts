import { Entity } from '../../entity';
import { entityMetaDataWrapper } from './entityMetaDataWrapper';

export const PrimaryKey = (target: Entity, member: string) => {
	// TODO: Throw Exception if a primary key is already defined
	entityMetaDataWrapper(target, 'primaryKey', member, true);
};
