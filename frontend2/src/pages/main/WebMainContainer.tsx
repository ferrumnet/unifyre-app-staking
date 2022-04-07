import React, {useContext, useEffect} from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Page, Gap,
    // @ts-ignore
} from 'unifyre-web-components';
import { Main, MainDispatch, MainProps } from './Main';
import 'react-circular-progressbar/dist/styles.css';
import {ThemeContext} from 'unifyre-react-helper';
import {CategoryBtn} from "../../components/WebCategories";
import { StakingApp } from "../../common/Types";
import './web_main.scss';

function MainComponent(props: MainProps&MainDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    
    const history = useHistory();
    const {stakings, redirectToUrl} = props;
    useEffect(() => {
        if (redirectToUrl) {
            window.location.href = redirectToUrl;
        }
    }, [redirectToUrl])

    const headerH = props.headerHtml ? (
        <div dangerouslySetInnerHTML={ {__html: props.headerHtml} } ></div>
    ) : undefined;
    
    return (
        <Page>
            {headerH}
            <Gap size={'small'}/>
            {
                stakings.map((e:StakingApp, i: number) => 
                    <React.Fragment key={i}>
                        <CategoryBtn
                            key={i}
                            staking={e}
                            userAddress={props.userAddress}
                            onStakeNow={()=>props.onContractSelected(history, e, props.userAddress, props.groupId)}
                        />
                        <Gap />
                        <Gap />
                    </React.Fragment>)
            }
            <Gap/>
        </Page>
     
    );
}

//@ts-ignore
const themedStyles = (theme) => ({
   
});

export const MainContainer = connect(
  Main.mapStateToProps, Main.mapDispatchToProps)(MainComponent);