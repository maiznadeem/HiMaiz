// Used by `npm run studio` (Remotion Studio). The render scripts pass the same override in code.
import { Config } from "@remotion/cli/config";
import { withScene } from "./scripts/lib/webpack";

Config.overrideWebpackConfig((config) => withScene(config, process.env.VIDEO_SCENE_FILE ?? ""));
