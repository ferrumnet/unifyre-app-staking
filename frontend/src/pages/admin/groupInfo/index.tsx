import React,{useEffect} from 'react';
import { PrimaryButton, TextField } from '@fluentui/react';
import { Divider,TextArea,Dropdown } from '@fluentui/react-northstar'
import {
    Row, ThemedText, Gap, 
    // @ts-ignore
} from 'unifyre-web-components';
import './groupinfo.scss';
import { connect } from 'react-redux';
import { GroupInfo, GroupInfoDispatch,GroupInfoProps } from './groupinfo';
import { GroupInfo as InfoType } from '../../../common/Types';
import { defaultvar,NetworksDropdownValues } from '../../../common/Utils';

function safeCleanup(j: string): string {
	try {
		return JSON.stringify(JSON.parse(j), undefined, 4);
	} catch(e) {
		return j;
	}
}

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

    const reMap = (value) => {
        const selection = NetworksDropdownValues.find(e=>e.value===value)
        return selection?.identifier || value
    }

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
                        <Dropdown
                            items={NetworksDropdownValues.map(e=>e.identifier)}
                            placeholder={`Select Network`}
                            checkable
                            value={reMap(props.selectedInfo.network)}
                            onChange={(e:any, selectedOption) => props.onSelectedInfoChange(
                                //@ts-ignore
                                selectedOption.value || '', 'network'
                            ) }
                        />
                        <Gap/>
                    </div>
                    <div>
                        <div> Token Address </div>
                        <TextField
                            onChange={(e, v) => props.onSelectedInfoChange(v || '','contractAddress')}
                            //@ts-ignore
                            value={props.selectedInfo.contractAddress}
                            placeholder='Enter the token Address'
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
                        <div> Theme Variables </div>
                        {
                            <TextArea 
                                fluid 
                                value={safeCleanup(props.selectedInfo.themeVariables || defaultvar)}
                                defaultValue = {defaultvar.toString()}
                                placeholder="Type here..." 
                                className="variable-container"
                                onChange={(v:any) => props.onSelectedInfoChange(v.target.value || '{}','themeVariables')}
                            />
                        }
                        <Gap/>
                    </div>
                    <div>
                        {props.error}
                        <p></p>
                        <PrimaryButton 
							disabled={!!props.error}
                            onClick={
                                ()=> props.selectedInfo._id ? 
                                props.updateGroupInfo(props.selectedInfo,props.fetchGroups) 
                                : props.addGroupInfo(props.selectedInfo,props.fetchGroups)} 
                        > 
                            {props.selectedInfo._id ? 'Update Group Id' : 'Add New Group Info'}
                        </PrimaryButton>
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