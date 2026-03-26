export type BindingTypes = Record<string|symbol, any>;

export interface BindOptions {
  namespaces?: (string | symbol)[];
  upperMode?: (reference: any, globalReference:BindingTypes) => any;
  middleMode?: (reference: any, previousReference:any) => any;
  lowerMode?: (reference: any, previousReference:any) => any;
  silent?: boolean;
  internalSilent?: boolean;
  symbol?: boolean;
  internalSymbol?: boolean;
  raw?: boolean;
}

export function Registry(objectToBind: BindingTypes, options?: BindOptions): BindingTypes;

export function SetRegistry(objectToBind: BindingTypes, options?: BindOptions): BindingTypes;

export function EmptyRegistry(): void;

export function Bind(
  target: any, 
  options?: BindOptions
): any;