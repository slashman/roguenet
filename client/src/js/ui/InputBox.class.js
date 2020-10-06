function InputBox (textBox, onSubmit) {
    this.charBuffer = "";
    this.onSubmit = onSubmit;
    this.textBox = textBox;
}

InputBox.prototype = {
    _updateShownText: function() {
        this.textBox.setText(this.charBuffer);
		this.textBox.draw();
		this.textBox.term.render();
    },
    submit: function (){
        this.onSubmit(this.charBuffer);
        this.charBuffer = "";
        this._updateShownText();
    },
    cancelMessage: function (){
        this.charBuffer = "";
        this._updateShownText();
    },
    removeCharacter: function () {
        this.charBuffer = this.charBuffer.slice(0, -1);
        this._updateShownText();
    },
    addCharacter: function (char) {
        this.charBuffer += char;
        this._updateShownText();
    }
}

module.exports = InputBox;