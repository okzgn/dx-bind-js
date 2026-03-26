/**
 * @typedef {Record<string, any>} BindingTypes
 * @typedef {Object} BindOptions
 * @property {Function} [upperMode] - Called as: (target, globalSource). Used to process the target class/object.
 * @property {Function} [middleMode] - Called as: (source, previousSource). Used to create/process the namespace container.
 * @property {Function} [lowerMode] - Called as: (value, previousValue). Used to process property values.
 * @property {Array<string|symbol>} [namespaces] - Specific module names to bind.
 * @property {boolean} [silent] - Silences top-level errors.
 * @property {boolean} [internalSilent] - Silences property binding errors.
 * @property {boolean} [symbol] - Allows symbol-keyed namespaces.
 * @property {boolean} [internalSymbol] - Allows symbol-keyed properties.
 * @property {boolean} [raw=false] - If true, bypasses the reserved property blacklist (Prototype Pollution protection). Default: false.
 */

/** @type {BindingTypes} */
let BindingSource = returnEmptyObject();

/** 
 * Security: Reserved property blacklist.
 * Defines global and type-specific properties that cannot be injected to prevent Prototype Pollution.
 * @type {Record<string, Record<string|symbol, boolean>>} 
 */
const Reserved = {
    '[object Object]': { '__proto__': true, 'prototype': true, 'constructor': true },
    '[object Function]': {'length': true, 'name': true, 'prototype': true, 'caller': true, 'arguments': true }
};

/** @type {Record<string, boolean>} */
const GlobalReserved = Reserved['[object Object]'];

/**
 * Configures the global source of dependencies.
 * @param {BindingTypes} dataToMerge - The object, function or class dependencies to merge with global source.
 * @param {BindOptions} [options] - Configuration options.
 * @returns {BindingTypes} - The merged data.
 */
export function Registry(dataToMerge, options){
  if(isCorrect(dataToMerge)){
    Object.assign(BindingSource, dataToMerge);
  }
  else {
    BindError('Cannot register "' + typeof dataToMerge + '" types.', { name: 'Registry error' }, isObject(options) ? options : {});
  }
  return dataToMerge;
}

/**
 * Configures the global source of dependencies. 
 * If raw is false (default), the input object is sanitized by cloning it into a prototype-free container.
 * @param {BindingTypes} dataToBind - The object, function or class dependencies to replace the previous one.
 * @param {BindOptions} [options] - Configuration options.
 * @returns {BindingTypes} - The previous global source of dependencies.
 */
export function SetRegistry(dataToBind, options){
  let previousBindingSource = BindingSource;
  options = isObject(options) ? options : {};
  if(isCorrect(dataToBind)){
    BindingSource = (options.raw === true ? dataToBind : Object.assign(returnEmptyObject(), dataToBind));
  }
  else {
    BindError('Cannot set registry with "' + typeof dataToBind + '" type.', { name: 'SetRegistry error' }, options);
  }
  return previousBindingSource;
}

/**
 * Resets the global source of dependencies.
 */
export function EmptyRegistry(){
  BindingSource = returnEmptyObject();
}

/**
 * Binds global source dependencies to the target object, function or class using a 3-level pipeline:
 * 1. upperMode (Target processing)
 * 2. middleMode (Namespace containers processing)
 * 3. lowerMode (Namespace property values processing)
 * 
 * @param {any} target - The object, function or class to inject into.
 * @param {BindOptions} [options] - Configuration options.
 * @returns {any} - The transformed target.
 */
export function Bind(target, options){
  let defaults = {
    namespaces: null,
    upperMode: null,
    middleMode: null,
    lowerMode: null,
    silent: false,
    internalSilent: false,
    symbol: true,
    internalSymbol: true,
    raw: false
  };

  if(isObject(options)){
    if(isFn(options.upperMode)){ defaults.upperMode = options.upperMode; }
    if(isFn(options.middleMode)){ defaults.middleMode = options.middleMode; }
    if(isFn(options.lowerMode)){ defaults.lowerMode = options.lowerMode; }
    if(Array.isArray(options.namespaces)){ defaults.namespaces = options.namespaces; }
    if(options.silent === true){ defaults.silent = true; }
    if(options.internalSilent === true){ defaults.internalSilent = true; }
    if(options.symbol === false){ defaults.symbol = false; }
    if(options.internalSymbol === false){ defaults.internalSymbol = false; }
    if(options.raw === true){ defaults.raw = true; }
  }

  options = defaults;
  let internalOptions = Object.assign({}, options);

  delete options.internalSilent;
  delete options.internalSymbol;

  try {
    if(options.upperMode){ target = options.upperMode(target, Object.freeze(Object.assign(returnEmptyObject(), BindingSource))); }
    if(!isCorrect(target)){ target = returnEmptyObject(); }

    // If no 'options.namespaces' specified, bind everything found in the global source
    if(!options.namespaces){
      options.namespaces = Reflect.ownKeys(BindingSource); 
    }

    try {
      for(let namespace of options.namespaces){
        // Dynamic contextual and global blacklist check
        if(isReserved(target, namespace, options)){ continue; }

        switch(typeof namespace){
          case 'string':
          case 'symbol':
            bindNamespace(target, BindingSource[namespace], namespace, internalOptions);
          break;
        }
      }
    }
    catch(e){
      BindError('Binding error: ' + e.message, e, options);
    }
  }
  catch(e){
    BindError('Bind error: ' + e.message, e, options);
  }

  return target;
}

/**
 * Internal utility to bind properties to a target namespace.
 * @param {any} target - The object, function or class to receive the bound properties.
 * @param {any} source - The global source namespace containing dependencies.
 * @param {string|symbol} namespace - The namespace (e.g., 'services').
 * @param {BindOptions} [options] - Configuration options.
 */
function bindNamespace(target, source, namespace, options){
  if(!isCorrect(source)){
    BindError('"' + String(namespace) + '" Unknown or undefined namespace source, must be "class", "object" or "function".', { name: 'Type validation' }, options);
    return;
  }

  let internalTarget;
  try {
    if(options.middleMode || !target[namespace]){
      const sourceMode = (options.middleMode || returnEmptyObject)(source, target[namespace]);
      Object.defineProperty(target, namespace, {
          value: (!isCorrect(sourceMode) ? returnEmptyObject() : sourceMode),
          writable: true,
          enumerable: true,
          configurable: true
      });
    }

    internalTarget = target[namespace];
  }
  catch(e){
    BindError('Namespace "' + String(namespace) + '" binding error.', e, options);
    return;
  }

  let internalOptions = Object.assign(returnEmptyObject(), options);
  delete internalOptions.silent;
  delete internalOptions.symbol;

  for(let internalNamespace of Reflect.ownKeys(source)){
    // Dynamic contextual and global blacklist check
    if(!internalOptions.raw && isReserved(source, internalNamespace, internalOptions)){ continue; }

    try {
      Object.defineProperty(internalTarget, internalNamespace, {
          value: (internalOptions.lowerMode ? internalOptions.lowerMode(source[internalNamespace], internalTarget[internalNamespace]) : source[internalNamespace]),
          writable: true,
          enumerable: true,
          configurable: true
      });
    }
    catch(e){
      BindError(('Namespaces: "' + String(namespace) + '" > "' + String(internalNamespace) + '" binding error: ' + e.message), e, internalOptions);
    }
  }
}

/**
 * Throws or logs a standardized error.
 * @param {string} message - The error message.
 * @param {Error|null} [e=null] - The original error object, if available.
 * @param {BindOptions} [options] - Configuration options.
 */
function BindError(message, e = null, options){
  if(options.silent || options.internalSilent){
    return console.error((e ? e.name + ' ' : '') + message);
  }

  let error = new Error(message);
  if(e){ error.name = e.name; }
  throw error;
}

/**
 * Checks if input is a function.
 * @param {any} input 
 * @returns {boolean}
 */
function isFn(input){
  return typeof input === 'function';
}

/**
 * Checks if input is a plain object (excludes arrays and null).
 * @param {any} input 
 * @returns {boolean}
 */
function isObject(input){
  return input && typeof input === 'object' && !Array.isArray(input);
}

/**
 * Checks if input is correct data type for binding.
 * @param {any} input 
 * @returns {boolean}
 */
function isCorrect(input){
  return isObject(input) || isFn(input);
}

/**
 * Factory function: creates a new completely empty object.
 * @returns {any}
 */
function returnEmptyObject(){
  return Object.create(null);
}

/**
 * Type identity function: returns the input type string (e.g., '[object Object]').
 * @private
 * @param {any} input 
 * @returns {string}
 */
function getType(input){
    return Object.prototype.toString.call(input);
}

/**
 * Reserved properties identity function: returns true if the property is blacklisted.
 * @param {any} source - The source being inspected.
 * @param {string|symbol} property - The property name.
 * @param {BindOptions} [options] - Configuration options.
 * @returns {boolean} - True if the property is reserved and should be ignored.
 */
function isReserved(source, property, options){
  // Check if symbols are restricted.
  if((options.symbol === false || options.internalSymbol === false) && typeof property === 'symbol'){ return true; }

  // Block global properties regardless of type
  if (GlobalReserved[property]){ return true; }

  // Block specific properties based on internal type
  let sourceType = getType(source);
  return Reserved[sourceType] ? !!Reserved[sourceType][property] : false;
}