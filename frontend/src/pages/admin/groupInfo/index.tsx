import React,{useEffect} from 'react';
import { PrimaryButton, TextField } from '@fluentui/react';
import { Button,Divider,TextArea } from '@fluentui/react-northstar'
import {
    Page,PageTopPart,  Row, ThemedText, Gap, InputCurrency, ThemedButton, ErrorMessage,
    InputGroupAddon, ThemedLink
    // @ts-ignore
} from 'unifyre-web-components';
import './groupinfo.scss';
import { connect } from 'react-redux';
import { GroupInfo, GroupInfoDispatch,GroupInfoProps } from './groupinfo';
import { GroupInfo as InfoType } from '../../../common/Types';
import ReactJson from 'react-json-view'


function SearchGroupInfo(props: GroupInfoProps&GroupInfoDispatch) {
    useEffect(()=>{
        props.fetchGroups();
    },[]);

    const infoCards = ( info : InfoType,index:number ) => (
        <div className="info-card" onClick={ () => props.onSelect(index,props.infos)}>
            <div className="info">
                Group Id : { info.groupId }
            </div>
            <div className="info">
                Currency : { info.defaultCurrency }
            </div>
        </div>
    )

    return(
        <div>
            {   
                !props.selected &&
                <div>
                    <div className="search-fields">
                        <Row ><ThemedText.H3>{`Search By Group Info`}</ThemedText.H3></Row>
                        <Gap/>
                        <TextField
                            placeholder='Enter group info Id'
                            onChange={(e, v) => props.onChangeGroupInfo(v || '',props.infos)}
                        />
                        <Gap/>
                    </div>
                    <div>
                        <div className="form-header">
                            <Row><ThemedText.H3>{`Matching Group Infos`}</ThemedText.H3></Row>
                            <PrimaryButton onClick={()=>props.onReturn(props.fetchGroups)}>Add New Group Info</PrimaryButton>
                        </div>
                        <Gap size={"small"}/>
                        <Divider/>
                        <Gap size={"small"}/>
                        {
                            //@ts-ignore
                            props.infos.map(
                                (e,i) => infoCards(e,i)
                            )
                        }
                    </div>
                </div>
            }
            {
                props.selected &&
                <div className="field-container">
                    <Gap/>
                    <div className="form-header">
                        <Row><ThemedText.H3>{`Group Info Details`}</ThemedText.H3></Row>
                        <div onClick={()=>props.onReturn(props.fetchGroups)} ><Row><ThemedText.H3>{`Return`}</ThemedText.H3></Row> </div>
                    </div>
                    <Gap size={"small"}/>
                    <Divider/>
                    <Gap/>
                    <Gap/>
                    <div>
                        <div> Group Id </div>
                        <TextField
                            placeholder='Enter group Id'
                            onChange={(e, v) => props.onSelectedInfoChange(v || '','groupId')}
                            value={props.selectedInfo.groupId || ''}
                        />
                        <Gap/>
                    </div>
                    <div>
                        <div> Network </div>
                        <TextField
                            onChange={(e, v) => props.onSelectedInfoChange(v || '','network')}
                            placeholder='Enter project contract Network (ETHERUEN,RINKEBY)'
                            //@ts-ignore
                            value={props.selectedInfo.network || ''}
                        />
                        <Gap/>
                    </div>
                    <div>
                        <div> Token Address </div>
                        <TextField
                            onChange={(e, v) => props.onSelectedInfoChange(v || '','contractAddress')}
                            placeholder='Enter the token Address'
                            //@ts-ignore
                            value={props.selectedInfo.contractAddress || ''}
                        />
                        <Gap/>
                    </div>
                    <div>
                        <div> homepage </div>
                        <TextField
                            placeholder='Enter homepage'
                            onChange={(e, v) => props.onSelectedInfoChange(v || '','homepage')}
                            value={props.selectedInfo.homepage || ''}
                        />
                        <Gap/>
                    </div>
                    <div>
                        <div> Main Logo Url </div>
                        <TextField
                            placeholder='Enter Main Logo Url'
                            onChange={(e, v) => props.onSelectedInfoChange(v || '','mainLogo')}
                            value={props.selectedInfo.mainLogo || ''}
                        />
                        <Gap/>
                    </div>
                    <div>
                        <div> ThemeVariables </div>
                        {
                            (props.originalInfo.themeVariables && props.selectedInfo.themeVariables != '')  &&
                            <ReactJson
                                onEdit={(v:any) => props.onSelectedInfoChange(v || '','themeVariables')}
                                src={props.selectedInfo.themeVariables}
                            />
                        }
                        {
                            (!props.originalInfo.themeVariables || props.selectedInfo.themeVariables === '') &&
                            <TextArea 
                                fluid 
                                value={
                                    props.selectedInfo.themeVariables
                                }
                                placeholder="Type here..." 
                                className="variable-container"
                                onChange={(v:any) => props.onSelectedInfoChange(v.target.value || '','themeVariables')}
                            />
                        }
                        <Gap/>
                    </div>
                    <div>
                        <PrimaryButton 
                            onClick={
                                ()=> props.selectedInfo._id ? 
                                props.updateGroupInfo(props.selectedInfo,props.fetchGroups) 
                                : props.addGroupInfo(props.selectedInfo,props.fetchGroups)} 
                        > 
                            {props.selectedInfo._id ? 'Update Group Id' : 'Add New Group Info'}
                        </PrimaryButton>
                        {props.error}
                    </div>
                    <Gap/>
                    <Gap/>
                </div>
                
            }
           
        </div>
    )
}



export const GroupInfoContainer = connect(
    GroupInfo.mapStateToProps,GroupInfo.mapDispatchToProps
)(SearchGroupInfo);