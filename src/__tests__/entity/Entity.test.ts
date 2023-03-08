import { Entity, EntityAttributes, FieldAccess } from '../../entity';
import {
	AttributeNotFoundException,
	AttributeReadonlyException,
	AttributeRequiredException,
	EntityReadonlyException,
} from '../../exceptions';
import { NonPersistent, PrimaryKey, Readonly, Required, ValidatorJS } from '../../decorators';

describe('Entity', () => {
	describe('Entity getters', () => {
		const data = {
			STRING: '1',
			NUMBER: 1,
			DATE: new Date('1/1/2020 12:00 AM'),
			ISODATE: '2020-01-01T05:00:00.000Z',
			BOOLEAN: true,
			NULL: null,
			UNDEFINED: undefined,
		};
		class User extends Entity {
			STRING!: string;
			NUMBER!: number;
			DATE!: Date;
			ISODATE!: string;
			BOOLEAN!: boolean;
			NULL!: string | null;
			UNDEFINED!: string;
		}

		test('Getters should return raw values', () => {
			const user = new User(data);

			expect(user.STRING).toBe(data.STRING);
			expect(user.NUMBER).toBe(data.NUMBER);
			expect(user.DATE).toBe(data.DATE);
			expect(user.ISODATE).toBe(data.ISODATE);
			expect(user.BOOLEAN).toBe(data.BOOLEAN);
			expect(user.NULL).toBe(data.NULL);
			expect(user.NULL).toBeNull();
		});

		describe('getValue()', () => {
			test('should return raw values', () => {
				const user = new User(data);

				expect(user.getValue('STRING')).toBe(data.STRING);
				expect(user.getValue('NUMBER')).toBe(data.NUMBER);
				expect(user.getValue('DATE')).toBe(data.DATE);
				expect(user.getValue('ISODATE')).toBe(data.ISODATE);
				expect(user.getValue('BOOLEAN')).toBe(data.BOOLEAN);
				expect(user.getValue('NULL')).toBe(data.NULL);
				expect(user.getValue('NULL')).toBeNull();
			});

			test('should throw exception for undefined values', () => {
				const user = new User(data);

				expect(() => user.getValue('UNDEFINED')).toThrowError(new AttributeNotFoundException('UNDEFINED'));
				expect(() => user.getValue('UNDECLARED' as any)).toThrowError(new AttributeNotFoundException('UNDECLARED'));
			});
		});

		describe('getString()', () => {
			test('should return string values of raw types', () => {
				const user = new User(data);

				expect(user.getString('STRING')).toBe('' + data.STRING);
				expect(user.getString('NUMBER')).toBe('' + data.NUMBER);
				expect(user.getString('DATE')).toBe('' + data.DATE);
				expect(user.getString('ISODATE')).toBe('' + data.ISODATE);
				expect(user.getString('BOOLEAN')).toBe('' + data.BOOLEAN);
			});

			test('should return null', () => {
				const user = new User(data);

				expect(user.getString('NULL')).toBeNull();
			});

			test('should throw exception for undefined values', () => {
				const user = new User(data);

				expect(() => user.getString('UNDEFINED')).toThrowError(new AttributeNotFoundException('UNDEFINED'));
				expect(() => user.getString('UNDECLARED' as any)).toThrowError(new AttributeNotFoundException('UNDECLARED'));
			});
		});

		describe('getNumber()', () => {
			test('should return number types', () => {
				const user = new User(data);

				expect(user.getNumber('STRING')).toBe(1);
				expect(user.getNumber('NUMBER')).toBe(1);
				expect(user.getNumber('DATE')).toBe(12020000000);
				expect(user.getNumber('ISODATE')).toBe(2020);
			});

			test('should return null', () => {
				const user = new User(data);

				expect(user.getNumber('NULL')).toBeNull();
			});

			test('should throw exception for undefined values', () => {
				const user = new User(data);

				expect(() => user.getNumber('UNDEFINED')).toThrowError(new AttributeNotFoundException('UNDEFINED'));
				expect(() => user.getNumber('UNDECLARED' as any)).toThrowError(new AttributeNotFoundException('UNDECLARED'));
			});

			test('should return NaN for unparseable values', () => {
				const user = new User(data);

				expect(user.getNumber('BOOLEAN')).toBe(NaN);
			});
		});

		describe('getDate()', () => {
			test('should return date objects', () => {
				const user = new User(data);

				expect(user.getDate('STRING')).toMatchObject(new Date('1970-01-01T00:00:00.001Z'));
				expect(user.getDate('NUMBER')).toMatchObject(new Date('1970-01-01T00:00:00.001Z'));
				expect(user.getDate('DATE')).toMatchObject(new Date('1/1/2020 12:00 AM'));
				expect(user.getDate('ISODATE')).toMatchObject(new Date('1/1/2020 12:00 AM'));
			});

			test('should return null', () => {
				const user = new User(data);

				expect(user.getDate('NULL')).toBeNull();
			});

			test('should throw exception for undefined values', () => {
				const user = new User(data);

				expect(() => user.getDate('UNDEFINED')).toThrowError(new AttributeNotFoundException('UNDEFINED'));
				expect(() => user.getDate('UNDECLARED' as any)).toThrowError(new AttributeNotFoundException('UNDECLARED'));
			});

			test('should return null for unparseable values', () => {
				const user = new User(data);

				expect(user.getDate('BOOLEAN')).toBeNull();
			});
		});

		describe('isNull()', () => {
			test('should be false', () => {
				const user = new User(data);

				expect(user.isNull('STRING')).toBeFalsy();
				expect(user.isNull('NUMBER')).toBeFalsy();
				expect(user.isNull('DATE')).toBeFalsy();
				expect(user.isNull('ISODATE')).toBeFalsy();
				expect(user.isNull('BOOLEAN')).toBeFalsy();
			});

			test('should be true', () => {
				const user = new User(data);

				expect(user.isNull('NULL')).toBeTruthy();
			});

			test('should throw exception for undefined values', () => {
				const user = new User(data);

				expect(() => user.isNull('UNDEFINED')).toThrowError(new AttributeNotFoundException('UNDEFINED'));
				expect(() => user.isNull('UNDECLARED' as any)).toThrowError(new AttributeNotFoundException('UNDECLARED'));
			});
		});

		describe('isNotNull()', () => {
			test('should be true', () => {
				const user = new User(data);

				expect(user.isNotNull('STRING')).toBeTruthy();
				expect(user.isNotNull('NUMBER')).toBeTruthy();
				expect(user.isNotNull('DATE')).toBeTruthy();
				expect(user.isNotNull('ISODATE')).toBeTruthy();
				expect(user.isNotNull('BOOLEAN')).toBeTruthy();
			});

			test('should be false', () => {
				const user = new User(data);

				expect(user.isNotNull('NULL')).toBeFalsy();
			});

			test('should throw exception for undefined values', () => {
				const user = new User(data);

				expect(() => user.isNotNull('UNDEFINED')).toThrowError(new AttributeNotFoundException('UNDEFINED'));
				expect(() => user.isNotNull('UNDECLARED' as any)).toThrowError(new AttributeNotFoundException('UNDECLARED'));
			});
		});
	});

	describe('Check if modified', () => {
		const data = {
			STRING: '1',
			NUMBER: 1,
		};
		class User extends Entity {
			STRING!: string;
			NUMBER!: number;

			protected onBeforeChange(attribute: string, value: any): any {
				const keys: EntityAttributes<this> = {
					STRING: (): any => {
						if (value == 'test change') {
							throw Error(value);
						}
						return value;
					},
				};
				const func = keys[attribute as keyof this];
				return func ? func() : value;
			}
		}

		test('should be marked as "to be saved"', () => {
			const user = new User(data);

			expect(user.toBeSaved).toBe(false);

			user.STRING = 'Test User';
			expect(user.toBeSaved).toBe(true);

			user.reset();
			expect(user.toBeSaved).toBe(false);
		});

		test('should NOT mark field as modified and entity "to be saved" if error is thrown', () => {
			const user = new User(data);

			expect(() => user.setValue('STRING', 'test change')).toThrowError(new Error('test change'));
			expect(user.isFieldModified('STRING')).toBe(false);
			expect(user.toBeSaved).toBe(false);
		});

		test('should mark field as modified and entity "to be saved"', () => {
			const user = new User(data);

			user.STRING = 'Test User';
			expect(user.isFieldModified('STRING')).toBe(true);
			expect(user.toBeSaved).toBe(true);
		});

		test('should NOT mark field as modified and entity "to be saved" using NOCHANGE modifier', () => {
			const user = new User(data);

			user.setValue('STRING', 'works', FieldAccess.NOCHANGE);
			expect(user.STRING).toBe('works');
			expect(user.isFieldModified('STRING')).toBe(false);
			expect(user.toBeSaved).toBe(false);
		});

		test('should reset flags after "reset()" is called', () => {
			const user = new User(data);

			expect(user.isFieldModified('STRING')).toBe(false);
			expect(user.toBeSaved).toBe(false);

			user.setValue('STRING', 'works', FieldAccess.NOCHANGE);
			expect(user.STRING).toBe('works');
			expect(user.isFieldModified('STRING')).toBe(false);
			expect(user.toBeSaved).toBe(false);

			user.STRING = 'Test User';
			expect(user.toBeSaved).toBe(true);

			user.reset();
			expect(user.toBeSaved).toBe(false);
		});

		test('should mark field as modified', () => {
			const user = new User(data);

			user.STRING = 'Test User';
			expect(user.isFieldModified('STRING')).toBe(true);
			expect(user.isFieldModified('NO_PROP' as any)).toBe(false);
		});

		test('should leave other fields as not modified', () => {
			const user = new User(data);

			user.STRING = 'Test User';
			expect(user.isFieldModified('STRING')).toBe(true);
			expect(user.isFieldModified('NUMBER')).toBe(false);
		});

		test('should mark field as not modified after reset', () => {
			const user = new User(data);

			user.STRING = 'Test User';
			expect(user.isFieldModified('STRING')).toBe(true);
			user.reset();
			expect(user.isFieldModified('STRING')).toBe(false);
		});
	});

	describe('Field messages', () => {
		const data = {
			STRING: '1',
		};
		class User extends Entity {
			STRING!: string;
		}

		test('should be error message', () => {
			const user = new User(data);

			user.setFieldError('STRING', 'Error Message');
			expect(user.getFieldMessage('STRING')).toMatchObject({ type: 'error', message: 'Error Message' });

			user.reset();
			expect(user.getFieldMessage('STRING')).toBeNull();
		});

		test('should be info message', () => {
			const user = new User(data);

			user.setFieldInfo('STRING', 'Info Message');
			expect(user.getFieldMessage('STRING')).toMatchObject({ type: 'info', message: 'Info Message' });

			user.reset();
			expect(user.getFieldMessage('STRING')).toBeNull();
		});

		test('should be warn message', () => {
			const user = new User(data);

			user.setFieldWarning('STRING', 'Warn Message');
			expect(user.getFieldMessage('STRING')).toMatchObject({ type: 'warn', message: 'Warn Message' });

			user.reset();
			expect(user.getFieldMessage('STRING')).toBeNull();
		});
	});

	describe('Clone/Copy', () => {
		const data = {
			STRING: '1',
			NUMBER: 1,
			DATE: new Date('1/1/2020 12:00 AM'),
			ISODATE: '2020-01-01T05:00:00.000Z',
			BOOLEAN: true,
			NULL: null,
			UNDEFINED: undefined,
		};
		class User extends Entity {
			STRING!: string;
			NUMBER!: number;
			DATE!: Date;
			ISODATE!: string;
			BOOLEAN!: boolean;
			NULL!: string | null;
			UNDEFINED!: string;
		}

		test('should clone data', () => {
			const user = new User(data);

			const copyEntity: object = user.clone();
			expect(JSON.stringify(copyEntity)).toBe(JSON.stringify(data));
		});

		test('should copy data and constructor', () => {
			const user = new User(data);

			const clonedEntity: User = user.copy() as User;
			expect(clonedEntity.constructor.name).toBe('User');
			expect(clonedEntity instanceof User).toBe(true);
		});
	});

	describe('Select/Unselect', () => {
		const data = {
			STRING: '1',
		};
		class User extends Entity {
			STRING!: string;
		}

		test('should select', () => {
			const user = new User(data);

			user.select();
			expect(user.isSelected).toBe(true);
		});

		test('should unselect', () => {
			const user = new User(data);

			user.select();
			user.unselect();
			expect(user.isSelected).toBe(false);
		});

		test('should unselect after reset', () => {
			const user = new User(data);

			user.select();
			user.reset();
			expect(user.isSelected).toBe(false);
		});

		test('should toggle select', () => {
			const user = new User(data);

			user.select();
			expect(user.isSelected).toBe(true);
			user.selectToggle();
			expect(user.isSelected).toBe(false);
		});
	});

	describe('Delete/Undelete', () => {
		const data = {
			STRING: '1',
		};
		class User extends Entity {
			STRING!: string;
		}

		test('should mark as deleted', () => {
			const user = new User(data);

			user.delete();
			expect(user.toBeDeleted).toBe(true);
		});

		test('should undelete', () => {
			const user = new User(data);

			user.delete();
			user.undelete();
			expect(user.toBeDeleted).toBe(false);
		});

		test('should undelete after reset', () => {
			const user = new User(data);

			user.delete();
			user.reset();
			expect(user.toBeDeleted).toBe(false);
		});

		test('should toggle delete', () => {
			const user = new User(data);

			user.delete();
			expect(user.toBeDeleted).toBe(true);
			user.deleteToggle();
			expect(user.toBeDeleted).toBe(false);
		});
	});

	describe('Readonly/Required/Hidden', () => {
		const data = {
			STRING: '1',
			NUMBER: 1,
		};
		class User extends Entity {
			STRING!: string | null;
			NUMBER!: number;
		}

		test('should be readonly attribute', () => {
			const user = new User(data);

			user.setFieldReadonly('STRING', true);
			expect(user.isFieldReadonly('STRING')).toBe(true);
			user.setFieldReadonly('STRING', false);
			expect(user.isFieldReadonly('STRING')).toBe(false);

			user.setFieldReadonly(['STRING', 'NUMBER'], true);
			expect(user.isFieldReadonly('STRING')).toBe(true);
			expect(user.isFieldReadonly('NUMBER')).toBe(true);

			user.setFieldReadonly('STRING', false);
			expect(user.isFieldReadonly('STRING')).toBe(false);
			expect(user.isFieldReadonly('NUMBER')).toBe(true);

			user.setFieldReadonly(['STRING', 'NUMBER'], true);

			user.setFieldReadonly(['STRING', 'NUMBER'], false);
			expect(user.isFieldReadonly('STRING')).toBe(false);
			expect(user.isFieldReadonly('NUMBER')).toBe(false);
		});

		test('should throw error on readonly fields', () => {
			const user = new User(data);

			user.setFieldReadonly('STRING', true);
			expect(() => (user.STRING = 'test')).toThrowError(new AttributeReadonlyException('STRING'));
		});

		test('should be required attribute', () => {
			const user = new User(data);

			user.setFieldRequired('STRING', true);
			expect(user.isFieldRequired('STRING')).toBe(true);
			user.setFieldRequired('STRING', false);
			expect(user.isFieldRequired('STRING')).toBe(false);

			user.setFieldRequired(['STRING', 'NUMBER'], true);
			expect(user.isFieldRequired('STRING')).toBe(true);
			expect(user.isFieldRequired('NUMBER')).toBe(true);

			user.setFieldRequired('STRING', false);
			expect(user.isFieldRequired('STRING')).toBe(false);
			expect(user.isFieldRequired('NUMBER')).toBe(true);

			user.setFieldRequired(['STRING', 'NUMBER'], true);

			user.setFieldRequired(['STRING', 'NUMBER'], false);
			expect(user.isFieldRequired('STRING')).toBe(false);
			expect(user.isFieldRequired('NUMBER')).toBe(false);
		});

		test('should throw error on required fields', () => {
			const user = new User(data);

			user.setFieldReadonly('STRING', false);
			user.setFieldRequired('STRING', true);
			expect(() => {
				user.STRING = null;
				user.validate();
			}).toThrowError(new AttributeRequiredException('STRING'));
		});

		test('should be hidden attribute', () => {
			const user = new User(data);

			user.setFieldHidden('STRING', true);
			expect(user.isFieldHidden('STRING')).toBe(true);
			user.setFieldHidden('STRING', false);
			expect(user.isFieldHidden('STRING')).toBe(false);

			user.setFieldHidden(['STRING', 'NUMBER'], true);
			expect(user.isFieldHidden('STRING')).toBe(true);
			expect(user.isFieldHidden('NUMBER')).toBe(true);

			user.setFieldHidden('STRING', false);
			expect(user.isFieldHidden('STRING')).toBe(false);
			expect(user.isFieldHidden('NUMBER')).toBe(true);

			user.setFieldHidden(['STRING', 'NUMBER'], true);

			user.setFieldHidden(['STRING', 'NUMBER'], false);
			expect(user.isFieldHidden('STRING')).toBe(false);
			expect(user.isFieldHidden('NUMBER')).toBe(false);
		});

		test('should make be readonly entity', () => {
			const user = new User(data);

			user.setReadonly(true);
			expect(user.isReadonly).toBe(true);
			expect(() => (user.STRING = 'test')).toThrowError(new EntityReadonlyException(user.constructor.name));

			user.setReadonly(false);
			expect(user.isReadonly).toBe(false);
			user.STRING = 'test1';
			expect(user.STRING).toBe('test1');
		});
	});

	describe('On Readonly/Required/Hidden event handlers', () => {
		const data = {
			STRING: '1',
			NUMBER: 1,
		};
		class User extends Entity {
			STRING!: string;
			NUMBER!: number;

			protected onFieldReadonly(attribute: string, value: boolean): boolean {
				return false;
			}

			protected onFieldRequired(attribute: string, value: boolean): boolean {
				return false;
			}

			protected onFieldHidden(attribute: string, value: boolean): boolean {
				return false;
			}
		}

		test('should override readonly', () => {
			const user = new User(data);

			user.setFieldReadonly('STRING', true);
			expect(user.isFieldReadonly('STRING')).toBe(false);
		});

		test('should override required', () => {
			const user = new User(data);

			user.setFieldRequired('STRING', true);
			expect(user.isFieldRequired('STRING')).toBe(false);
		});

		test('should override hidden', () => {
			const user = new User(data);

			user.setFieldHidden('STRING', true);
			expect(user.isFieldHidden('STRING')).toBe(false);
		});
	});

	describe('Before/After Change Event Handlers', () => {
		const data = {
			STRING: '1',
			NUMBER: 1,
		};
		class User extends Entity {
			STRING!: string;
			NUMBER!: number;

			protected onBeforeChange(attribute: string): any {
				const keys: EntityAttributes<this> = {
					STRING: () => {
						return 'BEFORE';
					},
				};
				const func = keys[attribute as keyof this];
				return func ? func() : null;
			}

			protected onAfterChange(attribute: string): void {
				const keys: EntityAttributes<this> = {
					STRING: () => {
						this.STRING += '_AFTER';
						this.setFieldRequired('STRING', true);
						this.setFieldRequired('NUMBER', false);
					},
				};
				const func = keys[attribute as keyof this];
				func ? func() : null;
			}
		}

		test('should trigger before/after event handlers', () => {
			const user = new User(data);

			user.STRING = 'NEW NAME';
			expect(user.STRING).toBe('BEFORE_AFTER');
			expect(user.isFieldRequired('STRING')).toBe(true);
			expect(user.isFieldRequired('NUMBER')).toBe(false);
		});
	});

	describe('Decorators', () => {
		const data = {
			STRING: '1',
			NUMBER: 1,
		};
		class User extends Entity {
			STRING!: string;
			NUMBER!: number;
		}

		describe('NonPersistent', () => {
			class User2 extends User {
				@NonPersistent
				NON_PERSISTENT_FIELD!: string;
			}

			test('should remove non-persistent fields', () => {
				let user = new User2(data);

				user.NON_PERSISTENT_FIELD = 'test';
				expect(user.NON_PERSISTENT_FIELD).toBe('test');
				expect(user.asData).toBe(JSON.stringify(data));
			});

			test('should default value to null', () => {
				let user = new User2(data);

				expect(user.NON_PERSISTENT_FIELD).toBe(null);
			});
		});

		describe('Required', () => {
			class User2 extends User {
				@Required
				REQUIRED_FIELD!: string;
			}

			test('should mark field required', () => {
				const user = new User2(data);

				expect(user.isFieldRequired('REQUIRED_FIELD')).toBe(true);
			});

			test('should default value to null', () => {
				const user = new User2(data);
				expect(user.REQUIRED_FIELD).toBe(null);
			});
		});

		describe('Readonly', () => {
			class User2 extends User {
				@Readonly
				READONLY_FIELD!: string;
			}

			test('should mark field readonly', () => {
				const user: User2 = new User2(data);

				expect(user.isFieldReadonly('READONLY_FIELD')).toBe(true);
			});

			test('should default value to null', () => {
				const user: User2 = new User2(data);

				expect(user.READONLY_FIELD).toBe(null);
			});
		});

		describe('ValidatorJS', () => {
			class User extends Entity {
				@ValidatorJS({ rules: 'required' })
				PROP1!: string;

				@ValidatorJS({ rules: 'required|same:PROP1' })
				PROP2!: string;

				@ValidatorJS({ rules: 'required|email' })
				PROP3!: string;
			}

			test('should validate per rules', () => {
				const data = { PROP1: 'test', NOT_DECLARED_PROP: 'prop2', READONLY_ATTR: 'readonly' };
				const user = new User(data);
				expect((user.PROP1 = 'h')).toBe('h');

				user.PROP1 = '';
				expect(user.getFieldMessage('PROP1')?.message).toBe('The PROP1 field is required.');
				expect((user.PROP2 = 'h')).toBe('h');

				user.PROP2 = 'hh';
				expect(user.getFieldMessage('PROP2')?.message).toBe('The PROP2 and PROP1 fields must match.');

				user.PROP3 = 'hh';
				expect(user.getFieldMessage('PROP3')?.message).toBe('The PROP3 format is invalid.');
				expect((user.PROP3 = 'email@email.com')).toBe('email@email.com');
			});

			test('should re-validate each modified field as data changes', () => {
				const user = new User(data);

				user.PROP1 = '';
				expect(user.getFieldMessage('PROP1')?.message).toBe('The PROP1 field is required.');

				user.PROP2 = 'testing';
				expect(user.getFieldMessage('PROP1')?.message).toBe('The PROP1 field is required.');
				expect(user.getFieldMessage('PROP2')?.message).toBe('The PROP2 and PROP1 fields must match.');

				user.PROP1 = 'testing1';
				expect(user.getFieldMessage('PROP1')).toBe(null);
				expect(user.getFieldMessage('PROP2')?.message).toBe('The PROP2 and PROP1 fields must match.');

				user.PROP1 = 'testing';
				expect(user.getFieldMessage('PROP1')).toBe(null);
				expect(user.PROP1).toBe(user.PROP2);
				expect(user.getFieldMessage('PROP2')).toBe(null);
			});
		});

		describe('PrimaryKey', () => {
			class User2 extends User {
				@PrimaryKey
				PRIMARYKEY!: string;
			}

			class User3 extends User {
				PRIMARYKEY!: string;
			}

			test('should set primary key', () => {
				const user: User2 = new User2(data);
				expect(user.primaryKeyName).toBe('PRIMARYKEY');
			});

			test('should throw error when primary key is not set', () => {
				const user: User3 = new User3(data);
				expect(() => user.primaryKeyName).toThrowError('Primary key not defined for object User3');
			});
		});
	});

	describe('Validation', () => {
		const data = {
			STRING: '1',
			NUMBER: 1,
		};
		class User extends Entity {
			@Required
			STRING!: string;
			NUMBER!: number;
		}

		test('should throw error', () => {
			const user = new User(data);

			user.STRING = '';
			expect(() => user.validate()).toThrowError('STRING is required');
			expect(() => user.asData).toThrowError('STRING is required');
		});
	});

	describe('Initialize Data, default values', () => {
		const data = {
			STRING: 'String',
			NUMBER: 1,
		};
		class User extends Entity {
			STRING!: string;
			NUMBER!: number;
			DEFAULT_VALUE: string = 'Default';
		}

		test('should initialize default values', () => {
			const user = new User(data);

			expect(user.toBeSaved).toBeFalsy();
			user.DEFAULT_VALUE = 'New Value';
			expect(user.toBeSaved).toBeTruthy();
		});
	});

	describe('i18n', () => {
		const data = {
			USERNAME: 'Dumb and Dumber',
			PASSWORD: 'Samsonite',
		};
		class Sample extends Entity {
			USERNAME!: string;
			PASSWORD!: string;
		}

		test('should use FR language', async () => {
			const user = new Sample(data);
			await user.useLang('test-fr');
			expect(user.getLabel('USERNAME')).toBe('Nom d\'utilisateur');
			expect(user.getLabel('PASSWORD')).toBe('Mot de passe');
			user.appName = "PROFILE";
			expect(user.getLabel('PASSWORD')).toBe('Mot de passe du profil');
		});
	});

});
