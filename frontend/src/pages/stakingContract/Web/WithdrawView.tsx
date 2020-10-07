import React from 'react';
import { useHistory } from 'react-router-dom';
import { StakingContract, StakingContractDispatch, StakingContractProps } from '../StakingContract';
import './staking.scss';
import {List} from '../../../components/list';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { Header,Divider,Button} from '@fluentui/react-northstar';
import { Flex } from '@fluentui/react-northstar';
import { CallVideoIcon } from '@fluentui/react-icons-northstar';
import { dataFormat, Utils } from "../../../common/Utils";
import { buildStyles,CircularProgressbarWithChildren} from 'react-circular-progressbar';

export function WithdrawView (props: StakingContractProps&StakingContractDispatch) {
    const history = useHistory();

    const fields = [
       
        {
            value: 'You Have Staked',
            label: `${props.userStake?.amountInStake} ${props.symbol}`
        },
        {
            value: 'Rewards if un-staked today',
            label: props.unstakeRewardsNow
        },
        {
            value: 'Rewards at maturity',
            label: props.unstakeRewardsMaturity
        },
        {
            value: 'Early withdraw starts',
            label: dataFormat(props.contract.withdrawStarts)
        },
        {
            value: 'Maturity',
            label: dataFormat(props.contract.withdrawEnds)
        }
            
    ]
    const [tillMon, tillDay, tillHour] = Utils.tillDate(props.contract.withdrawEnds);
      
    return (
        <div className="withdraw_Container">
            <div className="main_address">
                    <>
                        <Header as="h2" content="PLATINUM" />
                        <Header as="h4" content="STAKING POOL" color='red' />
                        <div className="details_header">
                            <Divider fitted size={3} color='red' />
                        </div>
                    </>
                <div className="address_container">
                    <input value={props.userStake?.userAddress} />
                    <Gap/>
                    <div className="space"></div>
                    <input value={props.userStake?.userAddress} />
                </div>
                <Button 
                    className="btn" 
                    content="Un stake" 
                    iconPosition="before"
                    primary 
                    disabled={props.state !== 'withdraw' && props.state !== 'maturity'}
                    onClick={() => props.onContractSelected(history,props.contract.contractAddress,true)}
                />

            </div>
            <div className="details">              
                <div className="details_card">
                    <div className="details_card__side  details_card__side__front">
                        <Gap/>
                        <div className="mini_header">
                            <Header as="h4" content="DETAILS" color='red' />
                            <div className="details_header">
                                <Divider fitted size={3} color='red' />
                            </div>
                        </div>
                        <Gap/>
                        {
                            fields.map((e, i)=>
                                <List key={i} value={e.value} label={e.label}/>
                            )
                        }
                    </div>
                    <div className="details_card__side details_card__side__back">
                        <div className="graph">
                                <CircularProgressbarWithChildren
                                strokeWidth = {4}
                                styles={buildStyles({
                                    // Rotation of path and trail, in number of turns (0-1)
                                    rotation: 2.25,
                                
                                    // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                                    strokeLinecap: 'butt',

                                
                                    // Text size
                                    textSize: '10px',
                            
                                    // How long animation takes to go from one percentage to another, in seconds
                                    pathTransitionDuration: 1,
                                
                                    // Can specify path transition in more detail, or remove it entirely
                                    // pathTransition: 'none',
                                
                                    // Colors
                                    pathColor: `rgba(249, 64, 43, 1)`,
                                    textColor: '#ffffff',
                                    trailColor: 'rgb(214 214 214 / 12%)',
                                    backgroundColor: 'rgb(214 214 214 / 12%)',
                                })} 
                                value={props.maturityProgress}
                                >
                                    <Row noMarginTop><ThemedText.H2>{'MATURITY'}</ThemedText.H2></Row>
                                    <ThemedText.H2>{tillDay + ' days'}</ThemedText.H2>
                                    <ThemedText.H4>{tillMon + ' months'}</ThemedText.H4>
                                </CircularProgressbarWithChildren>;
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}