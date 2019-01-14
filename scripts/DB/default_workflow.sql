INSERT INTO "WorkflowDefinitions" ("Id", "Name", "Enabled", "Description", "WorkflowScheme", "WorkflowBusinessFlow", "StoreTypeId") VALUES
(1,	'sil_android_google_play',	'1',	'SIL Default Workflow for Publishing to Google Play',	'SIL_Default_AppBuilders_Android_GooglePlay',	'SIL_Default_AppBuilders_Android_GooglePlay_Flow',	1)
ON CONFLICT ("Id")
DO UPDATE SET 
	"Name" = excluded."Name", 
	"Enabled" = excluded."Enabled",
	"Description" = excluded."Description",
	"WorkflowScheme" = excluded."WorkflowScheme",
	"WorkflowBusinessFlow" = excluded."WorkflowBusinessFlow",
	"StoreTypeId" = excluded."StoreTypeId";


INSERT INTO "ProductDefinitions" ("Id", "Name", "TypeId", "Description", "WorkflowId") VALUES
(1,	'Android App to Google Play',	1,	'Build an Android App from a Scripture App Builder project and publish to a Google Play Store',	1)
ON CONFLICT ("Id")
DO UPDATE SET
	"Name" = excluded."Name",
	"TypeId" = excluded."TypeId",
	"Description" = excluded."Description",
	"WorkflowId" = excluded."WorkflowId";

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
    <Command Name="Rebuild" />
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
    <Activity Name="Product Creation" State="Product Creation" IsInitial="False" IsFinal="False" IsForSetState="False" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
        <ActionRef Order="2" NameRef="BuildEngine_CreateProduct" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="700" Y="100" />
    </Activity>
    <Activity Name="Check Product Creation" State="Product Creation" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
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
    <Activity Name="Synchronize Data" State="Synchronize Data" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="40" Y="420" />
    </Activity>
    <Activity Name="Repo Configuration" State="Repo Configuration" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="40" Y="260" />
    </Activity>
    <Activity Name="Product Build" State="Product Build" IsInitial="False" IsFinal="False" IsForSetState="False" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
        <ActionRef Order="2" NameRef="BuildEngine_BuildProduct" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="360" Y="420" />
    </Activity>
    <Activity Name="Check Product Build" State="Product Build" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="700" Y="420" />
    </Activity>
    <Activity Name="App Store Preview" State="App Store Preview" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="700" Y="580" />
    </Activity>
    <Activity Name="Create App Store Entry" State="Create App Store Entry" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="40" Y="600" />
    </Activity>
    <Activity Name="Verify and Publish" State="Verify and Publish" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="40" Y="760" />
    </Activity>
    <Activity Name="Product Publish" State="Product Publish" IsInitial="False" IsFinal="False" IsForSetState="False" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
        <ActionRef Order="2" NameRef="BuildEngine_PublishProduct" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="360" Y="760" />
    </Activity>
    <Activity Name="Check Product Publish" State="Product Publish" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="700" Y="720" />
    </Activity>
    <Activity Name="Make It Live" State="Make It Live" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
        <ActionRef Order="2" NameRef="GooglePlay_UpdatePublishLink" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="700" Y="920" />
    </Activity>
    <Activity Name="Published" State="Published" IsInitial="False" IsFinal="False" IsForSetState="True" IsAutoSchemeUpdate="True">
      <Implementation>
        <ActionRef Order="1" NameRef="UpdateProductTransition" />
      </Implementation>
      <PreExecutionImplementation>
        <ActionRef Order="1" NameRef="WriteProductTransition" />
      </PreExecutionImplementation>
      <Designer X="990" Y="890" />
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
    <Transition Name="Check Job Creation_Activity_1_1" To="Repo Configuration" From="Check Product Creation" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
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
    <Transition Name="RepoConfig_SynchronizeData_1" To="Product Build" From="Repo Configuration" Classifier="Direct" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
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
    <Transition Name="SynchronizeData_Activity_1_1" To="Product Build" From="Synchronize Data" Classifier="Direct" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
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
    <Transition Name="Check Product Build_SynchronizeData_1" To="Synchronize Data" From="Check Product Build" Classifier="Reverse" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Auto" />
      </Triggers>
      <Conditions>
        <Condition Type="Action" NameRef="BuildEngine_BuildFailed" ConditionInversion="false" />
      </Conditions>
      <Designer X="487" Y="380" />
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
    <Transition Name="App Store Preview_SynchronizeData_1" To="Synchronize Data" From="App Store Preview" Classifier="Reverse" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
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
      <Designer X="150" Y="540" />
    </Transition>
    <Transition Name="App Store Preview_Activity_1_1" To="Create App Store Entry" From="App Store Preview" Classifier="Direct" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
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
      <Designer X="468" Y="609" />
    </Transition>
    <Transition Name="Create App Store Entry_SynchronizeData_1" To="Synchronize Data" From="Create App Store Entry" Classifier="Reverse" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
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
      <Designer X="89" Y="538" />
    </Transition>
    <Transition Name="Create App Store Entry_App Store Preview_1" To="App Store Preview" From="Create App Store Entry" Classifier="Reverse" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="OrgAdmin" />
        <Restriction Type="Allow" NameRef="Admins" />
      </Restrictions>
      <Triggers>
        <Trigger Type="Command" NameRef="Back" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer X="480" Y="635" />
    </Transition>
    <Transition Name="Create App Store Entry_Activity_1_1" To="Verify and Publish" From="Create App Store Entry" Classifier="Direct" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="OrgAdmin" />
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
    <Transition Name="Verify and Publish_Activity_1_1" To="Product Publish" From="Verify and Publish" Classifier="Direct" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
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
      <Designer X="305" Y="793" />
    </Transition>
    <Transition Name="Verify and Publish_SynchronizeData_1" To="Synchronize Data" From="Verify and Publish" Classifier="Reverse" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="Owner" />
        <Restriction Type="Allow" NameRef="Admins" />
      </Restrictions>
      <Triggers>
        <Trigger Type="Command" NameRef="Reject" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer X="199" Y="539" />
    </Transition>
    <Transition Name="Product Publish_Activity_1_1" To="Check Product Publish" From="Product Publish" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Auto" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="Check Product Publish_Activity_1_1" To="Make It Live" From="Check Product Publish" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Auto" />
      </Triggers>
      <Conditions>
        <Condition Type="Action" NameRef="BuildEngine_PublishCompleted" ConditionInversion="false" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="Check Product Publish_Check Product Publish_1" To="Check Product Publish" From="Check Product Publish" Classifier="NotSpecified" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Timer" NameRef="CheckReady" />
      </Triggers>
      <Conditions>
        <Condition Type="Otherwise" />
      </Conditions>
      <Designer X="925" Y="687" />
    </Transition>
    <Transition Name="Check Product Publish_SynchronizeData_1" To="Synchronize Data" From="Check Product Publish" Classifier="Reverse" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Auto" />
      </Triggers>
      <Conditions>
        <Condition Type="Action" NameRef="BuildEngine_PublishFailed" ConditionInversion="false" />
      </Conditions>
      <Designer X="298" Y="559" />
    </Transition>
    <Transition Name="Make It Live_Activity_1_1" To="Published" From="Make It Live" Classifier="Direct" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="OrgAdmin" />
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
    <Transition Name="Make It Live_SynchronizeData_1" To="Synchronize Data" From="Make It Live" Classifier="Reverse" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
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
      <Designer X="275" Y="885" />
    </Transition>
    <Transition Name="Published_SynchronizeData_1" To="Synchronize Data" From="Published" Classifier="Reverse" AllowConcatenationType="Or" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="Owner" />
        <Restriction Type="Allow" NameRef="OrgAdmin" />
        <Restriction Type="Allow" NameRef="Admins" />
      </Restrictions>
      <Triggers>
        <Trigger Type="Command" NameRef="Rebuild" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer X="288" Y="842" />
    </Transition>
  </Transitions>
</Process>')
ON CONFLICT("Code") DO UPDATE SET
	"Scheme" = excluded."Scheme";
