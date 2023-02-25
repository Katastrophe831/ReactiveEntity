# **This project is still under active development**

# ReactiveEntity

There is a lot of discussion around Anemic Models vs. Rich Domain Models in Domain Driven Design (DDD). With Anemic Models, you need to have service layers, factories, or builder patterns on top of your models, which adds layers of complexities.  Rich Domain Models help minimize the layers needed to bridge the gap between your models and your data store.  Then you have Reactive Forms in Angular which takes Anemic Models and builds a reactive UI on top of your models, which works well, but requires you to put a lot of your domain logic inside your form components which become less useful when you have large enterprise data applications that uses the same domain models across appliations.  Wouldn't it be nice to have a Rich Domain Model that is also reactive that works in browser and Node?

# Goals

The main goal of this project is to decouple your domain model from your backend using JSON data as your interface.  JSON (anemic) data is king!  Your backend could be MSSQL, Mongo or even a REST API service. As long as you have a JSON data model, you can wrap it a ReactiveEntity with domain business logic. Then build reactive front end applications along with field validations and convert your rich domain models back to <u>**validated**</u> JSON data to pass back to your persistent data store.

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
}

const user = new User(userData);

console.log(user.FIRSTNAME); // Prints 'John'
```
