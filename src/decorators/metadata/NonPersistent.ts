import { Entity } from '@ReactiveEntity';

export const NonPersistent = (target: Entity, member: string) => {
	target.setFieldNonPersistent(member as any);
};
