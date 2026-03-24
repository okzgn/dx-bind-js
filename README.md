# DX Bind

DX Bind is a lightweight, framework-agnostic, zero-dependency utility designed to simplify dynamic dependency injection and property binding. Making it a perfect companion for Angular, React, Vue, Node.js, or pure Vanilla JavaScript environments.

It allows you to centralize your dependencies and bind them into your classes or objects at runtime with minimal boilerplate.

## 💡 Features

*   **Framework-Agnostic:** Not tied to any framework. Use it wherever you need dynamic dependency resolution.
*   **Prototype-Safe:** Built with security in mind. It uses `Object.create(null)` and strict property filtering to prevent Prototype Pollution.
*   **Namespaced Binding:** Organize your dependencies into modules (e.g., `services`, `config`, `utils`) and keep your target objects clean.
*   **Zero Dependencies:** Tiny footprint, pure JavaScript/TypeScript.
*   **Dynamic:** Supports both class-based injection (using your own injection strategy) and instance-based property binding (binding to `this`).

## 🚀 Installation

Install the package via NPM:

```bash
npm install dx-bind
```
## 📖 Usage

### 1. Configure the Registry
Centralize your services, objects, or classes. You can call Registry multiple times to merge new dependencies into the existing global source.

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
### 2. Bind to a Class or Instance
You can bind dependencies to a class constructor or directly to an existing instance (`this`).

```typescript
import { Bind } from 'dx-bind';

// Example: Using in an Angular-like context with an injection strategy
export class MyComponent {
  constructor() {
    // Automatically binds 'service' and 'config' modules to 'this'
    Bind(this, inject); 
    
    // Now you can access them directly:
    // this.service.auth.login();
    // console.log(this.config.apiUrl);
  }
}

// Or:
// Usage in Vanilla JS (No DI framework needed)
class App {
  constructor() {
    Bind(this); // Binds everything to 'this' automatically
    console.log(this.config.apiUrl);
  }
}
```
## 📖 API

### `Registry(objectToBind)`
Configures the global source of dependencies.

### `Bind(target, mode?, fallbackMode?)`
- `target`: The object or class constructor.
- `mode`: (Optional) Either an injection function (e.g., `inject`) or an array of module names. **If omitted, all modules in the Registry are bound.**
- `fallbackMode`: (Optional) The default injection strategy if `mode` is used as an array of modules.

## Security
This package implements strict `hasOwnProperty` checks and a blacklist to prevent the binding of internal JavaScript properties like `__proto__`, `prototype`, and `constructor`, ensuring your objects remain secure and stable.

---

## 📝 License

MIT License.

Copyright © 2026 [OKZGN](https://okzgn.com)