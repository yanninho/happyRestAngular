newTechnicalException : function(message) {
  function TechnicalException(message) {
    this.name = 'TechnicalException';
    this.message = message;
  }
  TechnicalException.prototype = new Error();
  TechnicalException.prototype.constructor = TechnicalException;     
  throw new TechnicalException(message);
}