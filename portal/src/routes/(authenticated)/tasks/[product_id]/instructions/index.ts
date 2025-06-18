import App_Configuration from "./App_Configuration.svelte";
import Approval_Pending from "./Approval_Pending.svelte";
import Asset_Package_Verify_And_Publish from "./Asset_Package_Verify_And_Publish.svelte";
import Authors_Download from "./Authors_Download.svelte";
import Authors_Upload from "./Authors_Upload.svelte";
import Create_App_Entry from "./Create_App_Entry.svelte";
import GooglePlay_Configuration from "./GooglePlay_Configuration.svelte";
import GooglePlay_Verify_And_Publish from "./GooglePlay_Verify_And_Publish.svelte";
import Make_It_Live from "./Make_It_Live.svelte";
import Readiness_Check from "./Readiness_Check.svelte";
import Synchronize_Data from "./Synchronize_Data.svelte";
import Verify_And_Publish from "./Verify_And_Publish.svelte";
import Waiting from "./Waiting.svelte";
import Web_Verify from "./Web_Verify.svelte";

export const instructions: Record<string, typeof Waiting> = {
  "asset_package_verify_and_publish": Asset_Package_Verify_And_Publish,
  "app_configuration": App_Configuration,
  // may need to add "author_app_configuration" later
  // in S1 it has the same instructions as "app_configuration"
  "create_app_entry": Create_App_Entry,
  "authors_download": Authors_Download,
  "googleplay_configuration": GooglePlay_Configuration,
  "googleplay_verify_and_publish": GooglePlay_Verify_And_Publish,
  "make_it_live": Make_It_Live,
  "approval_pending": Approval_Pending,
  "readiness_check": Readiness_Check,
  "synchronize_data": Synchronize_Data,
  "authors_upload": Authors_Upload,
  "verify_and_publish": Verify_And_Publish,
  "waiting": Waiting,
  "web_verify": Web_Verify
};