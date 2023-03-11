import { Entity, EntityType, EntitySetArgs, EntityArgs, EntitySetMetaData, entitySetArgsTypeGuard } from '.';
import { EntitySetReadonlyException } from '../exceptions';

export abstract class EntitySet extends Array {
	/**
	 * Meta data
	 */
	private __METADATA!: EntitySetMetaData;

	constructor(args?: {} | EntitySetArgs) {
		super();

		if (args !== undefined) {
			let data: any;
			if (entitySetArgsTypeGuard(args)) {
				this.metaData.ownerEntity = args.owner || null;
				this.metaData.appName = args.appName ?? null;
				this.metaData.isReadonly = args.isReadonly ?? false;
				data = args.data;
			} else {
				data = args;
			}
			this.addToSet(data);
		}
	}

	/**
	 * App name
	 */
	public get appName(): string | null {
		return this.metaData.appName ?? null;
	}

	/**
	 * Set app name
	 */
	public set appName(app: string | null) {
		this.metaData.appName = app;
	}

	/**
	 * Is set empty
	 */
	public get isEmpty(): boolean {
		return this.length === 0;
	}

	/**
	 * Is readonly
	 */
	public get isReadonly(): boolean {
		return this.metaData.isReadonly;
	}

	/**
	 * Add new entity to the set
	 * @param data
	 * @returns
	 */
	public addNew(data: any): Entity {
		this.canModify();

		const entity = this.createEntityInstance(Object.assign({ data }, this.metaData));
		this.push(entity);

		return entity;
	}

	/**
	 * Set readonly
	 * @param readonly
	 */
	public setReadonly(readonly: boolean): void {
		this.metaData.isReadonly = readonly;
		this.forEach((e: Entity) => e.setReadonly(readonly));
	}

	/**
	 * Mark all entities as selected
	 */
	public selectAll(): void {
		this.metaData.isSelectAll = true;
		this.map((entity) => entity.select());
	}

	/**
	 * Mark all entities as unselected
	 */
	public unselectAll(): void {
		this.metaData.isSelectAll = false;
		this.map((entity) => entity.unselect());
	}

	/**
	 * Toggle select all
	 */
	public toggleSelectAll(): void {
		if (this.metaData.isSelectAll === true) {
			this.unselectAll();
		} else {
			this.selectAll();
		}
	}

	/**
	 * Get selected records
	 * @returns
	 */
	public getSelectedRecords(): EntitySet {
		return this.filter((entity: Entity) => entity.isSelected) as EntitySet;
	}

	/**
	 * To Data
	 * @returns String
	 */
	public toData(): string {
		const result = JSON.stringify([...this], (key, value) => {
			if (key.startsWith('__')) {
				return undefined;
			}
			return value;
		});
		return result;
	}

	/**
	 * Default Entity Class
	 */
	protected abstract get entityClass(): EntityType;

	/**
	 * Get meta data
	 */
	protected get metaData(): EntitySetMetaData {
		if (!this.__METADATA) {
			this.__METADATA = new EntitySetMetaData();
		}
		return this.__METADATA;
	}

	/**
	 * Add array of objects to set regardless if the entity set can be modified or not
	 * @param data -
	 */
	protected addToSet(data: any[] | undefined) {
		if (data && Array.isArray(data) && data.length > 0) {
			data.forEach((d) => {
				this.push(this.createEntityInstance(Object.assign({ data: d }, this.metaData)));
			});
		}
	}

	/**
	 * Throws an exception if this set cannot be modified
	 */
	protected canModify(): void | never {
		if (this.isReadonly) {
			throw new EntitySetReadonlyException(this.constructor.name);
		}
	}

	/**
	 * Create entity instance
	 * @param args - Entity Args
	 * @returns - Entity
	 */
	protected createEntityInstance(args?: EntityArgs): Entity {
		const inst = new this.entityClass(args);
		return inst;
	}
}
