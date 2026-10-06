export class LinkAlreadyExistsError extends Error {
  constructor() {
    super('Essa URL encurtada já existe.')
  }
}
