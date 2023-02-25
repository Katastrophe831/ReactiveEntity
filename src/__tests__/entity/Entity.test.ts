import { EntitySet, Entity, EntityAttributes, FieldAccess } from '../../entity';
import {
	AttributeNotFoundException,
	AttributeReadonlyException,
	AttributeRequiredException,
	EntityReadonlyException,
} from '../../exceptions';
import { NonPersistentAttribute, PrimaryKey, Readonly, Required, ValidatorJS } from '../../decorators';

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

describe('Entity Tests', () => {
	test('getValue()', () => {
		const entitySet: EntitySet = new UserSet(data);
		expect(entitySet[0].NAME).toBe(data[0].NAME);
		expect(entitySet[0].getValue('NAME')).toBe(data[0].NAME);
		expect(entitySet[0].getValue('NUMTYPE')).toBe(1);
		expect(entitySet[0].getValue('NULL')).toBeNull();
		expect(() => entitySet[0].getValue('UNDEFINED_PROP')).toThrowError(new AttributeNotFoundException('UNDEFINED_PROP'));
	});

	test('getString()', () => {
		const entitySet: EntitySet = new UserSet(data);
		expect(entitySet[0].getString('NAME')).toBe(data[0].NAME);
		expect(entitySet[0].getString('NUMTYPE')).toBe('1');
		expect(() => entitySet[0].getValue('UNDEFINED_PROP')).toThrowError(new AttributeNotFoundException('UNDEFINED_PROP'));
		expect(entitySet[0].getString('NULL')).toBeNull();
	});

	test('getNumber()', () => {
		const entitySet: EntitySet = new UserSet(data);
		expect(entitySet[0].getNumber('NUMTYPE')).toBe(1);
	});

	test('getDate()', () => {
		const entitySet: EntitySet = new UserSet(data);
		expect(entitySet[0].getDate('ISODATE')).toMatchObject(new Date('1/1/2020 12:00 AM'));
		expect(entitySet[0].ISODATE).toBe('2020-01-01T05:00:00.000Z');
	});

	test('isNull()/isNotNull()', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];
		expect(entity.isNull('NULL')).toBe(true);
		expect(() => entitySet[0].isNull('UNDEFINED_PROP')).toThrowError(new AttributeNotFoundException('UNDEFINED_PROP'));
		expect(() => entitySet[0].isNull('UNDEFINED')).toThrowError(new AttributeNotFoundException('UNDEFINED'));
		expect(entity.isNotNull('USERID')).toBe(true);
	});

	test('To Be Saved', () => {
		class UserTest extends User {
			protected onBeforeChange(attribute: string, value: any): any {
				const keys: EntityAttributes<this> = {
					NAME: (): any => {
						if (value == 'test change') {
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
		expect(entity.toBeSaved).toBe(false);

		entity.NAME = 'Test User';
		expect(entity.toBeSaved).toBe(true);

		entity.reset();
		expect(entity.toBeSaved).toBe(false);
	});

	test('To Be Saved - Field Access Modifiers', () => {
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

	test('Attribute modified', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];

		entity.NAME = 'Test User';
		expect(entity.isFieldModified('NAME')).toBe(true);
		expect(entitySet[0].isFieldModified('NO_PROP')).toBe(false);

		entity.reset();
		expect(entity.isFieldModified('NAME')).toBe(false);
	});

	test('Field messages', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];

		entity.setFieldError('NAME', 'Error Message');
		expect(entity.fieldMessages['NAME']).toMatchObject({ type: 'error', message: 'Error Message' });
		entity.setFieldWarning('NAME', 'Warn Message');
		expect(entity.fieldMessages['NAME']).toMatchObject({ type: 'warn', message: 'Warn Message' });
		entity.setFieldInfo('NAME', 'Info Message');
		expect(entity.fieldMessages['NAME']).toMatchObject({ type: 'info', message: 'Info Message' });
		entity.reset();
		expect(entity.fieldMessages['NAME']).toBeUndefined();
		entity.setFieldInfo('NAME', 'Info Message');
		expect(entity.fieldMessages['NAME']).toMatchObject({ type: 'info', message: 'Info Message' });
		entity.clearFieldMessage('NAME');
		expect(entity.fieldMessages['NAME']).toBeUndefined();
	});

	test('clone', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];
		const copyEntity: object = entity.clone();
		expect(JSON.stringify(copyEntity)).toBe(JSON.stringify(entity));
	});

	test('copy', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];
		const clonedEntity: User = entity.copy() as User;
		expect(clonedEntity.constructor.name).toBe('User');
		expect(clonedEntity instanceof User).toBe(true);
	});

	test('select/unselect', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];
		entity.select();
		expect(entity.isSelected).toBe(true);
		entity.unselect();
		expect(entity.isSelected).toBe(false);
		entity.selectToggle();
		expect(entity.isSelected).toBe(true);
	});

	test('delete/undelete', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];
		entity.delete();
		expect(entity.toBeDeleted).toBe(true);
		entity.undelete();
		expect(entity.toBeDeleted).toBe(false);
	});

	test('read only fields', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];
		entity.setFieldReadonly('NAME', true);
		expect(entity.isFieldReadonly('NAME')).toBe(true);
		entity.setFieldReadonly('NAME', false);
		expect(entity.isFieldReadonly('NAME')).toBe(false);

		entity.setFieldReadonly(['NAME', 'NUMTYPE'], true);
		expect(entity.isFieldReadonly('NAME')).toBe(true);
		expect(entity.isFieldReadonly('NUMTYPE')).toBe(true);
		entity.setFieldReadonly('NAME', false);
		expect(entity.isFieldReadonly('NAME')).toBe(false);
		expect(entity.isFieldReadonly('NUMTYPE')).toBe(true);
	});

	test('set read only internally/externally', () => {
		class UserTest extends User {
			protected onAfterChange(attribute: string, value: any): void {
				const keys: EntityAttributes<this> = {
					NAME: (): any => {
						this.setFieldReadonly('READONLY', true);
						this.READONLY = 'SET INTERNALLY';
						this['READONLY'] = 'SET INTERNALLY';
					},
				};
				const func = keys[attribute];
				return func ? func() : value;
			}
		}

		const entity: UserTest = new UserTest(data[0]);
		expect(entity.READONLY).toBe('readonly');
		expect(entity.isFieldReadonly('READONLY')).toBe(false);
		entity.NAME = 'Test User';
		expect(entity.isFieldReadonly('READONLY')).toBe(true);
		expect(entity.READONLY).toBe('SET INTERNALLY');
		expect(() => (entity.READONLY = 'test')).toThrowError(new AttributeReadonlyException('READONLY'));
	});

	test('dynamic readonly/hidden fields', () => {
		class UserTest extends User {
			@NonPersistentAttribute
			public NON_PERSISTENT_FIELD!: string;

			@NonPersistentAttribute
			public DATE_ISREQUIRED!: number;

			protected onFieldReadonly(attribute: string, value: boolean): boolean {
				const keys: EntityAttributes<this> = {
					DATE: () => this.DATE_ISREQUIRED === 1,
				};
				const func = keys[attribute];
				return func ? func() : value;
			}

			protected onFieldHidden(attribute: string, value: boolean): boolean {
				const keys: EntityAttributes<this> = {
					DATE: () => this.DATE_ISREQUIRED === 1,
				};
				const func = keys[attribute];
				return func ? func() : value;
			}
		}

		const entity: UserTest = new UserTest(data[0]);
		expect(entity.isFieldReadonly('DATE')).toBe(false);
		expect(entity.isFieldHidden('DATE')).toBe(false);
		entity.DATE_ISREQUIRED = 1;
		expect(entity.isFieldReadonly('DATE')).toBe(true);
		expect(entity.isFieldHidden('DATE')).toBe(true);
	});

	test('check readonly fields when trying to update a value', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];
		entity.setFieldReadonly('NAME', true);
		expect(entity.isFieldReadonly('NAME')).toBe(true);
		expect(() => (entity.NAME = 'test')).toThrowError(new AttributeReadonlyException('NAME'));
		expect(() => (entity['NAME'] = 'test')).toThrowError(new AttributeReadonlyException('NAME'));

		entity.setFieldReadonly(['NAME'], false);
		expect(entity.isFieldReadonly('NAME')).toBe(false);

		entity.NAME = 'test1';
		expect(entity.getValue('NAME')).toBe('test1');
		expect(entity.NAME).toBe('test1');
	});

	test('check entity is readonly', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];
		entity.setReadonly(true);
		expect(entity.isReadonly).toBe(true);
		expect(() => (entity.NAME = 'test')).toThrowError(new EntityReadonlyException(entity.constructor.name));

		entity.setReadonly(false);
		expect(entity.isReadonly).toBe(false);
		entity.NAME = 'test1';
		expect(entity.NAME).toBe('test1');
	});

	test('required fields', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];
		entity.setFieldRequired('NAME', true);
		expect(entity.isFieldRequired('NAME')).toBe(true);
		entity.setFieldRequired('NAME', false);
		expect(entity.isFieldReadonly('NAME')).toBe(false);

		entity.setFieldRequired(['NAME', 'NUMTYPE'], true);
		expect(entity.isFieldRequired('NAME')).toBe(true);
		expect(entity.isFieldRequired('NUMTYPE')).toBe(true);
		entity.setFieldRequired('NAME', false);
		expect(entity.isFieldRequired('NAME')).toBe(false);
		expect(entity.isFieldRequired('NUMTYPE')).toBe(true);
	});

	test('required fields - on change', () => {
		class UserTest extends User {
			protected onAfterChange(attribute: string, value: any): void {
				const keys: EntityAttributes<this> = {
					NAME: () => {
						this.setFieldRequired('USERID', true);
					},
				};
				const func = keys[attribute];
				return func ? func() : value;
			}
		}

		const entity: User = new UserTest(data[0]);
		entity.NAME = 'NEW NAME';
		entity.USERID = null;
		expect(() => entity.asData).toThrowError(new AttributeRequiredException('USERID'));
		expect(entity.NAME).toBe('NEW NAME');
	});

	test('Non persistent fields', () => {
		class UserTest extends User {
			@NonPersistentAttribute
			public NON_PERSISTENT_FIELD!: string;
		}

		const entity: UserTest = new UserTest(data[0]);
		entity.NON_PERSISTENT_FIELD = 'test';
		expect(entity.NON_PERSISTENT_FIELD).toBe('test');
		expect(entity.asData).toBe(JSON.stringify(data[0]));
		expect(entity.NON_PERSISTENT_FIELD).toBe('test');
	});

	test('check required fields when converting to DTO', () => {
		const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0];
		entity.setFieldRequired('USERID', true);
		entity.USERID = null;
		expect(entity.isNull('USERID')).toBe(true);
		expect(() => entity.asData).toThrowError(new AttributeRequiredException('USERID'));
	});

	test('verify properties exists', () => {
		class TestUser extends Entity {
			PROP1!: string;
			@Required
			REQUIRED_ATTR!: string;
			@Readonly
			READONLY_ATTR!: string;
		}
		const data = { NOT_DECLARED_PROP: 'prop2', READONLY_ATTR: 'readonly' };
		const user = new TestUser(data);
		expect(user.PROP1).toBe(undefined);
		expect(user.REQUIRED_ATTR).toBe(null);
		expect(user.READONLY_ATTR).toBe('readonly');
	});

	test('ValidatorJS', () => {
		class TestUser extends Entity {
			@ValidatorJS({ rules: 'required' })
			PROP1!: string;

			@ValidatorJS({ rules: 'required|same:PROP1' })
			PROP2!: string;

			@ValidatorJS({ rules: 'required|email' })
			PROP3!: string;
		}

		const data = { PROP1: 'test', NOT_DECLARED_PROP: 'prop2', READONLY_ATTR: 'readonly' };
		const user = new TestUser(data);
		expect((user.PROP1 = 'h')).toBe('h');
		expect(() => (user.PROP1 = '')).toThrowError(new Error('The PROP1 field is required.'));
		expect(() => (user.PROP2 = 'hhhh')).toThrowError(new Error('The PROP2 and PROP1 fields must match.'));
		expect((user.PROP2 = 'h')).toBe('h');

		expect(() => (user.PROP3 = 'hh')).toThrowError(new Error('The PROP3 format is invalid.'));
		expect((user.PROP3 = 'email@email.com')).toBe('email@email.com');
	});

	test('Entity check primary key', () => {

		class UserTest extends User {

		}

		class UserTest2 extends User {
			@PrimaryKey
			PRIMARYKEY!: string;
		}

		const entity: User = new UserTest(data[0]);
		expect(()=>entity.primaryKeyName).toThrowError('Primary key not defined for object UserTest')

		const entity2: User = new UserTest2(data[0]);
		expect(entity2.primaryKeyName).toBe('PRIMARYKEY');
	});
	
	test('verify data types', () => {
		/* const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0]; */
	});

	test('initialize properties', () => {
		// check initialize properties and to be saved should not be true
		/* const entitySet: EntitySet = new UserSet(data);
		const entity: User = entitySet[0]; */
	});

	/* 	test('Get Owner', () => {
		const entitySet: EntitySet = new EntitySet(data);
		expect(entitySet[0].getString('NAME')).toBe(data[0].NAME);
		expect(entitySet[1].getString('NAME')).toBe(data[1].NAME);
	}); */
});
