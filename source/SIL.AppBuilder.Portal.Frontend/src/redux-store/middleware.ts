import { Middleware, Store } from 'redux';
import createSagaMiddleWare from 'redux-saga';

import { sagas } from './sagas';

const sagaMiddleware = createSagaMiddleWare();

export const setup = (store: Store<any>) => {
  sagaMiddleware.run(sagas);
};

export const middleware: Middleware[] = [sagaMiddleware];
