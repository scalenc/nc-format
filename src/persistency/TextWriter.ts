export class TextWriter {
  text = '';

  write(text: string): TextWriter {
    this.text += text;
    return this;
  }
}
