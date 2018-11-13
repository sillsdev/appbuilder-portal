INSERT INTO "WorkflowDefinitions" ("Id", "Name", "Enabled", "Description", "WorkflowScheme", "WorkflowBusinessFlow", "StoreTypeId") VALUES
(1,	'sil_android_google_play',	'1',	'SIL Default Workflow for Publishing to Google Play',	'SIL_Default_AppBuilders_Android_GooglePlay',	'SIL_Default_AppBuilders_Android_GooglePlay',	1);

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
    <Command Name="Approve">
      <InputParameters>
        <ParameterRef Name="Comment" IsRequired="false" DefaultValue="" NameRef="Comment" />
      </InputParameters>
    </Command>
    <Command Name="Reject">
      <InputParameters>
        <ParameterRef Name="Comment" IsRequired="true" DefaultValue="" NameRef="Comment" />
      </InputParameters>
    </Command>
  </Commands>
  <Activities>
    <Activity Name="Definition" State="Definition" IsInitial="True" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Designer X="40" Y="100" />
    </Activity>
    <Activity Name="Job Creation" State="JobCreation" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Designer X="700" Y="100" />
    </Activity>
    <Activity Name="Check Job Creation" State="CheckJobCreation" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Designer X="1020" Y="100" />
    </Activity>
    <Activity Name="Approval" State="Approval" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Designer X="360" Y="100" />
    </Activity>
  </Activities>
  <Transitions>
    <Transition Name="Job Creation_Activity_1_1" To="Check Job Creation" From="Job Creation" Classifier="NotSpecified" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Command" NameRef="Approve" />
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
        <Trigger Type="Command" NameRef="Approve" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer X="300" Y="116" />
    </Transition>
    <Transition Name="Approval_Job Creation_1" To="Job Creation" From="Approval" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="OrgAdmin" />
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
  </Transitions>
</Process>');
