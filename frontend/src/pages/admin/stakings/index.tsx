import { useHistory } from 'react-router';
import React,{useEffect, useState} from 'react';
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
import { stakingFields,editableStakingFields,newStaking, NetworksDropdownValues } from '../../../common/Utils';

function SaerchStakingInfo(props: SaerchStakingGroupInfoProps&SaerchStakingGroupInfoDispatch) {
    const history  = useHistory();
    const [groupFilter,setGroupFilter] = useState('')
    const [groups,setGroups] = useState([''])
    const [results,showResults] = useState(false)

    const getGroupId = (currency: string) => {
        return props.groupInfos.filter(e=>e.defaultCurrency===currency)[0].groupId
    }

    const getCurrency = (currency: string) => {
        return currency.split(' ')[0];
    }

    const groupsDetails = [...props.groupInfos.map(e=>`${e.defaultCurrency} (${e.groupId})`)]

    const option = {
        "staking":"staking",
        "liquidity":"stakeFarming"
    }

    useEffect(()=>{
        if(props.groupInfos.length > 0){
            setGroups([...props.groupInfos.map(e=>`${e.defaultCurrency} (${e.groupId})`)])
        }
    },[props.groupInfos]);

    useEffect(()=>{
        props.fetchGroups();
    },[]);

    const handleFilter = (value:string) => {
        setGroupFilter(value)
        if(value){
            const filter = [...props.groupInfos.map(e=>`${e.defaultCurrency} (${e.groupId.toLowerCase()})`)].filter(
                e => e.toLowerCase().includes(value.toLowerCase())
            )
            setGroups(filter)
        }else{
            const filter = [...props.groupInfos.map(e=>`${e.defaultCurrency} (${e.groupId})`)]
            showResults(false)
            setGroups(filter)
        }
       
    }

    const handleStakingClick = (info) => {
        showResults(true)
        setGroupFilter(info)
        props.onChangeCurrency( getCurrency(info?.toString() || ''), props.groupInfos, props.fetchStakings)
    }

    const remappedNetwork = NetworksDropdownValues.find(e=>e.value===props.selectedStaking.network)?.identifier || props.selectedStaking.network

    const url = (curr:string) => `https://stake.unifyre.io/${curr}/info/${props.selectedStaking.contractAddress}/${remappedNetwork}`

    const infoCards = ( info : StakingApp,index:number ) => (
        <div className="info-card" onClick={ () =>  props.onSelect(index,props.stakings)}>
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

    const GroupCards = ( info : string,index:number ) => (
        <div className="info-card" onClick={()=>handleStakingClick(info) }>
            <div className="info">
                { info }
            </div>
          
        </div>
    )    
    

    return(
        <div>
            {   
                (!props.selected && !props.new) &&
                <div>
                    <div className="search-fields">
                        <Row ><ThemedText.H3>{`Search Group Stakings By Currency`}</ThemedText.H3></Row>
                        <Gap/>
                        {/* <Dropdown
                            items={groups}
                            placeholder="Select Group Currency"
                            checkable={false}
                            search={false}
                            onChange={(e:any, selectedOption) => props.onChangeCurrency( getCurrency(selectedOption.value?.toString() || ''), props.groupInfos, props.fetchStakings ) }
                        /> */}
                        <div>
                                <TextField
                                    placeholder='Filter Stakings Id'
                                    onChange={(e,v)=>handleFilter(v||'')}
                                    value={groupFilter}
                                />
                                <Gap/>
                            </div>
                            <Gap/>
                        {/* <div className="form-header">
                            <PrimaryButton onClick={()=>props.fetchStakings(props.currency)}>Search</PrimaryButton>
                        </div> */}
                    </div>
                    {
                        !results &&
                        <div>
                            <div className="form-header">
                                <Row><ThemedText.H3>{`Available Group Stakings`}</ThemedText.H3></Row>
                            </div>
                            <Gap size={"small"}/>
                            <Divider/>
                            {
                                groups.map(
                                    //@ts-ignore
                                    (e,i) => GroupCards(e,i)
                                )
                            }
                            <Gap/>   
                        </div>
                    }
                    {
                        results &&
                        <div>
                            <div className="form-header">
                                <Row><ThemedText.H3>{`Group Stakings`}</ThemedText.H3></Row>
                                {
                                    (props.currency != '') && 
                                        <PrimaryButton  onClick={()=>props.onNew()} >
                                            Add New Staking to Group
                                        </PrimaryButton> 
                                }
                              
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
                    }
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
                                    : (i === 'network') ? 
                                    <>
                                        <Gap/>
                                        <div> {i} </div>
                                        <Gap size={"small"}/>
                                        <Dropdown
                                            items={NetworksDropdownValues.map(e=>e.identifier)}
                                            placeholder={`Select Network`}
                                            checkable
                                            value={props.selectedStaking[`${i}`] || ''}
                                            onChange={(e:any, selectedOption) => props.onSelectedInfoChange(selectedOption.value || '', `${i}`)}
                                            //@ts-ignore
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
                        <PrimaryButton onClick={()=>props.addNewStakings(props.selectedStaking,props.onNew,()=>props.fetchStakings(props.currency))}>
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
                        <div style={{"cursor":"pointer"}}> Staking Url : {url(getGroupId(props.currency))} <span onClick={()=>navigator.clipboard.writeText(url(getGroupId(props.currency)))}>{'🔗'}</span></div>
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