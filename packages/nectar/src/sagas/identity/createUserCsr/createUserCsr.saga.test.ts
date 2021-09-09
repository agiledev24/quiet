import { expectSaga } from 'redux-saga-test-plan';

import { combineReducers } from '@reduxjs/toolkit';
import { call } from 'redux-saga-test-plan/matchers';
import { createUserCsr } from '@zbayapp/identity';

import { KeyObject } from 'crypto';
import { StoreKeys } from '../../store.keys';
import { createUserCsrSaga, initCryptoEngine } from './createUserCsr.saga';
import {
  CreateUserCsrPayload,
  identityActions,
  identityReducer,
  IdentityState,
} from '../identity.slice';

describe('createUserCsrSaga', () => {
  const userCsr = {
    userCsr: 'userCsr',
    userKey: 'userKey',
    pkcs10: {
      publicKey: jest.fn() as unknown as KeyObject,
      privateKey: jest.fn() as unknown as KeyObject,
      pkcs10: 'pkcs10',
    },
  };
  test.skip('create csr', async () => {
    const identityState = new IdentityState();
    await expectSaga(
      createUserCsrSaga,
      identityActions.createUserCsr(<CreateUserCsrPayload>{})
    )
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identityReducer,
        }),
        {
          [StoreKeys.Identity]: {
            ... new IdentityState(),
          },
        }
      )
      .provide([[call.fn(createUserCsr), userCsr]])
      .hasFinalState({
        [StoreKeys.Identity]: {
          ...identityState,
          userCsr,
        },
      })
      .run();
  });
  // TODO: Test no more adequate because crypto initialization will happen in app
  test.skip('set crypto engine and create csr', async () => {
    await expectSaga(
      createUserCsrSaga,
      identityActions.createUserCsr(<CreateUserCsrPayload>{})
    )
      .withReducer(
        combineReducers({
          [StoreKeys.Identity]: identityReducer,
        }),
        {
          [StoreKeys.Identity]: {
            ...new IdentityState(),
          },
        }
      )
      .provide([
        [call.fn(initCryptoEngine), null],
        [call.fn(createUserCsr), userCsr],
      ])
      .hasFinalState({
        [StoreKeys.Identity]: {
          ...new IdentityState(),
          userCsr,
        },
      })
      .run();
  });
});