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

describe('Entity Set Tests', () => {
	test('Populate data', () => {
		let entitySet: EntitySet = new UserSet(data);
		expect(entitySet.toData()).toBe(JSON.stringify(data));

		entitySet = new UserSet({ data });
		expect(entitySet.toData()).toBe(JSON.stringify(data));
	});

	test('Extend EntitySet and Entity as User - JSON is equal and constructor and instance of User', () => {
		let entitySet: UserSet = new UserSet(data);
		expect(entitySet.toData()).toBe(JSON.stringify(data));
		expect(entitySet[0].constructor.name).toBe('User');
		expect(entitySet[0] instanceof User).toBe(true);
	});

	test('Select/Unselect All', () => {
		const entitySet: UserSet = new UserSet(data);
		entitySet.selectAll();
		expect(entitySet[0].isSelected).toBe(true);
		expect(entitySet[1].isSelected).toBe(true);

		entitySet.unselectAll();
		expect(entitySet[0].isSelected).toBe(false);
		expect(entitySet[1].isSelected).toBe(false);

		entitySet.toggleSelectAll();
		expect(entitySet[0].isSelected).toBe(true);
		expect(entitySet[1].isSelected).toBe(true);
	});

	test('Get Selected Records', () => {
		const entitySet: UserSet = new UserSet(data);
		entitySet[0].select();
		expect(entitySet.getSelectedRecords().length).toBe(1);
		expect(entitySet.getSelectedRecords()[0]).toMatchObject(entitySet[0]);

		entitySet.selectAll();
		expect(entitySet.getSelectedRecords().length).toBe(2);

		entitySet.unselectAll();
		expect(entitySet.getSelectedRecords().length).toBe(0);
	});

	test('Initialize set metadata', () => {
		const entitySet: UserSet = new UserSet({ data, isReadonly: true, appName: 'USERAPP' });
		const entity: User = entitySet[0];
		expect(entity.isReadonly).toBe(true);
		expect(entity.appName).toBe('USERAPP');
		expect(entitySet.appName).toBe('USERAPP');
	});

	test('Initialize set with no data', () => {
		const entitySet: UserSet = new UserSet();
		expect(entitySet.isEmpty).toBe(true);
	});

	test('Initialize set with data', () => {
		const entitySet: UserSet = new UserSet({ data, isReadonly: true, appName: 'USERAPP' });
		expect(entitySet.isEmpty).toBe(false);
	});

	test('Add new', () => {
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
});
