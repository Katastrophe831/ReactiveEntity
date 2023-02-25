# **This project is still under active development**

# ReactiveEntity

There is a lot of discussion around Anemic Models vs. Rich Domain Models in Domain Driven Design (DDD). With Anemic Models, you need to have service layers, factories, or builder patterns on top of your models, which adds layers of complexities.  Rich Domain Models help minimize the layers needed to bridge the gap between your models and your data store.  Then you have Reactive Forms in Angular which takes Anemic Models and builds a reactive UI on top of your models, which works well, but requires you to put a lot of your domain logic inside your form components which become less useful when you have large enterprise data applications that uses the same domain models across appliations.  Wouldn't it be nice to have a Rich Domain Model that is also reactive that works in browser and Node?

# Goals

The main goal of this project is to decouple your domain model from your backend using JSON data as your interface.  JSON (anemic) data is king!  Your backend could be MSSQL, Mongo or even a REST API service. As long as you have a JSON data model, you can wrap it a ReactiveEntity with domain business logic. Then build reactive front end applications along with field validations and convert your rich domain models back to <u>**validated**</u> JSON data to pass back to your persistent data store.  No more need for front end reactive forms and backend DTOs.

# Why use ReactiveEntity?

* Works in both browser and Node
* Built for Angular UI components without the need of Reactive Forms
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

* Internal change tracking
* Readonly / required fields
* Select / Unselect
* Delete / Undelete
* Non - Persistent fields
* Field validations
* Field exception handling
* Multiple inheritance

# Internal Change Tracking

### Detecting and Marking Changes

When an entity is modified, there are entity and field level flags to mark them as being modified.

```typescript
user.FIRSTNAME = 'Jane';

console.log(user.toBeSaved) // true
console.log(user.isFieldModified('FIRSTNAME')) // true
```
### Readonly / Required Fields

> .setFieldRequired(attribute: string | string[], required: boolean): void

Mark fields required

```typescript
user.setFieldRequired('FIRSTNAME', true);
user.isFieldRequired('FIRSTNAME') // true

user.FIRSTNAME = null;

user.validate(); // throws exception 'Attribute NAME is required'
```

> .setFieldReadonly(attribute: string | string[], readonly: boolean): void

Mark fields readonly

```typescript
user.setFieldReadonly('FIRSTNAME', true);
user.isFieldReadonly('FIRSTNAME') // true

user.FIRSTNAME = null; // throws exception 'Attribute NAME is readonly'
```

Mark multiple fields readonly / required

```typescript
user.setFieldReadonly(['FIRSTNAME', 'LASTNAME'], true);
user.isFieldReadonly('FIRSTNAME') // true
```
Mark whole entity as readonly

> setReadonly(isReadonly: boolean): void

```typescript
user.setReadonly(true);
user.FIRSTNAME = 'Jane'; // throws exception 'Entity User is readonly'
```
