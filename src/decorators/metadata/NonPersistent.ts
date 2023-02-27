import { Entity } from '../../entity';

export const NonPersistent = (target: Entity, member: string) => {
	target.setFieldNonPersistent(member as any);
};
