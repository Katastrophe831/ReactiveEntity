import { EntitySet, Entity, EntityAttributes, FieldAccess } from '../entity';
import { AttributeReadonlyException, AttributeRequiredException } from '../exceptions';
import { AttributeConfig, NonPersistentAttribute, Readonly, Required, ValidatorJS } from '../decorators';

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

		class UserTest extends User {
			protected onBeforeChange(attribute: string, value: any): any {
				const keys: EntityAttributes<this> = {
					NAME: (): any => {
						if (value === 'test change') {
							throw Error(value);
						}
						return value;
					},
				};
				const func = keys[attribute];
				return func ? func() : value;
			}
		}

		const entity: User = new UserTest(data[0]);
		expect(entity.toBeSaved).toBe(false);
		expect(() => entity.setValue('NAME', 'test change')).toThrowError(new Error('test change'));
		expect(entity.isFieldModified('NAME')).toBe(false);
		expect(entity.toBeSaved).toBe(false);

		entity.setValue('NAME', 'works', FieldAccess.NOCHANGE);
		expect(entity.NAME).toBe('works');
		expect(entity.isFieldModified('NAME')).toBe(false);
		expect(entity.toBeSaved).toBe(false);

		entity.NAME = 'Test User';
		expect(entity.toBeSaved).toBe(true);

		entity.reset();
		expect(entity.toBeSaved).toBe(false);
	});
});
