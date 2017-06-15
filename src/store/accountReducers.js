import Immutable from 'immutable';
import { Wei, TokenUnits } from '../lib/types';
import { toNumber } from '../lib/convert';

const initial = Immutable.fromJS({
    accounts: [],
    accountPopup: {},
    trackedTransactions: [],
    loading: false,
    gasPrice: new Wei(23000000000),
    rates: {},
});

const initialAddr = Immutable.Map({
    id: null,
    balance: null,
    balancePending: null,
    tokens: [],
    txcount: null,
    name: null,
    description: null,
});

const initialTx = Immutable.Map({
    hash: null,
    blockNumber: null,
    timestamp: null,
    from: null,
    to: null,
    value: null,
    data: null,
    gas: null,
    gasPrice: null,
    nonce: null,
});

function addAccount(state, id, name, description) {
    return state.update('accounts', (accounts) =>
        accounts.push(initialAddr.merge({ id, name, description }))
    );
}

function updateAccount(state, id, f) {
    return state.update('accounts', (accounts) => {
        const pos = accounts.findKey((acc) => acc.get('id') === id);
        if (pos >= 0) {
            return accounts.update(pos, f);
        }
        return accounts;
    });
}

function updateToken(tokens, token, value) {
    const pos = tokens.findKey((tok) => tok.get('address') === token.address);
    const balance = new TokenUnits(value, (token.decimals) ? token.decimals : '0x0');
    if (pos >= 0) {
        return tokens.update(pos, (tok) => tok.set('balance', balance));
    }
    return tokens.push(Immutable.fromJS({ address: token.address, symbol: token.symbol })
            .set('balance', balance));
}

function onLoading(state, action) {
    switch (action.type) {
        case 'ACCOUNT/LOADING':
            return state
                .set('loading', true);
        default:
            return state;
    }
}

function onSetAccountsList(state, action) {
    switch (action.type) {
        case 'ACCOUNT/SET_LIST':
            return state
                .set('accounts', Immutable.fromJS(action.accounts.map((acc) =>
                            initialAddr.set('name', acc.name)
                                       .set('description', acc.description)
                                       .set('id', acc.address)
                        )
                    )
                )
                .set('loading', false);
        default:
            return state;
    }
}

function onSetBalance(state, action) {
    if (action.type === 'ACCOUNT/SET_BALANCE') {
        return updateAccount(state, action.accountId, (acc) =>
            acc.set('balance', new Wei(action.value))
                .set('balancePending', null)
        );
    }
    return state;
}

function onAccountPopup(state, action) {
    if (action.type === 'ACCOUNT/POPUP/OPEN') {
        state.set('accountPopup', action.account);
    } else {
        state.set('accountPopup', {});
    }
    return state;
}

function onSetTokenBalance(state, action) {
    if (action.type === 'ACCOUNT/SET_TOKEN_BALANCE') {
        return updateAccount(state, action.accountId, (acc) => {
            const tokens = Immutable.fromJS(acc.get('tokens'));
            return acc.set('tokens', updateToken(tokens, action.token, action.value));
        }
        );
    }
    return state;
}

function onSetTxCount(state, action) {
    if (action.type === 'ACCOUNT/SET_TXCOUNT') {
        return updateAccount(state, action.accountId, (acc) =>
            acc.set('txcount', toNumber(action.value))
        );
    }
    return state;
}

function onAddAccount(state, action) {
    if (action.type === 'ACCOUNT/ADD_ACCOUNT') {
        return addAccount(state, action.accountId, state.name, state.description);
    }
    return state;
}

function createTx(data) {
    let tx = initialTx.merge({
        hash: data.hash,
        from: data.from,
        to: data.to,
        gas: data.gas,
        gasPrice: data.gasPrice,
    });
    if (typeof data.value === 'string') {
        tx = tx.set('value', new Wei(data.value));
    }
    if (typeof data.gasPrice === 'string' || typeof data.gasPrice === 'number') {
        tx = tx.set('gasPrice', new Wei(data.gasPrice));
    }
    return tx;
}

function onPendingBalance(state, action) {
    if (action.type === 'ACCOUNT/PENDING_BALANCE') {
        let bal;
        if (action.to) {
            return updateAccount(state, action.to, (acc) => {
                bal = acc.get('balance').plus(new Wei(action.value));
                return acc.set('balancePending', bal);
            });
        } else if (action.from) {
            return updateAccount(state, action.from, (acc) => {
                bal = acc.get('balance').sub(new Wei(action.value));
                return acc.set('balancePending', bal);
            });
        }
    }
    return state;
}

function onLoadPending(state, action) {
    if (action.type === 'ACCOUNT/PENDING_TX') {
        const txes = [];
        for (let tx of action.txList) {
            txes.push(createTx(tx));
        }
        return state.set('trackedTransactions', Immutable.fromJS(txes));
    }
    return state;
}

function onTrackTx(state, action) {
    if (action.type === 'ACCOUNT/TRACK_TX') {
        const data = createTx(action.tx);
        return state.update('trackedTransactions', (txes) => txes.push(data));
    }
    return state;
}

function onUpdateTx(state, action) {
    if (action.type === 'ACCOUNT/UPDATE_TX') {
        return state.update('trackedTransactions', (txes) => {
            const pos = txes.findKey((tx) => tx.get('hash') === action.tx.hash);
            if (pos >= 0) {
                const data = createTx(action.tx);
                txes = txes.set(pos, data);
            }
            return txes;
        });
    }
    return state;
}

function onGasPrice(state, action) {
    if (action.type === 'ACCOUNT/GAS_PRICE') {
        return state.set('gasPrice', new Wei(action.value));
    }
    return state;
}

function onExchangeRates(state, action) {
    if (action.type === 'ACCOUNT/EXCHANGE_RATES') {
        return state.set('rates', Immutable.fromJS(action.rates));
    }
    return state;
}

export default function accountsReducers(state, action) {
    state = state || initial;
    state = onLoading(state, action);
    state = onSetAccountsList(state, action);
    state = onAddAccount(state, action);
    state = onSetBalance(state, action);
    state = onSetTxCount(state, action);
    state = onSetTokenBalance(state, action);
    state = onTrackTx(state, action);
    state = onUpdateTx(state, action);
    state = onGasPrice(state, action);
    state = onLoadPending(state, action);
    state = onPendingBalance(state, action);
    state = onExchangeRates(state, action);
    state = onAccountPopup(state, action);
    return state;
}
