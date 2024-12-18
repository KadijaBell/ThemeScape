import { csrfFetch } from './csrf';

// Action Types
const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

// Action Creators
const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER,
});

// Thunk Action Creator for Logging In
export const login = (user) => async (dispatch) => {
    const { credential, password } = user;
    const response = await csrfFetch("/api/session", {
      method: "POST",
      body: JSON.stringify({ credential, password })

    });
    if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
    }
  };



// Thunk Action Creator for Logging Out (Optional)
export const logout = () => async (dispatch) => {
  await csrfFetch('/api/session', {
    method: 'DELETE',
  });
  dispatch(removeUser());
};

// Thunk Action for Restoring Session User
export const restoreUser = () => async (dispatch) => {
    const response = await csrfFetch("/api/session");
    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
  };

// Reducer
const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
};

export const signUp = (user) => async (dispatch) => {
    const { username, firstName, lastName, email, password } = user;
    const response = await csrfFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        username,
        firstName,
        lastName,
        email,
        password
      }),
    });

    const data = await response.json();

    if (response.ok) {
      dispatch(setUser(data.user));
      return data;
    } else {
      return data;
    }
  };

export default sessionReducer;
