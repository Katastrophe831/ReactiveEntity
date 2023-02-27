import { Entity } from '@ReactiveEntity';

export const Readonly = (target: Entity, member: string) => {
	target.setFieldReadonly(member as any, true);
};
