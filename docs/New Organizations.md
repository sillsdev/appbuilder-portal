
![SIL Logo](./images/SIL_logo.png)
# ![Scriptoria Logo](./images/quill_ink.png)Scriptoria New Organizations

When adding a new organization to Scriptoria, there is certain information and credentials that are added to Scriptoria by a Scriptoria administrator. Please consult with the Scriptoria administrator if you have any questions about the items below.

**Configuration**

1. Organization Name  
2. Organization Website URL  
3. Organization Logo (square image (jpeg or png) to display in the Scriptoria website \-- 128x128 or larger)

**Google Play API Key**  
To automate the publishing to Google Play, we will need a Google Play API Key in a JSON file from each of the Google Play Store developer accounts that you want to publish to. Here are instructions on creating this JSON file:

[https://scriptoria.io/docs/Creating+a+Google+Play+API+Key.pdf](https://scriptoria.io/docs/Creating+a+Google+Play+API+Key.pdf) 

**Signing Android Apps**  
When publishing to the Google Play Store, each update to the app must be signed with the same keystore as it was originally published. We support a few options for managing which keystore is used to sign the app. Multiple of these options can be used. They are listed in order of our preference.

Note: A separate keystore can be used on the project owner's machine for testing. The project owner doesn't need to use the publishing keystore to test the app.

**Organization Keystore**  
Scriptoria was originally designed to have all apps published using a single organization keystore. The keystore file, keystore password, key alias, and key password needs to be sent to the Scriptoria administrator (via email or some shared file service) so that they are securely stored where only the Scriptoria application and Scriptoria administrator have access to the files. With this option, the keystore specified in the  "Signing (Android)" tab is ignored.

**Build Keystore**  
You may have existing apps that have already been published using different keystores. Each of these can be stored in Scriptoria like the organization keystore.  In Scripture App Builder, there are publishing properties and project owner would set BUILD\_KEYSTORE with the keystore name.  Similar to the organization keystore, the keystore file, keystore password, key alias, and key password needs to be sent to the Scriptoria administrator for each of the keystores. In this option, the keystore specified in the "Signing (Android)" tab is ignored. You can review the documentation for setting publishing properties here:

[https://scriptoria.io/docs/Publishing+Properties.pdf](https://scriptoria.io/docs/Publishing+Properties.pdf) 

**Project Keystore**  
If the project owner has the publishing keystore file and would prefer to have the keystore password, key alias, and key password values used from the project, then just the keystore file can be sent to the Scriptoria administrator and the settings in the project can be used.  The project owner has to be careful to maintain the signing settings in the project.

**Workflow**  
Scriptoria publishes content using a Publishing Workflow which guides the publishing process. Some steps are automated, some steps are done by the project owner, and some steps must be done by the organization administrator (someone who has access to the Google Play Developer Console). Here are a few different scenarios. Please let me know which scenario best fits your organization.

**Default Workflow**  
Scriptoria was originally designed to allow anyone in an organization to request a project and then add products (e.g. publish an Android App to Google Play). The request would be approved by an organization administrator who understands the publishing process to Google Play and who has access to the Google Play Developer Console. This administrator will also guide the project owners in the formatting of the Google Play listing information.

**Low Admin Workflow**  
In some organizations, the project owners are well-known and trained people. There is not a need for the approval process. However, the project owners don't have access to the Google Play Developer Console. There are just a few people in the organization who handle the responsibility. In this case, there is still an organization administrator who handles the steps related to Google Play.

**Owner Admin Workflow**  
In other organizations, the users are both the project owner and have access to the Google Play Developer Console. They are experienced with the whole process and do not need an organization administrator.

You can review the documentation for the workflow steps here:

[https://scriptoria.io/docs/Help+Guide+for+Scriptoria.pdf](https://scriptoria.io/docs/Help+Guide+for+Scriptoria.pdf)  (see Publishing Workflow section).  
