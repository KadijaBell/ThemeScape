import { csrfFetch } from './csrf';

// Action Types
const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

// Action Creators
const setUser = (user) => ({
  type: SET_USER,
  user,
});

const removeUser = () => ({
  type: REMOVE_USER,
});

// Thunk Action Creator for Logging In
export const login = (credential, password) => async (dispatch) => {
  const response = await csrfFetch('/api/session', {
    method: 'POST',
    body: JSON.stringify({ credential, password }),
  });

  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

// Thunk Action Creator for Logging Out (Optional)
export const logout = () => async (dispatch) => {
  await csrfFetch('/api/session', {
    method: 'DELETE',
  });
  dispatch(removeUser());
};

// Reducer
const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.user };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
};

export default sessionReducer;
