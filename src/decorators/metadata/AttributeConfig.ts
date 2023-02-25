import { AttributeValidator, Entity } from '../../entity';
import { entityMetaDataWrapper } from './entityMetaDataWrapper';

export const AttributeConfig = (config: AttributeValidator) => (target: Entity, member: string) => {
	//entityMetaDataWrapper(target, '', member, true);
};
