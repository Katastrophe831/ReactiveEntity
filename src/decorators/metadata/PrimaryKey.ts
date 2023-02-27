import { Entity } from '../../entity';

export const PrimaryKey = (target: Entity, member: string) => {
	target.setPrimaryKeyName(member as any);
};
