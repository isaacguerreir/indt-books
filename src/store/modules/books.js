/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import axios from 'axios';
import { BOOKS_REQUEST, BOOKS_ERROR, BOOKS_SUCCESS, DELETE_BOOK, ADD_BOOK } from '../actions/books';

const state = { status: '', books: [] };

const getters = {
  getBooks: state => state.books,
  getBooksSize: state => state.books.length,
  booksStatus: state => state.status,
};

const actions = {
  [BOOKS_REQUEST]: ({ commit }) => new Promise((resolve, reject) => {
    axios.get('https://bibliapp.herokuapp.com/api/books')
      .then((response) => {
        commit(BOOKS_SUCCESS, response.data);
      })
      .catch((err) => {
        commit(BOOKS_ERROR, err);
        reject(err);
      });
  }),
  [DELETE_BOOK]: ({ commit, dispatch }, id) => new Promise((resolve, reject) => {
    axios.delete(`https://bibliapp.herokuapp.com/api/books/${id}`)
      .then(() => {
        dispatch(BOOKS_REQUEST);
      })
      .catch((err) => {
        commit(BOOKS_ERROR, err);
        reject(err);
      });
  }),
  [ADD_BOOK]: ({ commit, dispatch }, book) => new Promise((resolve, reject) => {
    axios.post('https://bibliapp.herokuapp.com/api/books', book)
      .then(() => {
        dispatch(BOOKS_REQUEST);
      })
      .catch((err) => {
        commit(BOOKS_ERROR, err);
        reject(err);
      });
  }),
};

const mutations = {
  [BOOKS_REQUEST]: (state) => {
    state.status = 'loading';
  },
  [BOOKS_SUCCESS]: (state, resp) => {
    state.status = 'success';
    state.books = resp;
  },
  [BOOKS_ERROR]: (state) => {
    state.status = 'error';
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
