function InputBox (input, textBox, onSubmit) {
    this.input = input;
    this.charBuffer = "";
    this.onSubmit = onSubmit;
    this.textBox = textBox;
    this.required = true;
    this.cursorBlinkState = true;
    this.cursorIndex = 0;
    this.selectionIndex = null;
}

InputBox.prototype = {
    _updateShownText: function() {
        let showText = this.masked ? this.maskBuffer() : this.charBuffer;
        this.textBox.clear();
        let textTiles = this.textBox.addText(showText);
        if (this.selectionIndex !== null) {
            const fromIndex = Math.min(this.selectionIndex, this.cursorIndex);
            const toIndex = Math.max(this.selectionIndex, this.cursorIndex);
            for (var i = fromIndex; i < toIndex; i++) {
                const tile = textTiles[i];
                let // Swap foreground and background to indicate selected text
                tmp = tile.r; tile.r = tile.br; tile.br = tmp;
                tmp = tile.g; tile.g = tile.bg; tile.bg = tmp;
                tmp = tile.b; tile.b = tile.bb; tile.bb = tmp;
            }
        }
        // Always add a reserved space at the end for the cursor, which ensures
        // getRemainingSpace is accurate for e.g. pasting. Also, with the way
        // the textbox handles wrapping, it's better to add this here separately. 
        textTiles.push(this.textBox.addText(' ')[0]);
        if (this.cursorBlinkState) {
            const tile = textTiles[this.cursorIndex];
            tile.r = tile.g = tile.b = 0;
            tile.br = tile.bg = tile.bb = 255;
        }
		this.textBox.draw();
		this.textBox.term.render();
    },
    submit: function (){
        if (this.required && this.charBuffer.trim() == "") {
            return;
        }
        this.onSubmit(this.charBuffer);
        if (this.clearOnSent) {
            this.charBuffer = "";
        }
        this._updateShownText();
    },
    cancelMessage: function (){
        this.charBuffer = "";
        this._updateShownText();
    },
    draw: function () {
        this.textBox.draw();
    },
    setActive: function (state) {
        if (state) {
            if (this.input.activeInputBox && this.input.activeInputBox.active) {
                this.input.activeInputBox.setActive(false);
            }
            this.input.activeInputBox = this;
        }
        this.active = state;
        this.setCursorIndex(this.charBuffer.length);
        this.setCursorBlinkState(state);
    },
    maskBuffer: function () {
        let ret = "";
        for (let i = 0; i < this.charBuffer.length; i++) {
            ret += "*";
        }
        return ret;
    },
    // Returns true if the caller should consume the key-press event
    applyKey: function (key, metaDown, ctrlDown, altDown, shiftDown){
        this.setCursorBlinkState(true); // Reset the cursor blink

        if (key === 'Enter') {
            this.submit();
            return true;
        }
        if (key === 'Backspace') {
            if (this.selectionIndex === null && this.cursorIndex > 0){
                this.setSelection(this.cursorIndex - 1, this.cursorIndex);
            }
            this.deleteSelection();
            return true;
        }
        if (key === 'Delete') {
            if (this.selectionIndex === null && this.cursorIndex < this.charBuffer.length){
                this.setSelection(this.cursorIndex, this.cursorIndex + 1);
            }
            this.deleteSelection();
            return true;
        }
        // Note copy, paste etc needs to be handled by document events for
        // security reasons (can't have unfettered access to the clipboard).
        if ((metaDown || ctrlDown) && !altDown && !shiftDown && key === 'a'){
            this.selectAll();
            return true;
        }

        // Determine the x,y position of the cursor inside the text box for
        // some relative movements like arrow up/down.
        let cursorx = 0;
        let cursory = 0;
        for (; cursory < this.textBox.lines.length; cursory++){
            const lineCharCount = this.textBox.lines[cursory].length;
            if (cursorx + lineCharCount > this.cursorIndex){
                cursorx = this.cursorIndex - cursorx;
                break;
            }
            cursorx += lineCharCount;
        }

        const oldCursorIndex = this.cursorIndex;
        const oldselectionIndex = this.selectionIndex;
        let isCursorMoveKey = true;
        if (key == 'Home') this.setCursorIndex(this.cursorIndex - cursorx);
        else if (key == 'End') this.setCursorIndex(this.cursorIndex - cursorx + this.textBox.lines[cursory].length + (cursory == this.textBox.lines.length - 1 ? 0 : -1));
        else if (key == 'PageUp') this.setCursorIndex(0);
        else if (key == 'PageDown') this.setCursorIndex(this.charBuffer.length);
        else if (key == 'ArrowLeft') this.setCursorIndex(Math.max(0, this.cursorIndex - 1));
        else if (key == 'ArrowRight') this.setCursorIndex(Math.min(this.charBuffer.length, this.cursorIndex + 1));
        else if (key == 'ArrowUp'){
            if (cursory > 0) {
                const prevLineLength = this.textBox.lines[cursory - 1].length;
                this.setCursorIndex(this.cursorIndex - cursorx - prevLineLength + Math.min(cursorx, prevLineLength - 1));
            }
        } else if (key == 'ArrowDown'){
            if (cursory < this.textBox.lines.length - 1) {
                const cursorLineLength = this.textBox.lines[cursory].length;
                const nextLineLength = this.textBox.lines[cursory + 1].length + (cursory + 1 == this.textBox.lines.length - 1 ? 0 : -1);
                this.setCursorIndex(this.cursorIndex - cursorx + cursorLineLength + Math.min(cursorx, nextLineLength));
            }
        } else {
            isCursorMoveKey = false;
        }
        if (isCursorMoveKey) {
            if (!shiftDown || this.selectionIndex === this.cursorIndex) this.clearSelection();
            else if (oldselectionIndex === null) this.setSelectionIndex(oldCursorIndex);
            return true;
        }

        // If any of the modifier keys are down (except for shift), then
        // assume the user is trying to doing some action, not typing.
        if (!this.textBox.isFull() && key.length === 1 && !metaDown && !ctrlDown && !altDown) {
            this.addText(key);
            return true;
        }
        return false;
    },
    setCursorIndex: function(cursorIndex){
        cursorIndex = Math.max(0, Math.min(cursorIndex, this.charBuffer.length));
        this.cursorIndex = cursorIndex;
        // Note, clearSelection calls _updateShownText
        if (this.selectionIndex === cursorIndex) this.clearSelection();
        else this._updateShownText();
    },
    setCursorBlinkState: function(state) {
        this.cursorBlinkState = state;
        if (this.cursorBlinkTimeout) {
            clearTimeout(this.cursorBlinkTimeout);
        }
        if (this.active) {
            this.cursorBlinkTimeout = setTimeout(() => this.setCursorBlinkState(!state), 600);
        }
        this._updateShownText();
    },
    setSelection: function(startIndex, endIndex) {
        startIndex = Math.max(0, Math.min(this.charBuffer.length, startIndex));
        endIndex = Math.max(0, Math.min(this.charBuffer.length, endIndex));
        if (endIndex === startIndex) {
            this.clearSelection();
            return;
        }
        if (endIndex < startIndex) {
            const temp = endIndex;
            endIndex = startIndex;
            startIndex = temp;
        }
        this.setCursorIndex(endIndex);
        this.setSelectionIndex(startIndex);
    },
    setSelectionIndex: function(selectionIndex) {
        if (!Number.isInteger(selectionIndex)) {
            selectionIndex = null;
        } else {
            selectionIndex = Math.max(0, Math.min(this.charBuffer.length, selectionIndex));
            if (selectionIndex === this.cursorIndex){
                // There are no characters between the selIdx and curIdx if they're equal,
                // so unset the selection.
                selectionIndex = null;
            }
        }
        this.selectionIndex = selectionIndex;
        this._updateShownText();
    },
    addText: function(text) {
        this.deleteSelection();
        if (this.textBox.isFull()) return;
        // Clean text of non printable and non ascii characters, i.e outside range
        // space(32) to tilde(126)
        text.replace(/[^ -~]/g, '');
        // TODO this is still a bit wonky, because an unknown portion of remaining
        // space may be used for graceful wrapping of the text. May have to just
        // blindly add it in, then pare it back if it's overgrown.
        if (text.length > this.textBox.getRemainingSpace()) {
            text = text.substr(0, this.textBox.getRemainingSpace());
        }
        if (text.length === 0) return;

        const oldText = this.charBuffer;
        const left = this.cursorIndex > 0 ? oldText.substring(0, this.cursorIndex) : "";
        const right = this.cursorIndex < oldText.length ? oldText.substring(this.cursorIndex, oldText.length) : "";
        const newText = left + text + right;
        if (newText === oldText) return;

        this.clearSelection();
        this.charBuffer = newText;
        this.setCursorIndex(this.cursorIndex + text.length);
    },
    deleteSelection: function() {
        if (this.selectionIndex === null) return undefined;

        const from = Math.min(this.cursorIndex, this.selectionIndex);
        const to = Math.max(this.cursorIndex, this.selectionIndex);
        const oldSelection = this.clearSelection();

        const oldText = this.charBuffer;
        let newText = from === 0 ? '' : oldText.substring(0, from);
        if (to < oldText.length) {
            newText += oldText.substring(to, oldText.length);
        }

        this.clearSelection();
        this.charBuffer = newText;
        this.setCursorIndex(from);
        return oldSelection;
    },
    selectAll: function() {
        this.setSelection(0, this.charBuffer.length);
    },
    clearSelection: function() {
        const oldSelection = this.getSelection();
        this.setSelectionIndex(null);
        return oldSelection;
    },
    getSelection: function() {
        if (this.selectionIndex === null) return undefined;
        const fromIndex = Math.min(this.selectionIndex, this.cursorIndex);
        const toIndex = Math.max(this.selectionIndex, this.cursorIndex);
        return this.charBuffer.substring(fromIndex, toIndex);
    }
}

module.exports = InputBox;