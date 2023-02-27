import { Entity } from '../../entity';

export const Readonly = (target: Entity, member: string) => {
	target.setFieldReadonly(member as any, true);
};
