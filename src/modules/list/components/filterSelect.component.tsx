import React from "react";
import {FormControl, InputLabel, MenuItem, Select, Typography} from "@material-ui/core";
import Filters from "../models/filters.model";
import {idNameList} from "../../shared/models/idNameList.model";

const styles = {
    formControl: {
        marginRight: 20,
        minWidth: 160,
    },
    info: {
        marginTop: 10
    }
};

function renderInfo(selected: Filters){
    if (!selected.ou) return <Typography color='secondary' style={styles.info}>Please specify Organisation Unit</Typography>;
}

export default function FilterSelect(
    {organisationUnits, workflows, periods, selected, select}
    :{organisationUnits:idNameList, workflows:idNameList, periods:idNameList, selected:Filters, select:(property: string, value:string)=>void}
    ){
    if(!organisationUnits) return null;
    if (!selected.workflow) return null;
    return(
        <React.Fragment>
            <FormControl style={styles.formControl}>
                <InputLabel htmlFor="workflow">Workflow</InputLabel>
                <Select
                    inputProps={{
                        name: 'workflow',
                        id: 'workflow',
                        className: 'cy_list_workflowSelect'
                    }}
                    onChange={event=>select('workflow', event.target.value as string)}
                    value={selected.workflow || ''}
                >
                    {workflows.map(wf=>
                        <MenuItem value={wf.id} key={wf.id}>{wf.name}</MenuItem>
                    )}
                </Select>
            </FormControl>
            <FormControl style={styles.formControl}>
                <InputLabel htmlFor="period">Period</InputLabel>
                <Select
                    inputProps={{
                        name: 'period',
                        id: 'period',
                        className: 'cy_list_periodSelect'
                    }}
                    onChange={event=>select('period', event.target.value as string)}
                    value={selected.period || ''}
                >
                    {periods.map(p=>
                        <MenuItem value={p.id} key={p.id}>{p.name}</MenuItem>
                    )}
                </Select>
            </FormControl>
            <FormControl style={styles.formControl}>
                <InputLabel htmlFor="ou">Organisation Unit</InputLabel>
                <Select
                    inputProps={{
                        name: 'ou',
                        id: 'ou',
                        className: 'cy_list_ouSelect'
                    }}
                    onChange={event=>select('ou', event.target.value as string)}
                    value={selected.ou || ''}
                >
                    {organisationUnits.map(ou=>
                        <MenuItem value={ou.id} key={ou.id}>{ou.name}</MenuItem>
                    )}
                </Select>
            </FormControl>
            {renderInfo(selected)}
        </React.Fragment>
    );
}