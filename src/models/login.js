import { routerRedux } from 'dva/router';
import { accountLogin } from '../services/api';
import { setAuthority, setToken } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

export default {
    namespace: 'login',

    state: {
        status: undefined,
    },

    effects: {
        *login({ payload }, { call, put }) {
            const response = yield call(accountLogin, payload);
            yield put({
                type: 'setToken',
                payload: response,
            });
            // yield put({
            //   type: 'changeLoginStatus',
            //   payload: response,
            // });
            // Login successfully
            if (response.status === 200) {
                // reloadAuthorized();
                yield put(routerRedux.push('/'));
            }
        },
        *logout(_, { put, select }) {
            try {
                // get location pathname
                const urlParams = new URL(window.location.href);
                const pathname = yield select(state => state.routing.location.pathname);
                // add the parameters in the url
                urlParams.searchParams.set('redirect', pathname);
                window.history.replaceState(null, 'login', urlParams.href);
            } finally {
                yield put({
                    type: 'changeLoginStatus',
                    payload: {
                        status: false,
                        currentAuthority: 'guest',
                    },
                });
                reloadAuthorized();
                yield put(routerRedux.push('/user/login'));
            }
        },
    },

    reducers: {
        changeLoginStatus(state, { payload }) {
            setAuthority(payload.user.type);
            setToken(payload.token);
            return {
                ...state,
                status: payload.status,
                type: payload.type,
            };
        },

        setToken(state, { payload }) {
            setToken(payload.token);

            return {
                ...state,
                status: payload.status,
                token: payload.token,
            };
        },
    },
};
