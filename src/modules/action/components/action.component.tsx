import React from "react";
import MechanismModel, {ApprovalsCombo,   MechanismMeta, MechanismState} from "../../shared/models/mechanism.model";
import {Divider, Paper} from "@material-ui/core";
import ActionButtons from "./actionButtons.component";
import {getMechanismsInfo, performAction, getMechanismStates} from "../services/mechanism.service";
import Step from "./step/step.component";
import MechanismTabs from "./mechanism/mechanismTabs.component";
import {fetchUserOu, fetchUserType} from "../services/user.service";
import WorkflowOverview from "./workflowOverview.component";
import {idName} from "../models/idName";
import WorkflowPeriodService from "../../shared/services/workflowsPeriods.service";
import {getWorkflowNameById} from "../../shared/services/workflowService";

import "../css/action.component.css";
import Loading from "../../shared/components/loading.component";

export default class Action extends React.Component<
    {postMessage: (message:string, type?:string)=>void, approvalCombos: ApprovalsCombo[], workflow: string, period: string},
    {
        workflow: idName,
        period: idName,
        userOu: string,
        userType: string,
        mechanisms: MechanismModel[],
        mechanismState: MechanismState,
        processing: boolean
    }
    > {
    constructor(props){
        super(props);
        let mechanismsMeta:MechanismMeta[] = props.approvalCombos.map(ac=>{return {
            ou: ac.ou,
            cocId: ac.cocId,
            coId: ac.coId,
            workflow: props.workflow,
            period: props.period
        }});
        let mechanisms:MechanismModel[] = mechanismsMeta.map(meta=>{return {meta: meta}});
        this.state = {
            workflow: {id: props.workflow, name: getWorkflowNameById(props.workflow)},
            period: {id: props.period, name: null},
            userType: null,
            userOu: null,
            mechanismState: null,
            mechanisms: mechanisms,
            processing: false
        };
        this.getMechanismStatuses(this.state.workflow.id, this.state.period.id, this.state.mechanisms.map(m=>m.meta));
        this.getMechanismsInfo(this.state.mechanisms);
        this.getUserType();
        this.getUserOu();

        let wfService = new WorkflowPeriodService();
        wfService.init().then(()=>{
            this.setState({period: {id: props.period, name: wfService.getPeriodNameById(props.workflow, props.period)}});
        });
    }

    getMechanismStatuses(workflow: string, period: string, mechanismsMeta: MechanismMeta[]){
        return getMechanismStates(workflow, period, mechanismsMeta).then(state=>{
            console.log(state);
            this.setState({mechanismState: state});
        });
    }

    getMechanismsInfo(mechanisms: MechanismModel[]){
        getMechanismsInfo(mechanisms.map(m=>m.meta.cocId)).then(mechanismsInfo=>{
            mechanismsInfo.forEach((info,i)=>{
                mechanisms[i].info = mechanismsInfo[i];
            });
            this.setState({mechanisms: mechanisms});
        });
    };

    getUserType(){
        fetchUserType().then(userType=>{
            this.setState({userType: userType})
        });
    }

    getUserOu(){
        fetchUserOu().then(ou=>this.setState({userOu: ou}));
    }

    performAction = (action:string)=>{
        this.setState({processing: true});
        performAction(action, this.state.workflow.id, this.state.period.id, this.state.mechanisms.map(m=>m.meta)).then((response)=>{
            this.setState({processing: false});
            if (!response.ok || response.redirected) return this.errorMessage(action);
            this.getMechanismStatuses(this.state.workflow.id, this.state.period.id, this.state.mechanisms.map(m=>m.meta)).then(()=>{
                this.successMessage(action);
            });
        });
    };


    renderAction(){
        if (this.state.processing) return <Loading message='Loading...'/>;
        return <ActionButtons mechanismState={this.state.mechanismState} performAction={this.performAction} mechanismsNr={this.state.mechanisms.length}/>;
    }

    successMessage(action:string){
        let plural = this.state.mechanisms.length>1?'s':'';
        let message = `Mechanism${plural} successfully `;
        switch(action){
            case 'submit': message += 'submitted'; break;
            case 'recall': message += 'recalled'; break;
            case 'accept': message += 'accepted'; break;
        }
        this.props.postMessage(message);
    }

    errorMessage(action:string){
        let plural = this.state.mechanisms.length>1?'s':'';
        this.props.postMessage(`Server error: Failed to ${action} mechanism${plural}`, 'error');
    }

    render() {
        return (
            <React.Fragment>
                <Paper>
                    {this.renderAction()}
                    <Divider/>
                    <Step workflow={this.state.workflow.id} mechanismState={this.state.mechanismState} userType={this.state.userType}/>
                    <Divider/>
                    <WorkflowOverview workflow={this.state.workflow.name} period={this.state.period.name}/>
                </Paper>
                <MechanismTabs workflow={this.state.workflow.id} period={this.state.period.id} userOu={this.state.userOu} mechanisms={this.state.mechanisms} mechanismState={this.state.mechanismState}/>
            </React.Fragment>
        );
    }
}