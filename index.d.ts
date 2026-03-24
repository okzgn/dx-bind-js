export type BindingTypes = Record<string, any>;

export function Registry(objectToBind: BindingTypes): void;

export function Bind(
  target: any, 
  mode?: string[] | Function | null, 
  fallbackMode?: Function | null
): any;