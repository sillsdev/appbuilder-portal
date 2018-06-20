﻿import React from 'react'
import { render } from 'react-dom'
import DWKitAdmin from './../../scripts/optimajet-admin.js'

let globalActions = [
    'validate',
    'save', 
    'cancel',
    'exit',
    'redirect',
    'gridCreate',
    'gridEdit',
    'gridCopy',
    'gridDelete',
    'gridRefresh',
    'workflowExecuteCommand',
    'workflowSetState',
    'refresh'];

render(
    <DWKitAdmin
        apiUrl="/configapi"
        workflowApi="/workflow/designerapi"
        imageFolder="/images/"
        deltaWidth={0}
        deltaHeight={0}
        controlActions={globalActions}
        returnToAppUrl="/"
    />,
    document.getElementById('content')
);




