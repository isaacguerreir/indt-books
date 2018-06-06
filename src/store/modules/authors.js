/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import axios from 'axios';
import { AUTHORS_REQUEST, AUTHORS_ERROR, AUTHORS_SUCCESS, ADD_AUTHOR, DELETE_AUTHOR, EDIT_AUTHOR } from '../actions/authors';

const state = { status: '', authors: [] };

const getters = {
  getAuthors: state => state.authors,
  getAuthorsSize: state => state.authors.length,
  authorsStatus: state => state.status,
};

const actions = {
  [AUTHORS_REQUEST]: ({ commit }) => new Promise((resolve, reject) => {
    axios.get('https://bibliapp.herokuapp.com/api/authors')
      .then((response) => {
        commit(AUTHORS_SUCCESS, response.data);
      })
      .catch((err) => {
        commit(AUTHORS_ERROR, err);
        reject(err);
      });
  }),
  [ADD_AUTHOR]: ({ commit, dispatch }, author) => new Promise((resolve, reject) => {
    axios.post('https://bibliapp.herokuapp.com/api/authors/', author)
      .then(() => {
        dispatch(AUTHORS_REQUEST);
      })
      .catch((err) => {
        commit(AUTHORS_ERROR, err);
        reject(err);
      });
  }),
  [DELETE_AUTHOR]: ({ commit, dispatch }, id) => new Promise((resolve, reject) => {
    axios.delete(`https://bibliapp.herokuapp.com/api/authors/${id}`)
      .then(() => {
        dispatch(AUTHORS_REQUEST);
      })
      .catch((err) => {
        commit(AUTHORS_ERROR, err);
        reject(err);
      });
  }),
  [EDIT_AUTHOR]: ({ commit, dispatch }, user) => new Promise((resolve, reject) => {
    const editUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.id,
    };
    axios.put(`https://bibliapp.herokuapp.com/api/authors/${user.id}`, editUser)
      .then(() => {
        dispatch(AUTHORS_REQUEST);
      })
      .catch((err) => {
        commit(AUTHORS_ERROR, err);
        reject(err);
      });
  }),
};

const mutations = {
  [AUTHORS_REQUEST]: (state) => {
    state.status = 'loading';
  },
  [AUTHORS_SUCCESS]: (state, resp) => {
    state.status = 'success';
    state.authors = resp;
  },
  [AUTHORS_ERROR]: (state) => {
    state.status = 'error';
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
