CREATE VIEW "abV_WorkflowAppBuildersProduct" AS
SELECT
    prod."WorkflowProcessId" as "Id",
    prod."Id" as "ProductId",
    proj."OwnerId" as "UserId",
    proj."Id" as "ProjectId",
    proj."TypeId" as "ApplicationTypeId",
    prod."StoreId",
    prod."StoreLanguageId",
    prod."ProductDefinitionId"
   FROM ("Products" prod
     JOIN "Projects" proj ON ((proj."Id" = prod."ProjectId")));

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
  </Actors>
  <Commands>
    <Command Name="next" />
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
      <Designer X="380" Y="100" />
    </Activity>
  </Activities>
  <Transitions>
    <Transition Name="Job Creation_Activity_1_1" To="Check Job Creation" From="Job Creation" Classifier="NotSpecified" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Triggers>
        <Trigger Type="Command" NameRef="next" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="Definition_Approval_1" To="Approval" From="Definition" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="Owner" />
      </Restrictions>
      <Triggers>
        <Trigger Type="Command" NameRef="next" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer />
    </Transition>
    <Transition Name="Approval_Job Creation_1" To="Job Creation" From="Approval" Classifier="Direct" AllowConcatenationType="And" RestrictConcatenationType="And" ConditionsConcatenationType="And" IsFork="false" MergeViaSetState="false" DisableParentStateControl="false">
      <Restrictions>
        <Restriction Type="Allow" NameRef="OrgAdmin" />
      </Restrictions>
      <Triggers>
        <Trigger Type="Command" NameRef="next" />
      </Triggers>
      <Conditions>
        <Condition Type="Always" />
      </Conditions>
      <Designer />
    </Transition>
  </Transitions>
</Process>');
