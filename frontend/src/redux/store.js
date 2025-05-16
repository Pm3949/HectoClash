// redux/store.js
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import matchReducer from "./matchSlice";
import opponentReducer from "./opponenetSlice";
import userReducer from "./userSlice"; // assuming you have authUser in userSlice
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  match: matchReducer, // 👈 this key MUST be "match"
  user: userReducer,
  opponent: opponentReducer,

});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export default store;
