import _ from 'lodash';
import './style.css';
import $ from 'jquery';
import sudoku from './sudoku';

window.$ = $;
sudoku.renderToolbar()
  .renderBoard();

