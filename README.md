# **This project is still under active development**

# ReactiveEntity

There is a lot of discussion around Anemic Models vs. Rich Domain Models in Domain Driven Design (DDD). With Anemic Models, you need to have service layers, factories, or builder patterns on top of your models, which adds layers of complexities.  Rich Domain Models help minimize the layers needed to bridge the gap between your models and your data store.  Then you have Reactive Forms in Angular which takes Anemic Models and builds a reactive UI on top of your models, which works well, but requires you to put a lot of your domain logic inside your form components which become less useful when you have large enterprise data applications that uses the same domain models across appliations.  Wouldn't it be nice to have a Rich Domain Model that is also reactive that works in browser and Node?

# Goals

The main goal of this project is to decouple your domain model from your backend using JSON data as your interface.  JSON (anemic) data is king!  There is built in typesafe checks but the main focus is to still be flexible when working with JSON data.  Your backend could be MSSQL, Mongo or even a REST API service. As long as you have a JSON data model, you can wrap it a ReactiveEntity with domain business logic. Then build reactive front end applications along with field validations and convert your rich domain models back to <u>**validated**</u> JSON data to pass back to your persistent data store.  No more need for front end reactive forms and backend DTOs.

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

console.log(user.FIRSTNAME); // 'John'
console.log(user.getString('FIRSTNAME')); // 'John'
```

# Rich Domain Logic (Business Logic)

All of the business logic can be contained within the Entity and your entities can be deployed on both your front end applications like Angular or used in your back end server like NodeJS.

### Supported Features

* [Internal change tracking](#internal-change-tracking)
* [Readonly / required fields](#readonly--required-fields)
* [Select / Unselect](#select--unselect)
* [Delete / Undelete](#delete--undelete)
* [Field validations](#field-validations)
* [Field exception handling](#field-exception-handling)
* [Field change event handlers](#field-change-event-handling)
* [Non-Persistent fields](#non-persistent-fields)
* [Inheritance](#inheritance)
* [Decorators](#decorators)

# Internal Change Tracking

### Detecting and Marking Changes

> When an entity is modified, there are entity and field level flags to mark them as being modified.

```typescript
user.FIRSTNAME = 'Jane';

console.log(user.toBeSaved) // true
console.log(user.isFieldModified('FIRSTNAME')) // true
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
# Select / Unselect

Example:
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

There are events to handle 'beforeChange' and 'afterChange' of field values.

### Before Change

```typescript
protected onBeforeChange(attribute: string, value: any): any { }
```

> **<u>Note</u>: this returns **'any'**.  Be sure to always return a value.

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
console.log(user.FIRSTNAME) // Joe

user.FIRSTNAME = 'Jane';
console.log(user.FIRSTNAME) // Jane is awesome
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

# Field Validations

> See also [Decorators](#decorators)

There is built in support for [ValidatorJS](https://github.com/mikeerickson/validatorjs) using a custom built decorator.  ValidatorJS has a bunch of validations that you can use out of the box.  If you can't find any that supports what you need, you can always roll your own decorator.  

Another way to run your own validations, is to intercept the event handlers and customize according to your business rules by intercepting the [event handlers](#field-change-event-handling)

> The flow of validation and setting of the value is as follows:  
> -> Set Value -> Decorator Validation -> onBeforeChange() -> set entity -> onAfterChange()

### Decorator List

* Readonly
* Required
* [NonPersistent](#non-persistent-fields)
* ValidatorJS (see API [here](https://github.com/mikeerickson/validatorjs))
* PrimaryKey

### Readonly Decorator

```typescript
class User extends Entity {
    @Readonly
    USERID!:string;
    FIRSTNAME!:string;
    LASTNAME!:string;
    BIRTHDAY!:Date;

    protected onBeforeChange(attribute: string): void {        
        // BEFORE change is not triggered here for USERID field as it is declared as readonly which fails validation first
    }
}

user.isFieldReadonly('USERID'); // true
user.USERID = 'Joe'; // Throws readonly exception
```

# Field Exception Handling

# Non-Persistent Fields

# Inheritance

# Decorators
