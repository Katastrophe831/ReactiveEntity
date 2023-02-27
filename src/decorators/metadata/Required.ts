import { Entity } from '@ReactiveEntity';

export const Required = (target: Entity, member: string) => {
	target.setFieldRequired(member as any, true);
};
