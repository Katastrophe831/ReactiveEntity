import { EntitySet, Entity, EntityAttributes, FieldAccess } from '../entity';
import { AttributeReadonlyException, AttributeRequiredException } from '../exceptions';
import { AttributeConfig, NonPersistent, PrimaryKey, Readonly, Required, ValidatorJS } from '../decorators';

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

		const userData = {
			USERID: '1',
			FIRSTNAME: 'John',
			LASTNAME: 'Smith',
			BIRTHDAY: new Date(),
		};

		class User extends Entity {
			@ValidatorJS({ rules: 'required' })
			USERID!: string;
			FIRSTNAME!: string;
			LASTNAME!: string;
			PASSWORD!: string;

			@ValidatorJS({ rules: 'required|same:PASSWORD' })
			CONFIRM_PASSWORD!: string;

			@ValidatorJS({ rules: 'required|email' })
			EMAIL!: string;

			// intercepts the value BEFORE it is set on the entity
			protected onBeforeChange(attribute: string, value: any): any {
				if (attribute === 'FIRSTNAME') {
					return (value += ' is awesome!');
				}
				// Be sure to always return a value
				return value;
			}
		}

		class Gamer extends User {
			@Required
			GAMERTAG!: string;

			// intercepts the value BEFORE it is set on the entity
			protected onBeforeChange(attribute: string, value: any): any {
				if (attribute === 'FIRSTNAME' && value === 'Jane') {
					value = 'GI ' + value;
					return super.onBeforeChange(attribute, value);
				}
				// Be sure to always return a value
				return value;
			}
		}

		const user = new Gamer(userData);
		user.FIRSTNAME = 'Jane';
		expect(user.FIRSTNAME).toBe('GI Jane is awesome!');
		//console.log(user.asData);
	});

	test('Used to run single test without running every test :)', () => {
		// const entitySet: UserSet = new UserSet({ data: data, isReadonly: false, appName: 'USERAPP' });
		// const entity: User = entitySet[0];

		const userData = {
			USERID: '1',
			FIRSTNAME: 'John',
			LASTNAME: 'Smith',
			BIRTHDAY: new Date(),
		};

		class User extends Entity {
			USERID!: string;
			@Readonly
			FIRSTNAME!: string;
			LASTNAME!: string;
			BIRTHDAY!: Date;

			protected onFieldReadonly(attribute: string, value: boolean): boolean {
				if (attribute === 'FIRSTNAME' && this.USERID == '1') {
					// override logic of readonly for this field
					return false;
				}

				return value;
			}
		}

		const user = new User(userData);
		expect(user.isFieldReadonly('FIRSTNAME')).toBe(false);
	});
});
