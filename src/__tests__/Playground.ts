import { EntitySet, Entity, EntityAttributes, FieldAccess } from '../entity';
import { AttributeReadonlyException, AttributeRequiredException } from '../exceptions';
import { AttributeConfig, NonPersistentAttribute, PrimaryKey, Readonly, Required, ValidatorJS } from '../decorators';

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
		READONLY: 'readonly',
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
		READONLY: 'readonly',
	},
];

class UserSet extends EntitySet {
	protected get entityClass() {
		return User;
	}
}

class User extends Entity {
	USERID!: string | null;
	NAME!: string | null;
	NUMTYPE!: number;
	YORN!: number;
	DATE!: Date;
	ISODATE!: string;
	NULL!: string;
	UNDEFINED!: string;
	READONLY!: string;
}

describe('Playground', () => {
	test('Used to run single test without running every test :)', () => {
		// const entitySet: UserSet = new UserSet({ data: data, isReadonly: false, appName: 'USERAPP' });
		// const entity: User = entitySet[0];
	});

	test('Entity check primary key', () => {
		class UserTest extends User {}

		class UserTest2 extends User {
			@PrimaryKey
			PRIMARYKEY!: string;
		}

		const entity: User = new UserTest(data[0]);
		expect(() => entity.primaryKeyName).toThrowError('Primary key not defined for object UserTest');

		const entity2: User = new UserTest2(data[0]);
		expect(entity2.primaryKeyName).toBe('PRIMARYKEY');
	});
});
