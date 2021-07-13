export class Variables {
  private alias: Record<string, string> = {};
  private values: Record<string, number> = {};

  constructor(public parent?: Variables) {}

  get ownKeys(): string[] {
    return Object.keys(this.values);
  }

  setAlias(name: string, target: string) {
    this.alias[name.toUpperCase()] = target.toUpperCase();
  }

  tryGetNumber(name: string): number | undefined {
    name = this.getAliasName(name.toUpperCase());
    return this.values[name] ?? this.parent?.tryGetNumber(name);
  }

  hasOwnNumber(name: string): boolean {
    name = this.getAliasName(name.toUpperCase());
    return Object.keys(this.values).includes(name);
  }

  hasNumber(name: string): boolean {
    return (this.hasOwnNumber(name) || this.parent?.hasNumber(name)) ?? false;
  }

  getNumberOrDefault(name: string): number {
    return this.tryGetNumber(name) ?? 0.0;
  }

  setNumber(name: string, value: number) {
    name = this.getAliasName(name.toUpperCase());
    this.values[name] = value;
  }

  clearOwn() {
    this.values = {};
  }

  private getAliasName(name: string): string {
    if (this.parent) {
      name = this.parent.getAliasName(name);
    }
    return this.alias[name] ?? name;
  }
}
