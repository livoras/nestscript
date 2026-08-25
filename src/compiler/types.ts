/** Binding kinds tracked while lowering JavaScript lexical scopes. */
export const enum VariableType {
  NO_EXIST = -1,
  FUNCTION = 1,
  VARIABLE = 2,
  CLOSURE = 3,
  ARGUMENTS = 4,
}
