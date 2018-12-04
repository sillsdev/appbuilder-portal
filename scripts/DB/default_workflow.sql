INSERT INTO "WorkflowDefinitions" ("Id", "Name", "Enabled", "Description", "WorkflowScheme", "WorkflowBusinessFlow", "StoreTypeId") VALUES
(1,	'sil_android_google_play',	'1',	'SIL Default Workflow for Publishing to Google Play',	'SIL_Default_AppBuilders_Android_GooglePlay',	'SIL_Default_AppBuilders_Android_GooglePlay_Flow',	1);

INSERT INTO "ProductDefinitions" ("Id", "Name", "TypeId", "Description", "WorkflowId") VALUES
(1,	'android_google_play',	1,	'Android App to Google Play',	1);

INSERT INTO "WorkflowScheme" ("Code", "Scheme") VALUES
('SIL_Default_AppBuilders_Android_GooglePlay',	'<Process>
  <Designer />
  <Actors>
    <Actor Name="Owner" Rule="IsOwner" Value="" />
    <Actor Name="OrgAdmin" Rule="IsOrgAdmin" Value="" />
    <Actor Name="Admins" Rule="CheckRole" Value="Admins" />
  </Actors>
  <Parameters>
    <Parameter Name="Comment" Type="String" Purpose="Temporary" />
  </Parameters>
  <Commands>
    <Command Name="Approve" />
    <Command Name="Reject" />
    <Command Name="Continue" />
    <Command Name="Back" />
  </Commands>
  <Timers>
    <Timer Name="CheckReady" Type="Interval" Value="60s" NotOverrideIfExists="false" />
  </Timers>
  <Activities>
    <Activity Name="Definition" State="Definition" IsInitial="True" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="40" Y="100" />
    </Activity>
    <Activity Name="Product Creation" State="ProductCreation" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
        <ActionRef Order="2" NameRef="BuildEngine_CreateProduct" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="700" Y="100" />
    </Activity>
    <Activity Name="Check Product Creation" State="CheckProductCreation" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="700" Y="260" />
    </Activity>
    <Activity Name="Approval" State="Approval" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="360" Y="100" />
    </Activity>
    <Activity Name="SynchronizeData" State="SynchronizeData" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="40" Y="420" />
    </Activity>
    <Activity Name="RepoConfig" State="RepoConfig" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="40" Y="260" />
    </Activity>
    <Activity Name="Product Build" State="ProductBuild" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
        <ActionRef Order="2" NameRef="BuildEngine_BuildProduct" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="360" Y="420" />
    </Activity>
    <Activity Name="Check Product Build" State="CheckProductBuild" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="700" Y="420" />
    </Activity>
    <Activity Name="App Store Preview" State="AppStorePreview" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="700" Y="580" />
    </Activity>
  </Activities>
  <Transitions>
    <Transition Name="Job Creation_Activity_1_1" To="Check Product Creation" From="Product Creation" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Auto" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="Definition_Approval_1" To="Approval" From="Definition" Classifier="Direct" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="Owner" />
        <Restriction Type="Allow" NameRef="Admins" />
      </Restrictions>
      <Triggers>
        <Trigger Type="Command" NameRef="Continue" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer X="300" Y="116" />
    </Transition>
    <Transition Name="Approval_Job Creation_1" To="Product Creation" From="Approval" Classifier="Direct" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="OrgAdmin" />
        <Restriction Type="Allow" NameRef="Admins" />
      </Restrictions>
      <Triggers>
        <Trigger Type="Command" NameRef="Approve" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="Approval_Definition_1" To="Definition" From="Approval" Classifier="Reverse" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="OrgAdmin" />
        <Restriction Type="Allow" NameRef="Admins" />
      </Restrictions>
      <Triggers>
        <Trigger Type="Command" NameRef="Reject" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer X="301" Y="150" />
    </Transition>
    <Transition Name="Check Job Creation_Activity_1_1" To="RepoConfig" From="Check Product Creation" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Auto" />
      </Triggers>
      <Conditions>
        <Condition Type="Action" NameRef="BuildEngine_ProductCreated" ConditionInversion="false" ResultOnPreExecution="true" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="Check Job Creation_Check Job Creation_1" To="Check Product Creation" From="Check Product Creation" Classifier="NotSpecified" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Timer" NameRef="CheckReady" />
      </Triggers>
      <Conditions>
        <Condition Type="Otherwise" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="RepoConfig_SynchronizeData_1" To="Product Build" From="RepoConfig" Classifier="Direct" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="Owner" />
        <Restriction Type="Allow" NameRef="Admins" />
      </Restrictions>
      <Triggers>
        <Trigger Type="Command" NameRef="Continue" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer X="300" Y="332" />
    </Transition>
    <Transition Name="SynchronizeData_Activity_1_1" To="Product Build" From="SynchronizeData" Classifier="Direct" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="Owner" />
        <Restriction Type="Allow" NameRef="Admins" />
      </Restrictions>
      <Triggers>
        <Trigger Type="Command" NameRef="Continue" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="Product Build_Activity_1_1" To="Check Product Build" From="Product Build" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Auto" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="Check Product Build_SynchronizeData_1" To="SynchronizeData" From="Check Product Build" Classifier="Reverse" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Auto" />
      </Triggers>
      <Conditions>
        <Condition Type="Action" NameRef="BuildEngine_BuildFailed" ConditionInversion="false" />
      </Conditions>
      <Designer X="463" Y="363" />
    </Transition>
    <Transition Name="Check Product Build_Activity_1_1" To="App Store Preview" From="Check Product Build" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Auto" />
      </Triggers>
      <Conditions>
        <Condition Type="Action" NameRef="BuildEngine_BuildCompleted" ConditionInversion="false" ResultOnPreExecution="true" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="Check Product Build_Check Product Build_1" To="Check Product Build" From="Check Product Build" Classifier="NotSpecified" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Timer" NameRef="CheckReady" />
      </Triggers>
      <Conditions>
        <Condition Type="Otherwise" />
      </Conditions>
      <Designer />
    </Transition>
  </Transitions>
</Process>');
