import $ from 'jquery';
window.$ = $;

class SudokuCell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.selected = false;
        this.value = 0;
        this.suggested = true;
        this.view = null;
        this.initSuggestions();
        let ri = Math.floor(row / 3);
        let ci = Math.floor(col / 3);
        this.block = (ri * 3) + ci;
    }
    row = 0;
    col = 0;
    block = 0;
    selected = false;
    value = 0;
    suggestions = [];
    view = null;
    suggested = true;
    setView(cell) {
        this.view = cell;
        return this;
    }
    updateBackground() {
        if (this.selected) {
            if (!this.view.hasClass('selected')) {
                this.view.addClass('selected');
            }
        } else {
            this.view.removeClass('selected');
        }
        return this;
    }
    reset() {
        this.value = 0;
        this.suggested = true;
        this.initSuggestions();
        this.view.removeClass('suggested');
        this.updateView();
        return this;
    }
    setValue(value) {
        this.value = value;
        this.suggested = value == 0;
        return this;
    }
    toggle() {
        this.selected = !this.selected;
        return this;
    }
    initSuggestions() {
        this.suggestions = [];
        for (let i = 1; i < 10; i++) {
            this.suggestions.push(i);
        }
        return this;
    }
    updateSuggestions() {
        if (this.value != 0) {
            this.suggestions = [];
        }
        return this;
    }
    removeSuggestion(avalue) {
        if (this.suggestions.length == 0) {
            return this;
        }
        let index = this.suggestions.indexOf(avalue);
        if (index < 0) return this;
        this.suggestions.splice(index, 1);
        if (this.suggestions.length == 1) {
            this.value = this.suggestions[0];
            this.view.empty();
            this.updateSuggestions().updateView();
        }
        return this;
    }
    updateView() {
        if (this.value != 0) {
            this.view.html(this.value);
            if (this.suggested) {
                if (!this.view.hasClass('suggested')) {
                    this.view.addClass('suggested');
                }
            }
            return this;
        }
        this.view.html('');
        return this;
    }
    showSuggestions() {
        this.view.empty();
        if (this.suggestions.length == 0) {
            this.view.html(this.value);
            return this;
        }
        // if (this.suggestions.length == 1) {
        //     this.view.empty();
        //     this.value = this.suggestions[0];
        //     this.view.html(this.value);
        //     this.suggestions = [];
        //     return this;
        // }
        // create cell-container
        let container = $('<div>');
        container.addClass('board-cell-container');
        // create cell-row-container
        let row = $('<div>');
        row.addClass('board-cell-row');
        for (let i = 1; i < 10; i++) {
            if (i % 3 == 1) {
                row = $('<div>');
                row.addClass('board-cell-row');
                container.append(row);
            }
            let cell = $('<div>');
            cell.addClass('board-cell-cell');
            cell.html('');
            if (this.suggestions.indexOf(i) >= 0) {
                cell.html(i);
            }
            row.append(cell);
        }
        this.view.append(container);
        return this;
    }
}


export default {
    items: [],
    selectedItem: null,
    suggestionMode: false,
    toggleSugesstion: function () {
        this.suggestionMode = !this.suggestionMode;
    },
    resetItem: function () {
        this.items.forEach(item => {
            item.reset();
        });
        return this;
    },
    renderToolbar: function () {
        let self = this;
        let bar = $('<div>', {
            id: 'toolbar-angka'
        });
        bar.addClass('toolbar');
        for (let i = 1; i < 10; i++) {
            let tombol = $('<button>');
            tombol.html(i);
            tombol.click(function (e) {
                if (!self.selectedItem) {
                    return;
                }
                self.selectedItem.reset().setValue(parseInt(tombol.html())).updateView();
            });
            bar.append(tombol);
        }

        // button show candidates
        let btnShowCandidates = $('<button>');
        btnShowCandidates.html('Show Candidates');
        btnShowCandidates.click(function (e) {
            self.updateSuggestions().showSuggestions();
        });
        bar.append(btnShowCandidates);

        // button log
        let btnLog = $('<button>');
        btnLog.html('Eliminate Candidates');
        btnLog.click(function (e) {
            self.updateSuggestions().showItems();
        });
        bar.append(btnLog);

        // button clear item
        let btnClear = $('<button>');
        btnClear.html('Clear');
        btnClear.click(function (e) {
            if (!self.selectedItem) return;
            self.selectedItem.reset();
        });
        bar.append(btnClear);

        // button log
        let btnSolve = $('<button>');
        btnSolve.html('Solve');
        btnSolve.click(function (e) {
            // self.updateSuggestions().showItems();
            console.log('Start backtracking');
            if (self.backtrack()) {
                self.items.forEach(item => {
                    item.updateView();
                });
                console.log('Success backtracking');
                console.table(self.items);

            } else {
                console.log('Failed backtracking');
            }
        });
        bar.append(btnSolve);

        // button test
        let btnTest = $('<button>');
        btnTest.html('Test Data');
        btnTest.click(function (e) {
            self.testData();
        });
        bar.append(btnTest);

        // button clear item
        let btnReset = $('<button>');
        btnReset.html('Reset');
        btnReset.click(function (e) {
            self.items.forEach(item => {
                item.reset();
            });
        });
        bar.append(btnReset);

        $("#app").append(bar);
        return this;
    },
    renderBoard: function () {
        let self = this;
        let board = $('<div>', {
            id: 'sudoku-board'
        });
        board.addClass('board');
        let index = 0;
        for (let i = 0; i < 9; i++) {
            let row = $('<div>');
            row.addClass('board-row');
            for (let j = 0; j < 9; j++) {
                let cell = $('<div>', {
                    id: 'cell-' + i + '-' + j,
                });
                cell.addClass('board-cell');
                if (i % 3 == 0) {
                    cell.addClass('block-ver');
                }
                if (i == 8) {
                    cell.addClass('block-bottom');
                }
                if (j % 3 == 0) {
                    cell.addClass('block-hor');
                }
                if (j == 8) {
                    cell.addClass('block-right');
                }
                let sCell = new SudokuCell(i, j);
                cell.click(function (e) {
                    if (self.selectedItem && !(self.selectedItem.row == sCell.row && self.selectedItem.col == sCell.col)) {
                        self.selectedItem.toggle().updateBackground();
                    }
                    self.selectedItem = null;
                    sCell.toggle().updateBackground();
                    if (sCell.selected) {
                        self.selectedItem = sCell;
                    }

                });
                sCell.setView(cell);
                sCell.updateView();
                this.items.push(sCell);
                row.append(sCell.view);
                index++;
            }
            board.append(row);
        }
        $("#app").append(board);
        return this;
    },
    /**
     * 
     * @param SudokuCell cell 
     */
    updateSuggestion: function (cell) {
        this.items.forEach(item => {
            if (item.value > 0) return;
            if (item.row == cell.row && item.col == cell.col) return;
            if (item.row == cell.row || item.col == cell.col) {
                item.removeSuggestion(cell.value);
            }
            if (item.block == cell.block) {
                item.removeSuggestion(cell.value);
            }
        });
    },
    updateSuggestions: function () {
        let self = this;
        this.items.forEach(cell => {
            self.updateSuggestion(cell);
        });
        return this;
    },
    showItems: function () {
        this.items.forEach(element => {
            console.log(element.suggestions);
        });
        return this;
    },
    showSuggestions: function () {
        this.items.forEach(element => {
            element.showSuggestions();
        });
        return this;
    },
    testData: function () {
        let testValue = [7, 6, 0, 0, 0, 5, 0, 4, 3, 0, 0, 3, 0, 9, 0, 0, 0, 0, 4, 2, 0, 0, 0, 0, 9, 7, 0, 6, 0, 0, 0, 0, 1, 0, 8, 4, 0, 0, 0, 0, 0, 0, 0, 6, 9, 3, 7, 8, 4, 0, 0, 0, 0, 1, 9, 0, 0, 0, 2, 8, 1, 3, 0, 0, 0, 0, 1, 4, 6, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 5, 0];
        for (let i = 0; i < testValue.length; i++) {
            this.items[i].reset().setValue(testValue[i]).updateSuggestions().updateView();
        }
    },
    findEmpty: function () {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].value == 0) {
                return this.items[i];
            }
        }
        return null;
    },
    isConflict: function (cell, value) {
        for (let i = 0; i < this.items.length; i++) {
            if ((this.items[i].row == cell.row && this.items[i].col == cell.col) || this.items[i].value == 0) {
                continue;
            }
            if ((this.items[i].row == cell.row || this.items[i].col == cell.col || this.items[i].block == cell.block) && this.items[i].value == value) return true;


        }
        return false;
    },
    backtrack: function () {
        let cell = this.findEmpty();
        if (cell == null) return true;
        for (let idx = 0; idx < cell.suggestions.length; idx++) {
            let value = cell.suggestions[idx];
            if (!this.isConflict(cell, value)) {
                cell.value = value;
                if (this.backtrack()) {
                    return true;
                }
                cell.value = 0;
            }
        }
        return false;
    },
}