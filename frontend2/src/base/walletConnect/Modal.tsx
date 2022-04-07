import React,{useState} from 'react';
import { useId, useBoolean } from '@uifabric/react-hooks';
import {
  Modal,
  getTheme,
  mergeStyleSets,
  FontWeights,
  IDragOptions,
  ContextualMenu,
  IconButton,
  IIconProps,
} from 'office-ui-fabric-react';
import WCLOGO from './../images/wcimage.svg';
import MMLOGO from './../images/metamask.png';

const dragOptions: IDragOptions = {
  moveMenuItemText: 'Move',
  closeMenuItemText: 'Close',
  menu: ContextualMenu,
};
const cancelIcon: IIconProps = { iconName: 'Cancel' };

export function ConnectModal (props: {
  showModal:()=>void,
  hideModal:()=>void,
  isModalOpen:boolean,
  metaMaskConnect:()=>void,
  connected:boolean
  walletConnect:()=>void
}){
  const [isDraggable, { toggle: toggleIsDraggable }] = useBoolean(false);
  const [selected,setSelected] = useState(false);
  const [wallet,setWallet] = useState('');

  // Use useId() to ensure that the IDs are unique on the page.
  // (It's also okay to use plain strings and manually ensure uniqueness.)
  const titleId = useId('title');


  return (
    <div>     
      <Modal
        titleAriaId={titleId}
        isOpen={props.isModalOpen}
        onDismiss={props.hideModal}
        isModeless={true}
        containerClassName={contentStyles.container}
        dragOptions={isDraggable ? dragOptions : undefined}
        styles={modalStyle}
      >
        <div className={contentStyles.header}>
          <span id={titleId}>Connect to a Wallet.</span>
          <IconButton
            styles={iconButtonStyles}
            iconProps={cancelIcon}
            ariaLabel="Close popup modal"
            onClick={props.hideModal}
          />
        </div>
        {
          !selected &&
          <>
            <div className={contentStyles.body} onClick={()=>props.metaMaskConnect()}>
              <span>
                  Connect Using MetaMask{' '}
              </span>
                <img src={MMLOGO} alt="Metamask" className={contentStyles.img}/>
            </div>
            <div className={contentStyles.body} onClick={()=>props.walletConnect()}>

              <span>
                Connect Using Wallet Connect{' '}
              </span>
                <img src={WCLOGO} alt="WalletConnect" className={contentStyles.img}/>
            </div>
          </>
        }
      </Modal>
    </div>
  );
};

const theme = getTheme();
const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',    
    minWidth: '30%',
    minHeight: '35%',
    borderRadius: '25px'
  },
  header: [
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      color: theme.palette.white,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '14px 14px 14px 24px',
    },
  ],
  body: {
    flex: '4 4 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px 24px 24px',
    cursor: 'pointer',
    overflowY: 'hidden',
    selectors: {
      span: { margin: '14px 0' },
      'p:first-child': { marginTop: 0 },
      'p:last-child': { marginBottom: 0 },
    },
  },
  img: {
    with: '30px',
    height: '30px',
  },
});
const toggleStyles = { root: { marginBottom: '20px' } };
const iconButtonStyles = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: theme.palette.neutralDark,
  },
};
const modalStyle = {
  root:{
  }
}