import { Entity, EntityType, EntitySetArgs, EntityArgs, EntitySetMetaData, entitySetArgsTypeGuard } from '.';
import { EntitySetReadonlyException } from '../exceptions';

export abstract class EntitySet extends Array {
	/**
	 * Meta data
	 */
	private readonly __METADATA__: EntitySetMetaData = new EntitySetMetaData();

	constructor(args?: {} | EntitySetArgs) {
		super();

		if (args !== undefined) {
			let data: any;
			if (entitySetArgsTypeGuard(args)) {
				this.__METADATA__.ownerEntity = args.owner || null;
				this.__METADATA__.appName = args.appName ?? null;
				this.__METADATA__.isReadonly = args.isReadonly ?? false;
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
		return this.__METADATA__.appName;
	}

	/**
	 * Set app name
	 */
	public set appName(app: string | null) {
		this.__METADATA__.appName = app;
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
		return this.__METADATA__.isReadonly;
	}

	/**
	 * Add new entity to the set
	 * @param data
	 * @returns
	 */
	public addNew(data: any): Entity {
		this.canModify();

		const entity = this.createEntityInstance(Object.assign({ data }, this.__METADATA__));
		this.push(entity);

		return entity;
	}

	/**
	 * Set readonly
	 * @param readonly
	 */
	public setReadonly(readonly: boolean): void {
		this.__METADATA__.isReadonly = readonly;
		this.forEach((e: Entity) => e.setReadonly(readonly));
	}

	/**
	 * Mark all entities as selected
	 */
	public selectAll(): void {
		this.__METADATA__.isSelectAll = true;
		this.map((entity) => entity.select());
	}

	/**
	 * Mark all entities as unselected
	 */
	public unselectAll(): void {
		this.__METADATA__.isSelectAll = false;
		this.map((entity) => entity.unselect());
	}

	/**
	 * Toggle select all
	 */
	public toggleSelectAll(): void {
		if (this.__METADATA__.isSelectAll === true) {
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
	 * Add array of objects to set regardless if the entity set can be modified or not
	 * @param data -
	 */
	protected addToSet(data: any[] | undefined) {
		if (data && Array.isArray(data) && data.length > 0) {
			data.forEach((d) => {
				this.push(this.createEntityInstance(Object.assign({ data: d }, this.__METADATA__)));
			});
		}
	}

	/**
	 * Throws an exception if this set cannot be modified
	 */
	protected canModify(): void {
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
