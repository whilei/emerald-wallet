import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import { translate } from 'react-i18next';
import IconButton from 'material-ui/IconButton';
import Face from 'material-ui/svg-icons/action/face';
import ImportContacts from 'material-ui/svg-icons/communication/import-contacts';
import LibraryBooks from 'material-ui/svg-icons/av/library-books';
import Motorcycle from 'material-ui/svg-icons/action/motorcycle';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import { Networks } from 'lib/networks';
import log from 'loglevel';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { gotoScreen } from 'store/screenActions';
import { useRpc, saveSettings } from 'store/launcherActions'

const Render = translate('common')(({ t, openAccounts, openAddressBook, openContracts, switchChain, chain, rpcType }) => (
    <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
        <MenuItem leftIcon={<Face />} primaryText={t('menu.home')} onClick={openAccounts} />
        {/* #hidden#146 <MenuItem leftIcon={<ImportContacts />} primaryText={t('menu.addressBook')} onClick={openAddressBook} /> */}
        {/* #hidden#146 <MenuItem leftIcon={<LibraryBooks />} primaryText={t('menu.contracts')} onClick={openContracts} /> */}
        <MenuItem
            leftIcon={<Motorcycle />}
            primaryText={t('menu.network')}
            rightIcon={<ArrowDropRight />}
            menuItems=
                {Networks.map((net) =>
                    <MenuItem
                        key={net.id}
                        primaryText={net.title}
                        checked={(net.name === chain && net.type === rpcType)}
                        onClick={() => (net.id !== chain.id) && switchChain(net)}
                    />
                )}

        />
    </IconMenu>
));

Render.propTypes = {
    chain: PropTypes.string.isRequired,
    rpcType: PropTypes.string.isRequired,
    openAccounts: PropTypes.func.isRequired,
    openAddressBook: PropTypes.func.isRequired,
    openContracts: PropTypes.func.isRequired,
    switchChain: PropTypes.func.isRequired,
};

const Navigation = connect(
    (state, ownProps) => ({
        chain: state.network.get('chain') || {},
        rpcType: state.launcher.getIn(['chain', 'rpc'])
    }),
    (dispatch, ownProps) => ({
        openAccounts: () => {
            log.info('accounts');
            dispatch(gotoScreen('home'));
        },
        openAddressBook: () => {
            log.info('address book');
            dispatch(gotoScreen('address-book'));
        },
        openContracts: () => {
            log.info('contracts');
            dispatch(gotoScreen('contracts'));
        },
        switchChain: (network) => {
            dispatch(useRpc(network.type));
            dispatch(saveSettings({chain: network.name, chainId: network.chainId}));
        }
    })
)(Render);

export default Navigation;
