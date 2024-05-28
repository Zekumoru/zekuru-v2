export class TranslatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NoTranslatorError extends TranslatorError {
  translatorType: string;

  constructor(translatorType: string) {
    super(
      `The provided translator type '${translatorType}' is not currently supported or is not implemented yet.`
    );
    this.translatorType = translatorType;
  }
}

export class LanguageError extends TranslatorError {}

export class TranslationError extends TranslatorError {}

export class AuthorizationError extends TranslatorError {}
