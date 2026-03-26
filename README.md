# DX Bind

DX Bind is a lightweight, framework-agnostic, zero-dependency utility designed to simplify dynamic dependency injection and property binding. Making it a perfect companion for Angular, React, Vue, Node.js, or pure Vanilla JavaScript environments.

It allows you to centralize your dependencies and bind them into your objects, functions or classes at runtime with minimal boilerplate.

## 💡 Features

*   **Framework-Agnostic:** Not tied to any framework. Use it wherever you need dynamic dependency resolution.
*   **Prototype-Safe:** Built with security in mind. It uses `Object.create(null)` and strict property filtering to prevent Prototype Pollution.
*   **Namespaced Binding:** Organize your dependencies into modules (e.g., `services`, `config`, `utils`) and keep your target objects clean.
*   **Zero Dependencies:** Tiny footprint, pure JavaScript/TypeScript.
*   **Dynamic:** Supports both class-based injection (using your own injection strategy) and instance-based property binding (binding to `this`).

## ⚡ The 3-Level Pipeline
Processes dependencies through a 3-level transformation pipeline, giving you full control over the lifecycle:

1. **upperMode (Target):** Processes the main object, function or class before binding. Perfect for instantiation (e.g., `(target) => new target()`).
2. **middleMode (Namespace):** Processes the namespace container. Perfect for creating proxies or defining specific object structures.
3. **lowerMode (Property):** Processes namespace property values. Perfect for Lazy Loading, Logging, or Type Conversion.

## 🚀 Installation

Install the package via NPM:

```bash
npm install dx-bind
```
## 📖 Usage

### 1. Configure the Registry
Centralize your services, objects, or classes. You can call `Registry` multiple times to merge new dependencies into the existing global source dependencies.

```typescript
import { Registry } from 'dx-bind';

Registry({
  service: {
    auth: AuthService,
    http: HttpClient
  },
  config: {
    apiUrl: 'https://api.example.com'
  }
});
```
### 2. Bind to an Object, Function or Class
You can bind dependencies to an empty object, function or class, or directly to an existing instance (like `this`).

```typescript
import { Bind } from 'dx-bind';

// Example: Using in an Angular-like context
export class MyComponent {
  constructor() {
    // Using lowerMode for property values transformation
    Bind(this, {
      lowerMode: (value) => {
        return typeof value === 'function' ? new value() : value;
      }
    });
    
    // Bind specific namespaces
    Bind(this, { namespaces: ['service', 'config'] });
  }
}

// Usage in Vanilla JS
class App {
  constructor() {
    Bind(this); // Binds everything to 'this' automatically
    console.log(this.config.apiUrl);
  }
}
```
## 📖 API

### `Registry(dataToMerge, options?)`
Merges new data into the global source dependencies and returns the current data for merging. It starts as a completely plain object.
- `options`: **Optional**. An object with the following properties:
  - `silent`: **Boolean**.
    - Default is `false`. If `true`, don't throw errors, only error logs.

### `SetRegistry(dataToBind, options?)`
Replaces the global source of dependencies and returns previous source.
- `options`: **Optional**. An object with the following properties:
  - `raw`: **Boolean**.
    - Default is `false`. If `true`, replaces the global source dependencies with `dataToBind` as it is. By default it is converted to completely plain object.
  - `silent`: **Boolean**.
    - Default is `false`. If `true`, don't throw errors, only error logs.

### `EmptyRegistry()`
Clears the global source of dependencies with a completely empty object.

### `Bind(target, options?)`
Binds all the global source dependencies to the target using the pipeline. 

- `target`: The target object, function or class constructor to bind dependencies.
- `options`: **Optional**. An object with the following properties:
  - `upperMode`: **Function (target: any, globalSource:any) => any**
    - Strategy function for target processing.
  - `middleMode`: **Function (namespace: any, previousNamespace:any) => any**
    - Strategy function for namespace containers processing.
  - `lowerMode`: **Function (property: any, previousProperty:any) => any**
    - Strategy function for namespace property values processing.

  - `namespaces`: **Array<string|symbol>**.
    - Specific dependency names to bind. **If omitted, all dependencies in the global source are bound.**
  - `raw`: **Boolean**.
    - Default is `false`. If `true`, bypasses the reserved properties blacklist.
  - `silent`: **Boolean**.
    - Default is `false`. If `true`, don't throw errors on `upperMode` and `middleMode` pipelines, only error logs.
  - `internalSilent`: **Boolean**.
    - Default is `false`. If `true`, don't throw errors on `lowerMode` pipeline, only error logs.
  - `symbol`: **Boolean**.
    - Default is `true`. If `false`, `symbols` not be accepted on `middleMode` namespaces.
  - `internalSymbol`: **Boolean**.
    - Default is `true`. If `false`, `symbols` not be accepted on `lowerMode` properties.

## Security
This package implements a contextual, type-based prevention, that automatically identifies data types (`Functions`, `Arrays`, `Objects`) and restricts the binding of critical metadata (like `__proto__`, `prototype`, `constructor`, `name`, `length`, ...), ensuring your data remain secure and stable against Prototype Pollution.

---

## 📝 License

MIT License.

Copyright © 2026 [OKZGN](https://okzgn.com)