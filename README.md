# **This project is still under active development**

# ReactiveEntity

There is a lot of discussion around Anemic Models vs. Rich Domain Models in Domain Driven Design (DDD). With Anemic Models, you need to have service layers, factories, or builder patterns on top of your models, which adds layers of complexities.  Rich Domain Models help minimize the layers needed to bridge the gap between your models and your data store.  Then you have Reactive Forms in Angular which takes Anemic Models and builds a reactive UI on top of your models, which works well, but requires you to put a lot of your domain logic inside your form components which become less useful when you have large enterprise data applications that uses the same domain models across appliations.  Wouldn't it be nice to have a Rich Domain Model that is also reactive that works in browser and Node?

# Goals

The main goal of this project is to decouple your domain model from your backend using JSON data as your interface.  JSON (anemic) data is king!  There is built in typesafe checks but the main focus is to still be flexible when working with JSON data.  Your backend could be MSSQL, Mongo or even a REST API service. As long as you have a JSON data model, you can wrap it with a ReactiveEntity and add custom domain business logic. Then build reactive front end applications along with field validations and convert your rich domain models back to <u>**validated**</u> JSON data to pass back to your persistent data store.  No more need for front end Angular reactive forms and backend DTOs.

# Why use ReactiveEntity?

* Works in both browser and Node
* Built for Angular UI components without the need for Reactive Forms
* Multilingual support (Coming soon)
* Locale support (Coming soon)

# Basic Usage

### Anemic Data Model

```typescript
const userData = {
    "USERID": "1",
    "FIRSTNAME": "John",
    "LASTNAME": "Smith",
    "BIRTHDAY": new Date()
}
```
### Reactive Entity

> Note: Declare your model properties using the same case as your incoming JSON data.

```typescript
import { Entity } from '@ReactiveEntity';

class User extends Entity {
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;
}

const user = new User(userData);

user.FIRSTNAME; // 'John'
user.getString('FIRSTNAME'); // 'John'
```

# Rich Domain Logic (Business Logic)

All of the business logic can be contained within the Entity and your entities can be deployed on both your front end applications like Angular or used in your back end server like NodeJS.

### Supported Features

* [Internal change tracking](#internal-change-tracking)
* [Readonly / required fields](#readonly--required-fields)
* [Select / Unselect](#select--unselect)
* [Delete / Undelete](#delete--undelete)
* [Field validations](#field-validations)
* [Decorators](#decorators)
* [Field change event handlers](#field-change-event-handling)
* [Non-Persistent fields](#non-persistent-fields)
* [Inheritance](#inheritance)
* [Field exception handling](#field-exception-handling)

# Internal Change Tracking

### Detecting and Marking Changes

> When an entity is modified, there are entity and field level flags to mark them as being modified.

```typescript
user.FIRSTNAME = 'Jane';

user.toBeSaved; // true
user.isFieldModified('FIRSTNAME'); // true
```
# Readonly / Required Fields

### Mark fields required

API
```typescript
public setFieldRequired(attribute: string | string[], required: boolean): void
```

Example:
```typescript
user.setFieldRequired('FIRSTNAME', true);
user.isFieldRequired('FIRSTNAME') // true

user.FIRSTNAME = null;

user.validate(); // throws exception 'Attribute NAME is required'
```

### Mark fields readonly

```typescript
public setFieldReadonly(attribute: string | string[], readonly: boolean): void
```

Example:
```typescript
user.setFieldReadonly('FIRSTNAME', true);
user.isFieldReadonly('FIRSTNAME') // true

user.FIRSTNAME = null; // throws exception 'Attribute NAME is readonly'
```

### Mark multiple fields readonly / required

```typescript
user.setFieldReadonly(['FIRSTNAME', 'LASTNAME'], true);
user.isFieldReadonly('FIRSTNAME') // true
```

### Mark whole entity as readonly

```typescript
public setReadonly(isReadonly: boolean): void
```

Example:
```typescript
user.setReadonly(true);
user.FIRSTNAME = 'Jane'; // throws exception 'Entity User is readonly'
```

# Hidden fields

### Mark fields hidden

This is great for UI data restrictions, where you can hide data when using the same entity model but for different modules in your application.

API
```typescript
public setFieldHidden(attribute: string | string[], required: boolean): void
```

Example:
```typescript
user.setFieldHidden('FIRSTNAME', true);
user.isFieldHidden('FIRSTNAME') // true
```

# Select / Unselect

```typescript
user.select();
user.isSelected; // true
user.unselect();
user.isSelected; // false
```
# Delete / Undelete

> This is a non-desctructive action.  Only sets the meta data as 'to be deleted' which can be used to send to your API service to determine what to do with that information

```typescript
user.delete();
user.toBeDeleted; // true
user.undelete();
user.toBeDeleted; // false
```

# Field Change Event Handling

There are events to which you can intercept when working with setting values.

### Event Listeners

* [onBeforeChange](#before-change)
* [onAfterChange](#after-change)
* [onFieldReadonly](#on-field-readonly)
* [onFieldRequired](#on-field-required)
* [onFieldHidden](#on-field-hidden)

### Before Change

API
```typescript
protected onBeforeChange(attribute: string, value: any): any { }
```

> **<u>Note</u>: this returns **'any'**.  Be sure to always return a value.

Example:
```typescript
class User extends Entity {
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;

    // intercepts the value BEFORE it is set on the entity
    protected onBeforeChange(attribute: string, value: any): any {        
        if (attribute === 'FIRSTNAME' && value === 'Jane') {
            return value += ' is awesome!';
        }
        // Be sure to always return a value
        return value;
    }
}

user.FIRSTNAME = 'Joe';
user.FIRSTNAME; // Joe

user.FIRSTNAME = 'Jane';
user.FIRSTNAME; // Jane is awesome
```

### After Change

```typescript
protected onAfterChange(attribute: string, value: any): void { }
```
> **<u>Note</u>: This returns a **'void'** as this event is run 'after' the value has been validated and sucessfully set on the entity

Example:
```typescript
class User extends Entity {
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;

    // intercepts the value AFTER it is set on the entity
    protected onAfterChange(attribute: string): void {        
        if (attribute === 'FIRSTNAME') {
            // Make LASTNAME required
            this.setFieldRequired('LASTNAME');
        }
    }
}

user.isFieldRequired('LASTNAME'); // false
user.FIRSTNAME = 'Joe';
user.isFieldRequired('LASTNAME'); // true
```
### On Field Readonly

Example:
```typescript
class User extends Entity {
    USERID!:string;
    @Readonly
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;

    protected onFieldReadonly(attribute: string, value: boolean): boolean {
        console.log(value); // Current state of readonly for this field

        if (attribute === 'FIRSTNAME' && this.USERID == '1') {
            // override logic of readonly for this field
            return false;
        }
        return value;
    }
}

user.isFieldReadonly('FIRSTNAME'); // false, even using the @Readonly decorator
```

### On Field Required

Example:
```typescript
class User extends Entity {    
    USERID!:string;
    @Required
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;

    protected onFieldRequired(attribute: string, value: boolean): boolean {
        console.log(value); // true; -- Current state of readonly for this field

        if (attribute === 'FIRSTNAME' && this.USERID == '1') {
            // override logic of readonly for this field
            return false;
        }

        return value;
    }
}

user.isFieldRequired('FIRSTNAME'); // false, even using the @Required decorator
```

### On Field Hidden

Example:
```typescript
class User extends Entity {
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;

    protected onFieldHidden(attribute: string, value: boolean): boolean {
        console.log(value); // Current state of readonly for this field

        if (attribute === 'FIRSTNAME' && this.USERID == '1') {
            // override logic of readonly for this field
            return true;
        }

        return value;
    }
}
user.isFieldHidden('FIRSTNAME'); // true
```
# Field Validations

> See also [Decorators](#decorators)

There is built in support for [ValidatorJS](https://github.com/mikeerickson/validatorjs) using a @ValidatorJS decorator.  ValidatorJS has a bunch of validations that you can use out of the box.  If you can't find any that supports what you need, you can always roll your own decorator.  

Another way to run your own validations, is to intercept the event handlers and customize the logic according to your business rules by intercepting the [event handlers](#field-change-event-handling)

> The flow of validation and setting of the value is as follows:  
> Entity -> Set Value -> Decorator Validation -> onBeforeChange() -> set entity -> onAfterChange()

# Decorators

### Decorator List

* [PrimaryKey](#primarykey-decorator)
* [Readonly](#readonly-decorator)
* [Required](#required-decorator)
* [NonPersistent](#nonpersistent-decorator)
* [ValidatorJS](#validatorjs-decorator)

### PrimaryKey Decorator

Used to determine which attribute is the primary key of the object.  Only one PK can be defined.

```typescript
class User extends Entity {
    @PrimaryKey
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;
}

user.primaryKeyName; // "USERID"
user.primaryKeyValue; // "1"
```

### Readonly Decorator

```typescript
class User extends Entity {
    @Readonly
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;
}

user.isFieldReadonly('USERID'); // true
user.USERID = 'Joe'; // Throws readonly exception
```

### Required Decorator

```typescript
class User extends Entity {
    @Required
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;
}

user.isFieldRequired('USERID'); // true
user.USERID = null;
user.validate(); // Throws required field exception
```

### NonPersistent Decorator

Mark fields as non-persistent.  This type of field will act as all other fields where you can apply business logic to it.  Its use case comes when you want to transform your rich domain model back to a JSON or DTO (Data Transfer Object) to send back to your data store.

```typescript
class User extends Entity {
    @Required
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;

    @Readonly
    @NonPersistent
    DISPLAYNAME!:string;

    @NonPersistent
    CONFIRM_PASSWORD!:string;    

    // intercepts the value AFTER it is set on the entity
    protected onAfterChange(attribute: string): void {        
        if (attribute === 'FIRSTNAME' || attribute === 'LASTNAME') {
            this.DISPLAYNAME = this.FIRSTNAME + ' ' + this.LASTNAME;
        }
    }
}

// Validates the data and converts to a DTO, 
// will remove 'CONFIRM_PASSWORD' as it is non-persistent during the conversion,
// but doesn't remove it from the ReactiveEntity
user.asData; 
```
The result will be returned as an anemic data model:

```json
{
    "USERID": "1",
    "FIRSTNAME": "John",
    "LASTNAME": "Smith",
    "BIRTHDAY": "2010-02-26T00:00:00.000Z"
}
```

### ValidatorJS Decorator

Support for ValidatorJS (see complete rules [here](https://github.com/mikeerickson/validatorjs))

Aside from the built-in @Required decorator, you can use ValidatorJS rules to handle additional validation

```typescript
class User extends Entity {
    @ValidatorJS({ rules: 'required' })
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;    
    PASSWORD!:string;

    @NonPersistent
    @ValidatorJS({ rules: 'required|same:PASSWORD' })
    CONFIRM_PASSWORD!:string;

    @ValidatorJS({ rules: 'required|email' })
    EMAIL!:string;
}

user.isFieldRequired('USERID'); // true
user.USERID = null; // throws required field exception
```

The main difference between @Required decorator and @ValidatorJS "required" rule, is that the ValidatorJS is executed when setting the field.  Whereas, the @Required decorator will only throw the exception when you run 'validate()'.

```typescript
user.validate(); // Throws required field exception
```

# Inheritance

In enterprise applications, there are times when you build out of the box base models and then extend them on a per-client requierment.

```typescript
class User extends Entity {
    @ValidatorJS({ rules: 'required' })
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;    
    PASSWORD!:string;

    @NonPersistent
    @ValidatorJS({ rules: 'required|same:PASSWORD' })
    CONFIRM_PASSWORD!:string;

    @ValidatorJS({ rules: 'required|email' })
    EMAIL!:string;

    // intercepts the value BEFORE it is set on the entity
    protected onBeforeChange(attribute: string, value: any): any {        
        if (attribute === 'FIRSTNAME') {
            return value += ' is awesome!';
        }
        // Be sure to always return a value
        return value;
    }    
}

class Gamer extends User {
    @Required
    GAMERTAG!:string;

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

user.FIRSTNAME = "Jane";
user.FIRSTNAME; // GI Jane is awesome!
```

# Field Exception Handling

# Converting to DTOs (Data Transfer Objects)

Building rich domain models with business logic and non-persistent fields is great, but eventually the models need to be converted to anemic models to be passed to a REST service or some other back end API.

API
```typescript
// JSON.stringify() the model but also runs validation and throws any exceptions if it fails
const persistedData = user.asData; 

// Send to your back end
dataStore.save(persistedData);
```