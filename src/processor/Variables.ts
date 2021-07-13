export class Variables {
  private alias: Record<string, string> = {};
  private values: Record<string, number> = {};

  constructor(public parent?: Variables) {}

  get ownKeys(): string[] {
    return Object.keys(this.values);
  }

  setAlias(name: string, target: string): void {
    this.alias[name.toUpperCase()] = target.toUpperCase();
  }

  tryGetNumber(name: string): number | undefined {
    name = this.getAliasName(name.toUpperCase());
    // eslint-disable-next-line security/detect-object-injection
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

  setNumber(name: string, value: number): void {
    name = this.getAliasName(name.toUpperCase());
    // eslint-disable-next-line security/detect-object-injection
    this.values[name] = value;
  }

  clearOwn(): void {
    this.values = {};
  }

  private getAliasName(name: string): string {
    if (this.parent) {
      name = this.parent.getAliasName(name);
    }
    // eslint-disable-next-line security/detect-object-injection
    return this.alias[name] ?? name;
  }
}
