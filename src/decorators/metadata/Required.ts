import { Entity } from '../../entity';

export const Required = (target: Entity, member: string) => {
	target.setFieldRequired(member as any, true);
};
