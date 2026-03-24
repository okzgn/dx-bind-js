/**
 * @typedef {Record<string, any>} BindingTypes
 */

/** @type {BindingTypes} */
let BindingSource = Object.create(null);

/** @type {Record<string, boolean>} */
const BindingIgnoredProperties = { '__proto__': true, 'prototype': true, 'constructor': true };

/**
 * Configures the global source of dependencies. Merges with existing ones.
 * @param {BindingTypes} objectToBind - The object containing services/utils/etc.
 */
export function Registry(objectToBind){
  if(isObject(objectToBind) || isFn(objectToBind)){
    Object.assign(BindingSource, objectToBind);
  }
}

/**
 * Binds dependencies to the target object or class.
 * @param {any} target - The object or constructor to inject dependencies into.
 * @param {string[]|Function|null} [mode=null] - Either an array of module names or an injection function.
 * @param {Function|null} [fallbackMode=null] - Fallback strategy function for dependency injection.
 * @returns {any} - The modified target object or the result of the constructor injection.
 */
export function Bind(target, mode = null, fallbackMode = null){
  /** @type {string[]|null} */
  let modules = null;

  // Polymorphic argument handling
  if(Array.isArray(mode)){
    modules = mode;
    mode = fallbackMode;
  }
  
  // Ensure mode and fallbackMode are always functions
  if(!isFn(mode)){
    mode = returned;
  }

  if(!isFn(fallbackMode)){
    fallbackMode = mode;
  }

  try {
    // If target is a class (constructor), use the mode to instantiate/inject it
    if(isFn(target)){
      target = /** @type {Function} */ (mode)(target);
    }

    // If no modules specified, bind everything found in the Registry
    if(!modules){ 
      modules = Object.keys(BindingSource); 
    }

    try {
      for(let module of modules){
        bindWithModeFn(target, BindingSource[module], module, fallbackMode);
      }
    }
    catch(e){
      BindError('Binding error: ' + e.message, e);
    }
  }
  catch(e){
    BindError(e.message, e);
  }

  return target;
}

/**
 * Internal utility to bind properties to a target namespace.
 * @param {any} target - The object to receive the bound properties.
 * @param {any} source - The source object containing dependencies.
 * @param {string} [name=''] - The namespace name (e.g., 'services').
 * @param {Function} [mode=returned] - The injection strategy function.
 * @param {boolean} [silent=false] - If true, logs errors to console instead of throwing.
 */
function bindWithModeFn(target, source, name = '', mode = returned, silent = false){
  const errorMsg = `"${name}" Unknown or undefined source, must be "class", "object" or "function".`;
  
  if(!isObject(source) && !isFn(source)){
    !silent ? BindError(errorMsg) : console.error(errorMsg);
    return;
  }

  let _target;
  try {
    if(!name){
      _target = target;
    }
    else {
      target[name] = target[name] || Object.create(null);
      _target = target[name];
    }
  }
  catch(e){
    const writeErr = `"${name}" Writing property error.`;
    !silent ? BindError(writeErr, e) : console.error(writeErr);
    return;
  }

  for(let part in source){
    if(hasOwnProperty.call(source, part) && !BindingIgnoredProperties[part]){
      try {
        // Here 'mode' is guaranteed to be a function due to Bind() logic
        _target[part] = mode(source[part]);
      }
      catch(e){
        const bindErr = `"${name}" > "${part}" Bind error: ${e.message}`;
        !silent ? BindError(bindErr, e) : console.error(bindErr);
      }
    }
  }
}

/**
 * Throws a standardized DX Bind error.
 * @param {string} message 
 * @param {Error|null} [e=null] 
 */
function BindError(message, e = null){
  let error = new Error(message);
  if(e){ error.name = e.name; }
  throw error;
}

/**
 * Checks if target is a function.
 * @param {any} target 
 * @returns {boolean}
 */
function isFn(target){
  return typeof target === 'function';
}

/**
 * Checks if target is an object.
 * @param {any} target 
 * @returns {boolean}
 */
function isObject(target){
  return target && typeof target === 'object' && !Array.isArray(target);
}

/**
 * Identity function: returns the input value.
 * @param {any} target 
 * @returns {any}
 */
function returned(target){
  return target;
}

const hasOwnProperty = Object.prototype.hasOwnProperty;