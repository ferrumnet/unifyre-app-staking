import { useHistory } from 'react-router';
import React,{useEffect} from 'react';
import { PrimaryButton, TextField } from '@fluentui/react';
import { Divider,Dropdown } from '@fluentui/react-northstar'
import {
    Row, ThemedText, Gap
    // @ts-ignore
} from 'unifyre-web-components';
import './stakings.scss';
import { connect } from 'react-redux';
import { SaerchStakingGroupInfo, SaerchStakingGroupInfoDispatch,SaerchStakingGroupInfoProps } from './stakings';
import { GroupInfo ,StakingApp } from '../../../common/Types';
import { stakingFields,editableStakingFields,newStaking } from '../../../common/Utils';

function SaerchStakingInfo(props: SaerchStakingGroupInfoProps&SaerchStakingGroupInfoDispatch) {
    const history  = useHistory();

    const getGroupId = (currency: string) => {
        return props.groupInfos.filter(e=>e.defaultCurrency===currency)[0].groupId
    }

    const getCurrency = (currency: string) => {
        return currency.split(' ')[0];
    }

    const option = {
        "staking":"staking",
        "liquidity":"stakeFarming"
    }

    useEffect(()=>{
        props.fetchGroups();
    },[]);


    const infoCards = ( info : StakingApp,index:number ) => (
        <div className="info-card" onClick={ () => props.onSelect(index,props.stakings)}>
            <div className="info">
                Name : { info.name }
            </div>
            <div className="info">
                Symbol : { info.symbol }
            </div>
            <div className="info">
                Currency : { info.currency }
            </div>
            <div className="info">
                Contract Address : { info.contractAddress }
            </div>
        </div>
    )    

    const groups = [...props.groupInfos.map(e=>`${e.defaultCurrency} (${e.groupId})`)]
    console.log(props);
    return(
        <div>
            {   
                (!props.selected && !props.new) &&
                <div>
                    <div className="search-fields">
                        <Row ><ThemedText.H3>{`Search Group Stakings By Currency`}</ThemedText.H3></Row>
                        <Gap/>
                        <Dropdown
                            items={groups}
                            placeholder="Select Group Currency"
                            checkable
                            search
                            onChange={(e:any, selectedOption) => props.onChangeCurrency( getCurrency(selectedOption.value?.toString() || ''), props.groupInfos, props.fetchStakings ) }
                        />
                        
                        <Gap/>
                        <div className="form-header">
                            <PrimaryButton onClick={()=>props.fetchStakings(props.currency)}>Search</PrimaryButton>
                        </div>
                    </div>
                    <div>
                        <div className="form-header">
                            <Row><ThemedText.H3>{`Group Stakings`}</ThemedText.H3></Row>
                            { (props.currency != '') && <PrimaryButton  onClick={()=>props.onNew()} >Add New Staking to Group</PrimaryButton> }
                        </div>
                        <Gap size={"small"}/>
                        <Divider/>
                        {
                            props.stakings.map(
                                //@ts-ignore
                                (e,i) => infoCards(e,i)
                            )
                        }
                        <Gap/>
                       
                    </div>
                </div>
            }
            {
                props.new && 
                <div className="field-container">
                    <Gap/>
                    <div className="form-header">
                        <Row><ThemedText.H3>{`Staking Details`}</ThemedText.H3></Row>
                        <div  onClick={()=>props.onNew()} ><Row ><ThemedText.H3>{`Return`}</ThemedText.H3></Row> </div>
                    </div>
                    <Gap size={"small"}/>
                    <Divider/>
                    <Gap/>
                    {
                        newStaking.map(
                            (i:string) =>  
                            <div>
                                {
                                    (i === 'contractType') ? 
                                    <>
                                        <Gap/>
                                        <div> {i} </div>
                                        <Gap size={"small"}/>
                                        <Dropdown
                                            items={['staking','liquidity']}
                                            placeholder={`Select ${i}`}
                                            checkable
                                            onChange={(e:any, selectedOption) => props.onSelectedInfoChange(
                                                //@ts-ignore
                                                option[`${selectedOption.value}`].toString() || '', `${i}`
                                            ) }
                                        />
                                        <Gap/>
                                    </>
                                
                                    :
                                    <>
                                        <div> {i} </div>
                                        <TextField
                                                placeholder={`Enter ${i}`}
                                                onChange={(e, v) => props.onSelectedInfoChange(v || '', `${i}`)}
                                                //@ts-ignore
                                                value={props.selectedStaking[`${i}`] || ''}
                                        />
                                    </>
                                }
                            </div>
                        )
                    }
                    <Gap/>
                    <div>
                        <PrimaryButton onClick={()=>props.addNewStakings(props.selectedStaking,props.onReturn,()=>props.fetchStakings(props.currency))}>
                            {'Add Staking to Group'}
                        </PrimaryButton>
                    </div>
                    <Gap/>
                </div>
            }
            {
                !props.new &&
                props.selected &&
                <div className="field-container">
                    <Gap/>
                    <div className="form-header">
                        <Row><ThemedText.H3>{`Staking Details`}</ThemedText.H3></Row>
                        <div  onClick={()=>props.onReturn()} ><Row ><ThemedText.H3>{`Return`}</ThemedText.H3></Row> </div>
                    </div>
                    <Gap size={"small"}/>
                    <Divider/>
                    <Row centered>
                        <div> Staking Url : {`https://stake.unifyre.io/${getGroupId(props.currency)}/info/${props.selectedStaking.contractAddress}/${props.selectedStaking.network}`}</div>
                    </Row>
                    <Gap/>
                    <Gap/>
                    {
                        editableStakingFields.map(
                            (i:string) =>  
                            <div>
                                <div> {i} </div>
                                {
                                    (i === 'contractType') ? 
                                        <>
                                            <Gap/>
                                            <Dropdown
                                                items={['staking','liquidity']}
                                                placeholder={`Select ${i}`}
                                                checkable
                                                //@ts-ignore
                                                onChange={(e:any, selectedOption) => props.onChangeCurrency( option[`${selectedOption.value}`].toString(), props.groupInfos, props.fetchStakings ) }
                                            />
                                            <Gap/>
                                        </>
                                    : <TextField
                                            placeholder={`Enter ${i}`}
                                            onChange={(e, v) => props.onSelectedInfoChange(v || '', `${i}`)}
                                            //@ts-ignore
                                            value={props.selectedStaking[`${i}`] || ''}
                                        />
                                }
                                
                                <Gap/>
                            </div>
                        )
                    }
                    {
                        stakingFields.map(
                            (i:string) =>  
                            <div>
                                <div> {i} </div>
                                <TextField
                                    placeholder={`Enter ${i}`}
                                    onChange={(e, v) => props.onSelectedInfoChange(v || '', `${i}`)}
                                    //@ts-ignore
                                    value={props.selectedStaking[`${i}`] || ''}
                                    disabled
                                />
                                <Gap/>
                            </div>
                        )
                    }
                    <div>
                        <PrimaryButton onClick={()=> props.selectedStaking._id ? 
                            props.updateStakings(props.selectedStaking,props.onReturn,()=>props.fetchStakings(props.currency)) : 
                            props.addNewStakings(props.selectedStaking,props.onReturn,()=>props.fetchStakings(props.currency))
                            }>
                            {props.selectedStaking._id ? 'Update Staking Info' : 'Add Staking to Group'}
                        </PrimaryButton>
                        &nbsp;
                        <PrimaryButton
                            onClick={() =>
                                props.deleteStakings(props.selectedStaking, props.onReturn,()=>props.fetchStakings(props.currency))}
                            disabled={!props.selectedStaking._id}    
                        >
                            Delete
                        </PrimaryButton>
                    </div>
                    <Gap/>
                </div>
                
            }
           
        </div>
    )
}



export const StakingInfoContainer = connect(
    SaerchStakingGroupInfo.mapStateToProps,SaerchStakingGroupInfo.mapDispatchToProps
)(SaerchStakingInfo);