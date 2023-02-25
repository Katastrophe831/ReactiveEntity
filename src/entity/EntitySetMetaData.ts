import { Entity, BaseEntityMetaData } from '.';

export class EntitySetMetaData implements BaseEntityMetaData {
	public ownerEntity: Entity | null = null;

	public appName: string | null = null;

	public toBeSaved: boolean = false;

	public isReadonly: boolean = false;

	public isSelectAll: boolean = false;
}
