import APVerify from "./APVerify.svelte";
import Configuration from "./Configuration.svelte";
import CreateEntry from "./CreateEntry.svelte";
import Download from "./Download.svelte";
import GPConfiguration from "./GPConfiguration.svelte";
import GPVerify from "./GPVerify.svelte";
import MakeItLive from "./MakeItLive.svelte";
import Pending from "./Pending.svelte";
import ReadinessCheck from "./ReadinessCheck.svelte";
import SynchronizeData from "./SynchronizeData.svelte";
import Upload from "./Upload.svelte";
import Verify from "./Verify.svelte";
import Waiting from "./Waiting.svelte";
import WVerify from "./WVerify.svelte";

export const instructions: {[key: string]: typeof Configuration} = {
  "ap_verify": APVerify,
  "configuration": Configuration,
  "create_entry": CreateEntry,
  "download": Download,
  "gp_configuration": GPConfiguration,
  "gp_verify": GPVerify,
  "make_it_live": MakeItLive,
  "pending": Pending,
  "readiness_check": ReadinessCheck,
  "synchronize_data": SynchronizeData,
  "upload": Upload,
  "verify": Verify,
  "waiting": Waiting,
  "w_verify": WVerify
};