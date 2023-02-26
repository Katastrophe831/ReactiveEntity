import { EntitySet, Entity, EntityAttributes } from '../../entity';

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

	protected onBeforeChange(attribute: string, value: any): any {
		const keys: EntityAttributes<this> = {
			NUMTYPE: (): any => {
				throw new Error('Catch me');
			},
			NAME: (): any => {
				if (value == 'HELLO_2') {
					value = 'HELLO_3';
				}
				return value;
			},
		};
		const func = (keys as any)[attribute];
		return func ? func() : value;
	}

	protected onAfterChange(attribute: string): void {
		switch (attribute) {
			case "NAME":
				this.USERID = this.NAME;
			default:
		}
	}
}

class User_2 extends User {
	public PROP2!: string;

	protected onBeforeChange(attribute: string, value: any): any {
		const keys: EntityAttributes<this> = {
			NUMTYPE: (): any => {
				throw new Error('Catch me');
			},
			NAME: (): any => {
				if (value == 'HELLO') {
					value += '_2';
				}
				return super.onBeforeChange(attribute, value);
			},
		};
		const func = (keys as any)[attribute];
		return func ? func() : value;
	}
}

class UserSet_2 extends UserSet {
	protected get entityClass() {
		return User_2;
	}
}

describe('Entity Inheritance Tests', () => {
	test('getValue()', () => {
		const entitySet: UserSet_2 = new UserSet_2(data);
		expect(entitySet[0].getValue('NAME')).toBe(data[0].NAME);
		expect(entitySet[0].getValue('NUMTYPE')).toBe(1);
		expect(entitySet[0].getValue('NULL')).toBeNull();
	});

	test('clone', () => {
		const entitySet: UserSet = new UserSet(data);
		const entity: User = entitySet[0];
		const copyEntity: object = entity.clone();
		expect(JSON.stringify(copyEntity)).toBe(JSON.stringify(entity));
	});

	test('copy', () => {
		const entitySet: UserSet_2 = new UserSet_2(data);
		const entity: User_2 = entitySet[0];
		const clonedEntity: User = entity.copy() as User_2;
		expect(clonedEntity.constructor.name).toBe('User_2');
		expect(clonedEntity instanceof Entity).toBe(true);
		expect(clonedEntity instanceof User).toBe(true);
		expect(clonedEntity instanceof User_2).toBe(true);
	});

	test('set property value', () => {
		const entitySet: UserSet_2 = new UserSet_2(data);
		const entity: User_2 = entitySet[0];
		entity.NAME = 'HELLO';
		expect(entity.NAME).toBe('HELLO_3');
	});

	test('set value check beforeChange -> afterChange logic', () => {
		const entitySet: UserSet_2 = new UserSet_2(data);
		const entity: User_2 = entitySet[0];
		entity.NAME = 'HELLO';
		expect(entity.USERID).toBe(entity.NAME);
		expect(entity.USERID).toBe('HELLO_3');

		entity.USERID = 'NEW-USERID';
		expect(entity.USERID == entity.NAME).toBeFalsy();
		expect(entity.USERID).toBe('NEW-USERID');
	});

	test('set value check exception with beforeChange', () => {
		const entitySet: UserSet_2 = new UserSet_2(data);
		const entity: User_2 = entitySet[0];
		expect(() => (entity.NUMTYPE = 10)).toThrowError('Catch me');
		expect(entity.NUMTYPE).toBe(1);
	});
});
