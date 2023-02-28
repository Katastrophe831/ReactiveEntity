import { EntitySetReadonlyException } from '../../exceptions';
import { EntitySet, Entity } from '../../entity';

const data = [
	{
		USERID: '1',
		NAME: 'John Doe',
		NUMTYPE: 1,
		YORN: 0,
		DATE: new Date('1/1/2020 12:00 AM'),
		ISODATE: '2020-01-01T05:00:00.000Z',
		NULL: null,
		UNDEFINED: undefined,
	},
	{
		USERID: '2',
		NAME: 'Jane Doe',
		NUMTYPE: 2,
		YORN: 1,
		DATE: new Date('1/1/2020 12:00 AM'),
		ISODATE: '2020-01-01T05:00:00.000Z',
		NULL: null,
		UNDEFINED: undefined,
	},
];

class User extends Entity {
	constructor(args?: any) {
		super(args);
	}

	public USERID!: string;
	public NAME!: string;
	public NUMTYPE!: string;
	public YORN!: string;
	public DATE!: string;
	public ISODATE!: string;
	public NULL!: string;
	public UNDEFINED!: string;

	get objectName() {
		return 'USER';
	}
}

class UserSet extends EntitySet {
	protected get entityClass() {
		return User;
	}
}

describe('Entity Set', () => {
	describe('Populate data', () => {
		test('should populate data using just array data', ()=> {
			let entitySet: EntitySet = new UserSet(data);
			expect(entitySet.toData()).toBe(JSON.stringify(data));
		});

		test('should populate data using EntitySetArgs', ()=> {
			let entitySet = new UserSet({ data });
			expect(entitySet.toData()).toBe(JSON.stringify(data));
		});

		test('should check JSON is equal and the constructor equal, instance of User', () => {
			let entitySet: UserSet = new UserSet(data);
			expect(entitySet.toData()).toBe(JSON.stringify(data));
			expect(entitySet[0].constructor.name).toBe('User');
			expect(entitySet[0] instanceof User).toBe(true);
		});

		test('should return empty set', () => {
			const entitySet: UserSet = new UserSet();
			expect(entitySet.isEmpty).toBe(true);
		});
	
	});

	describe('Select Records', () => {
		test('should select all', () => {
			const entitySet: UserSet = new UserSet(data);
			entitySet.selectAll();
			expect(entitySet[0].isSelected).toBe(true);
			expect(entitySet[1].isSelected).toBe(true);
		});
		
		test('should unselect all', () => {
			const entitySet: UserSet = new UserSet(data);
			entitySet.selectAll();
			expect(entitySet[0].isSelected).toBe(true);
			expect(entitySet[1].isSelected).toBe(true);
	
			entitySet.unselectAll();
			expect(entitySet[0].isSelected).toBe(false);
			expect(entitySet[1].isSelected).toBe(false);
		});		

		test('should toggle select all', () => {
			const entitySet: UserSet = new UserSet(data);
			entitySet.selectAll();
			expect(entitySet[0].isSelected).toBe(true);
			expect(entitySet[1].isSelected).toBe(true);
	
			entitySet.toggleSelectAll();
			expect(entitySet[0].isSelected).toBe(false);
			expect(entitySet[1].isSelected).toBe(false);
		});
		
		test('should return selected records', () => {
			const entitySet: UserSet = new UserSet(data);
			entitySet[0].select();
			expect(entitySet.getSelectedRecords().length).toBe(1);
			expect(entitySet.getSelectedRecords()[0]).toMatchObject(entitySet[0]);
	
			entitySet.selectAll();
			expect(entitySet.getSelectedRecords().length).toBe(2);
	
			entitySet.unselectAll();
			expect(entitySet.getSelectedRecords().length).toBe(0);
		});
	});

	describe('Meta Data', () => {
		test('should set be readonly and set entity as readonly and set app name', () => {
			const entitySet: UserSet = new UserSet({ data, isReadonly: true, appName: 'USERAPP' });
			const entity: User = entitySet[0];
			expect(entity.isReadonly).toBe(true);
			expect(entity.appName).toBe('USERAPP');
			expect(entitySet.appName).toBe('USERAPP');
		});
	});

	describe('Meta Data', () => {
		test('should be able to add new', () => {
			const entitySet: UserSet = new UserSet({ data, isReadonly: false, appName: 'USERAPP' });
			entitySet.addNew({
				USERID: '3',
				NAME: 'Test User',
				NUMTYPE: 3,
				YORN: 0,
				DATE: new Date('1/1/2020 12:00 AM'),
				NULL: null,
			});
			const entity: User = entitySet[2];
			expect(entity.isReadonly).toBe(false);
			expect(entity.appName).toBe('USERAPP');
	
			entitySet.setReadonly(true);
			expect(() => {
				entitySet.addNew({
					USERID: '3',
					NAME: 'Test User',
					NUMTYPE: 3,
					YORN: 0,
					DATE: new Date('1/1/2020 12:00 AM'),
					NULL: null,
				});
			}).toThrowError(new EntitySetReadonlyException(entitySet.constructor.name));
		});

		test('should throw exception when adding new to readonly set', () => {
			const entitySet: UserSet = new UserSet({ data, isReadonly: true, appName: 'USERAPP' });
	
			entitySet.setReadonly(true);
			expect(() => {
				entitySet.addNew({
					USERID: '3',
					NAME: 'Test User',
					NUMTYPE: 3,
					YORN: 0,
					DATE: new Date('1/1/2020 12:00 AM'),
					NULL: null,
				});
			}).toThrowError(new EntitySetReadonlyException(entitySet.constructor.name));
		});		
	});	
});
